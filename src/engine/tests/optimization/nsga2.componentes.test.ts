/**
 * Tests unitarios por componente del NSGA-II (src/optimization/nsga2.ts), previos a los
 * benchmarks integrados (tests/benchmarks/) -- orden requerido por el propio nsga2.ts:
 * los 5 componentes se testean de forma aislada antes de validar el algoritmo completo.
 *
 * Componentes:
 *   1. decodificarVariable (tipos continua / discreta / discreta_categorica)
 *   2. esDominante + ordenamientoNoDominado (dominancia restringida)
 *   3. asignarDistanciaCrowding
 *   4. cruceSBX / mutacionPolinomial
 *   5. seleccionarTorneo
 */

import { describe, it, expect } from "vitest";
import {
  decodificarVariable,
  esDominante,
  ordenamientoNoDominado,
  asignarDistanciaCrowding,
  cruceSBX,
  mutacionPolinomial,
  seleccionarTorneo,
  type SolucionNSGA2,
} from "../../src/optimization/nsga2";

function mkSol(
  objetivos: number[],
  violacionTotal: number,
  rangoFrente = 0,
  distanciaCrowding = 0,
): SolucionNSGA2 {
  return {
    genotipo: [],
    valores: [],
    objetivos,
    restricciones: [],
    violacionTotal,
    rangoFrente,
    distanciaCrowding,
  };
}

describe("decodificarVariable (gen normalizado [0,1] -> valor real)", () => {
  it("continua: mapea linealmente al rango", () => {
    const def = { id: "x", tipo: "continua" as const, rango: [0.2, 1.2] as [number, number] };
    expect(decodificarVariable(def, 0)).toBeCloseTo(0.2, 10);
    expect(decodificarVariable(def, 1)).toBeCloseTo(1.2, 10);
    expect(decodificarVariable(def, 0.5)).toBeCloseTo(0.7, 10);
  });

  it("discreta: redondea al item del catalogo mas cercano", () => {
    const def = { id: "d", tipo: "discreta" as const, catalogo: [10, 12, 16, 20, 25, 32] };
    expect(decodificarVariable(def, 0)).toBe(10);
    expect(decodificarVariable(def, 1)).toBe(32);
    expect(decodificarVariable(def, 0.5)).toBe(20);
    expect(decodificarVariable(def, 0.2)).toBe(12); // round(0.2*5)=1 -> catalogo[1]
    expect(decodificarVariable(def, 0.35)).toBe(16); // round(0.35*5)=2 -> catalogo[2]
  });

  it("discreta_categorica: idem que discreta", () => {
    const def = { id: "c", tipo: "discreta_categorica" as const, catalogo: [420, 500] };
    expect(decodificarVariable(def, 0)).toBe(420);
    expect(decodificarVariable(def, 1)).toBe(500);
    expect([420, 500]).toContain(decodificarVariable(def, 0.3));
  });

  it("discreta sin catalogo: falla explicitamente", () => {
    const def = { id: "x", tipo: "discreta" as const, catalogo: undefined };
    expect(() => decodificarVariable(def, 0.5)).toThrow(/catalogo/);
  });
});

describe("esDominante (dominancia restringida)", () => {
  it("dos factibles: domina el que es estrictamente mejor en al menos un objetivo", () => {
    expect(esDominante(mkSol([1, 2], 0), mkSol([2, 2], 0))).toBe(true);
    expect(esDominante(mkSol([2, 2], 0), mkSol([1, 2], 0))).toBe(false);
    expect(esDominante(mkSol([2, 2], 0), mkSol([2, 2], 0))).toBe(false); // iguales: no domina
  });

  it("factible domina a infactible aunque tenga peores objetivos", () => {
    expect(esDominante(mkSol([5, 5], 0), mkSol([0, 0], 4))).toBe(true);
    expect(esDominante(mkSol([0, 0], 4), mkSol([5, 5], 0))).toBe(false);
  });

  it("dos infactibles: domina el de menor violacion total", () => {
    expect(esDominante(mkSol([9, 9], 1), mkSol([1, 1], 5))).toBe(true);
    expect(esDominante(mkSol([1, 1], 5), mkSol([9, 9], 1))).toBe(false);
  });
});

describe("ordenamientoNoDominado (fast non-dominated sort)", () => {
  it("separa frentes anidados de una cadena de dominancia", () => {
    const sols = [
      mkSol([1, 1], 0),
      mkSol([2, 2], 0),
      mkSol([3, 3], 0),
      mkSol([4, 4], 0),
    ];
    const frentes = ordenamientoNoDominado(sols);
    expect(frentes).toEqual([[0], [1], [2], [3]]);
  });

  it("agrupa en un solo frente soluciones mutuamente no dominadas", () => {
    const sols = [
      mkSol([1, 4], 0),
      mkSol([2, 3], 0),
      mkSol([3, 2], 0),
      mkSol([4, 1], 0),
    ];
    const frentes = ordenamientoNoDominado(sols);
    expect(frentes[0].sort()).toEqual([0, 1, 2, 3]);
  });

  it("aplica dominancia restringida: factible siempre en frente 0, infactibles ordenados por violacion", () => {
    const sols = [
      mkSol([1, 1], 0), // factible
      mkSol([0, 0], 5), // infactible, mejores objetivos
      mkSol([2, 2], 3), // infactible
    ];
    const frentes = ordenamientoNoDominado(sols);
    expect(frentes[0]).toEqual([0]);
    expect(frentes[1]).toEqual([2]);
    expect(frentes[2]).toEqual([1]);
  });
});

describe("asignarDistanciaCrowding", () => {
  it("asigna infinito a los extremos y crowding proporcional a los del medio", () => {
    const sols = [
      mkSol([1, 3], 0),
      mkSol([2, 2], 0),
      mkSol([3, 1], 0),
      mkSol([4, 0], 0),
    ];
    asignarDistanciaCrowding([0, 1, 2, 3], sols);
    expect(sols[0].distanciaCrowding).toBe(Number.POSITIVE_INFINITY);
    expect(sols[3].distanciaCrowding).toBe(Number.POSITIVE_INFINITY);
    expect(sols[1].distanciaCrowding).toBeCloseTo(4 / 3, 10);
    expect(sols[2].distanciaCrowding).toBeCloseTo(4 / 3, 10);
  });

  it("con 2 puntos o menos, ambos quedan en infinito", () => {
    const sols = [mkSol([1, 1], 0), mkSol([2, 2], 0)];
    asignarDistanciaCrowding([0, 1], sols);
    expect(sols[0].distanciaCrowding).toBe(Number.POSITIVE_INFINITY);
    expect(sols[1].distanciaCrowding).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("cruceSBX", () => {
  it("los hijos permanecen dentro de [0,1]", () => {
    const p1 = [0.0, 0.9];
    const p2 = [0.9, 0.0];
    for (let i = 0; i < 20; i++) {
      const u = 0.001 + i / 20;
      const [c1, c2] = cruceSBX(p1, p2, () => u);
      for (const v of [...c1, ...c2]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it("los hijos no son copias identicas cuando los padres difieren", () => {
    const p1 = [0.2, 0.8];
    const p2 = [0.8, 0.2];
    const [c1, c2] = cruceSBX(p1, p2, () => 0.7);
    expect(c1).not.toEqual(p1);
    expect(c2).not.toEqual(p2);
  });
});

describe("mutacionPolinomial", () => {
  it("sin probabilidad devuelve una copia sin cambios", () => {
    const g = [0.3, 0.6, 0.9];
    const hijo = mutacionPolinomial(g, () => 0.5, 0);
    expect(hijo).toEqual(g);
    expect(hijo).not.toBe(g); // copia, no la misma referencia
  });

  it("con probabilidad 1 muta pero respeta [0,1]", () => {
    const g = [0.5, 0.5, 0.5];
    let u = 0.1; // dentro de [0,1]
    const hijo = mutacionPolinomial(g, () => (u = (u + 0.05) % 1), 1);
    for (const v of hijo) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe("seleccionarTorneo", () => {
  it("prefiere el de menor rango de frente", () => {
    const a = mkSol([1, 1], 0, 0, 0.5);
    const b = mkSol([1, 1], 0, 1, 10);
    const aleatorio = (() => {
      let i = 0;
      return () => (i++ % 2 === 0 ? 0.0 : 0.999); // elige a luego b
    })();
    expect(seleccionarTorneo([a, b], aleatorio)).toBe(a);
  });

  it("a igual rango, prefiere el de mayor crowding", () => {
    const a = mkSol([1, 1], 0, 0, 0.5);
    const b = mkSol([1, 1], 0, 0, 1.5);
    const aleatorio = (() => {
      let i = 0;
      return () => (i++ % 2 === 0 ? 0.0 : 0.999);
    })();
    expect(seleccionarTorneo([a, b], aleatorio)).toBe(b);
  });
});
/**
 * Valida la implementacion propia de NSGA-II (src/optimization/nsga2.ts) contra el
 * problema de prueba ZDT1 (Zitzler-Deb-Thiele 1), uno de los benchmarks estandar de la
 * literatura de optimizacion multiobjetivo, usado en el paper original de NSGA-II
 * (Deb et al., 2002) -- ver docs/tesis/referencias.bib, clave "deb2002".
 *
 * ZDT1 tiene un frente de Pareto conocido analiticamente (f2 = 1 - sqrt(f1), con
 * f1 en [0,1]), lo que permite verificar convergencia y cobertura del frente obtenido
 * sin depender de ningun caso de puentes propio -- es la forma de demostrar que el
 * ALGORITMO es correcto, independientemente del problema de ingenieria civil.
 *
 * Criterios de aceptacion (definidos ANTES de correr, ver docs/software/plan-de-validacion.md):
 *   - Distancia generacional (GD) al frente analitico < 0.02
 *   - Indice de spread Delta (Deb et al., 2002, ec. 9) < 0.5 (buena distribucion)
 *   - Cobertura: el frente obtenido abarca casi todo [0,1] en f1 (min < 0.1, max > 0.9)
 *
 * La semilla fija hace el test determinista (reproducible entre corridas y entornos).
 */

import { describe, it, expect } from "vitest";
import { optimizarNSGA2 } from "../../src/optimization/nsga2";
import {
  distanciaGeneracional,
  indiceSpread,
} from "../../src/optimization/metricasFrente";
import {
  crearProblemaZDT1,
  frenteAnaliticoZDT1,
} from "../../src/optimization/problemasBenchmark";

const PROBLEMA = crearProblemaZDT1(30);
const FRENTE_ANALITICO = frenteAnaliticoZDT1(500);
const EXTREMOS = [
  [0, 1],
  [1, 0],
];

describe("NSGA-II vs ZDT1 (benchmark estandar de la literatura)", () => {
  it("converge al frente de Pareto analitico dentro de la tolerancia definida", () => {
    const resultado = optimizarNSGA2(PROBLEMA, {
      poblacion: 100,
      generaciones: 500,
      probabilidadCruce: 0.9,
      probabilidadMutacion: 1 / 30,
      semilla: 42,
    });

    const frente = resultado.frentePareto.map((s) => s.objetivos);
    expect(frente.length).toBeGreaterThan(0);

    const gd = distanciaGeneracional(frente, FRENTE_ANALITICO);
    expect(gd).toBeLessThan(0.02);

    const delta = indiceSpread(frente, EXTREMOS);
    expect(delta).toBeLessThan(0.5);
  });

  it("cubre casi todo el rango del frente analitico (diversidad)", () => {
    const resultado = optimizarNSGA2(PROBLEMA, {
      poblacion: 100,
      generaciones: 500,
      probabilidadCruce: 0.9,
      probabilidadMutacion: 1 / 30,
      semilla: 42,
    });

    const f1s = resultado.frentePareto.map((s) => s.objetivos[0]);
    expect(Math.min(...f1s)).toBeLessThan(0.1);
    expect(Math.max(...f1s)).toBeGreaterThan(0.9);
  });
});
/**
 * Valida NSGA-II contra el problema de prueba SRN (Srinivas), tambien usado en el paper
 * original de Deb et al. (2002) -- a diferencia de ZDT1, SRN incluye RESTRICCIONES, lo
 * cual es mas representativo de nuestro caso real (que tiene restricciones normativas
 * R1-R11, ver docs/software/algoritmo-nsga2.md).
 *
 * El frente de Pareto verdadero de SRN se aproxima en el test con un barrido denso
 * determinista del espacio de decision (metodo independiente del NSGA-II) -- ver
 * frenteReferenciaSRN() en problemasBenchmark.ts.
 *
 * Criterios de aceptacion (definidos ANTES de correr, ver docs/software/plan-de-validacion.md):
 *   - >= 95% de las soluciones del frente obtenido son factibles (g1, g2 <= 0)
 *   - las soluciones factibles del frente son mutuamente no dominadas
 *   - distancia generacional (GD) al frente de referencia (objetivos normalizados a [0,1])
 *     < 0.05, y el frente obtenido cubre una parte sustancial del rango del de referencia
 *
 * La semilla fija hace el test determinista (reproducible entre corridas y entornos).
 */

import { describe, it, expect } from "vitest";
import { optimizarNSGA2, esDominante } from "../../src/optimization/nsga2";
import {
  distanciaGeneracional,
  normalizarFrente,
} from "../../src/optimization/metricasFrente";
import { problemaSRN, frenteReferenciaSRN } from "../../src/optimization/problemasBenchmark";

const FRENTE_REFERENCIA = frenteReferenciaSRN(0.1);
const MINIMOS = [
  Math.min(...FRENTE_REFERENCIA.map((p) => p[0])),
  Math.min(...FRENTE_REFERENCIA.map((p) => p[1])),
];
const MAXIMOS = [
  Math.max(...FRENTE_REFERENCIA.map((p) => p[0])),
  Math.max(...FRENTE_REFERENCIA.map((p) => p[1])),
];

describe("NSGA-II vs SRN (benchmark con restricciones)", () => {
  it("converge al frente de Pareto de SRN respetando las restricciones", () => {
    const resultado = optimizarNSGA2(problemaSRN, {
      poblacion: 100,
      generaciones: 250,
      probabilidadCruce: 0.9,
      probabilidadMutacion: 0.5,
      semilla: 42,
    });

    const frente = resultado.frentePareto;
    expect(frente.length).toBeGreaterThan(0);

    const factibles = frente.filter((s) => s.violacionTotal <= 0);
    expect(factibles.length / frente.length).toBeGreaterThanOrEqual(0.95);

    const objetivosFactibles = factibles.map((s) => s.objetivos);
    const gd = distanciaGeneracional(
      normalizarFrente(objetivosFactibles, MINIMOS, MAXIMOS),
      normalizarFrente(FRENTE_REFERENCIA, MINIMOS, MAXIMOS),
    );
    expect(gd).toBeLessThan(0.05);
  });

  it("las soluciones factibles del frente obtenido son mutuamente no dominadas", () => {
    const resultado = optimizarNSGA2(problemaSRN, {
      poblacion: 100,
      generaciones: 250,
      probabilidadCruce: 0.9,
      probabilidadMutacion: 0.5,
      semilla: 42,
    });

    const factibles = resultado.frentePareto.filter((s) => s.violacionTotal <= 0);
    for (let i = 0; i < factibles.length; i++) {
      for (let j = i + 1; j < factibles.length; j++) {
        expect(esDominante(factibles[i], factibles[j])).toBe(false);
        expect(esDominante(factibles[j], factibles[i])).toBe(false);
      }
    }
  });

  it("el frente obtenido cubre una parte sustancial del rango del de referencia", () => {
    const resultado = optimizarNSGA2(problemaSRN, {
      poblacion: 100,
      generaciones: 250,
      probabilidadCruce: 0.9,
      probabilidadMutacion: 0.5,
      semilla: 42,
    });

    const factibles = resultado.frentePareto.filter((s) => s.violacionTotal <= 0);
    const normalizado = normalizarFrente(
      factibles.map((s) => s.objetivos),
      MINIMOS,
      MAXIMOS,
    );
    const f1s = normalizado.map((p) => p[0]);
    const f2s = normalizado.map((p) => p[1]);
    expect(Math.max(...f1s) - Math.min(...f1s)).toBeGreaterThan(0.5);
    expect(Math.max(...f2s) - Math.min(...f2s)).toBeGreaterThan(0.5);
  });
});
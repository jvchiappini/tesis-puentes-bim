/**
 * Problemas de prueba de la literatura usados para validar el NSGA-II propio
 * (tests/benchmarks/) -- los mismos del paper original de Deb et al. 2002
 * (ver docs/tesis/referencias.bib, clave "deb2002").
 *
 * ZDT1: sin restricciones, frente de Pareto conocido analiticamente
 *       (f2 = 1 - sqrt(f1)). Valida convergencia y diversidad.
 * SRN:  con restricciones (g1, g2). Valida ademas el manejo de restricciones
 *       por dominancia restringida.
 */

import type { ProblemaOptimizacion } from "./nsga2";

/**
 * ZDT1 (Zitzler-Deb-Thiele 1), 30 variables, sin restricciones.
 * Frente de Pareto: f2 = 1 - sqrt(f1), con f1 en [0, 1].
 */
export function crearProblemaZDT1(n: number = 30): ProblemaOptimizacion {
  return {
    variables: Array.from({ length: n }, (_, i) => ({
      id: `x${i + 1}`,
      tipo: "continua" as const,
      rango: [0, 1] as [number, number],
    })),
    evaluar: (x) => {
      const f1 = x[0];
      const suma = x.slice(1).reduce((a, b) => a + b, 0);
      const g = 1 + (9 / (n - 1)) * suma;
      const f2 = g * (1 - Math.sqrt(f1 / g));
      return { objetivos: [f1, f2], restricciones: [] };
    },
  };
}

/** Frente de Pareto analitico de ZDT1: f2 = 1 - sqrt(f1), f1 en [0, 1]. */
export function frenteAnaliticoZDT1(puntos: number = 500): number[][] {
  return Array.from({ length: puntos }, (_, i) => {
    const f1 = (i + 1) / puntos;
    return [f1, 1 - Math.sqrt(f1)];
  });
}

/**
 * SRN (Srinivas), 2 variables en [-20, 20], con dos restricciones g1, g2 <= 0:
 *   f1 = 2 + (x1-2)^2 + (x2-1)^2
 *   f2 = 9*x1 - (x2-1)^2
 *   g1 = x1^2 + x2^2 - 225 <= 0
 *   g2 = x1 - 3*x2 + 10 <= 0
 */
export const problemaSRN: ProblemaOptimizacion = {
  variables: [
    { id: "x1", tipo: "continua", rango: [-20, 20] },
    { id: "x2", tipo: "continua", rango: [-20, 20] },
  ],
  evaluar: (x) => {
    const [x1, x2] = x;
    const f1 = 2 + (x1 - 2) ** 2 + (x2 - 1) ** 2;
    const f2 = 9 * x1 - (x2 - 1) ** 2;
    const g1 = x1 ** 2 + x2 ** 2 - 225;
    const g2 = x1 - 3 * x2 + 10;
    return { objetivos: [f1, f2], restricciones: [g1, g2] };
  },
};

/**
 * Frente de Pareto de referencia de SRN calculado por barrido denso determinista del
 * espacio de decision (metodo independiente del NSGA-II, usado solo como referencia en
 * los tests). Devuelve los puntos factibles no dominados.
 */
export function frenteReferenciaSRN(paso: number = 0.1): number[][] {
  const puntos: number[][] = [];
  for (let x1 = -20; x1 <= 20 + 1e-9; x1 += paso) {
    for (let x2 = -20; x2 <= 20 + 1e-9; x2 += paso) {
      const g1 = x1 ** 2 + x2 ** 2 - 225;
      const g2 = x1 - 3 * x2 + 10;
      if (g1 > 0 || g2 > 0) continue;
      const f1 = 2 + (x1 - 2) ** 2 + (x2 - 1) ** 2;
      const f2 = 9 * x1 - (x2 - 1) ** 2;
      puntos.push([f1, f2]);
    }
  }
  const noDominados: number[][] = [];
  for (const p of puntos) {
    let dominado = false;
    for (const q of puntos) {
      if (q === p) continue;
      let mejor = false;
      let noPeor = true;
      for (let i = 0; i < 2; i++) {
        if (q[i] > p[i] + 1e-12) noPeor = false;
        if (q[i] < p[i] - 1e-12) mejor = true;
      }
      if (mejor && noPeor) {
        dominado = true;
        break;
      }
    }
    if (!dominado) noDominados.push(p);
  }
  return noDominados;
}
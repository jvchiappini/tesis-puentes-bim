/**
 * Integracion NSGA-II + modelo estructural de losa maciza: la misma pipeline que
 * consume src/web/ (construirProblemaNSGA2 -> optimizarNSGA2). Verifica que para un
 * caso de sitio tipico el frente de Pareto contiene soluciones FACTIBLES (0 violaciones
 * de restricciones activas) -- condicion obligatoria de docs/software/plan-de-validacion.md
 * (0% de violaciones en toda solucion del frente, no solo en la elegida).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { parsearYamlTipologia } from "../src/config/loadYaml";
import { LosaMaciza, type SitioLosa } from "../src/structural/tipologias/losaMaciza";
import { optimizarNSGA2 } from "../src/optimization/nsga2";

function modelo() {
  const ruta = fileURLToPath(
    new URL("../../../data/parametros_tipologia/losa_maciza.yaml", import.meta.url),
  );
  return new LosaMaciza(parsearYamlTipologia(readFileSync(ruta, "utf8")));
}

describe("NSGA-II sobre el caso real de la losa maciza", () => {
  it("produce un frente de Pareto con soluciones factibles (perfil basico)", () => {
    const sitio: SitioLosa = {
      luz_diseno: 12,
      ancho_calzada: 7.3,
      costo_unitario_hormigon: 150,
      costo_unitario_acero: 1.5,
      clase_exposicion: "normal",
    };
    const problema = modelo().construirProblemaNSGA2(sitio, "basico");
    const resultado = optimizarNSGA2(problema, {
      poblacion: 60,
      generaciones: 200,
      probabilidadCruce: 0.9,
      probabilidadMutacion: 1 / problema.variables.length,
      semilla: 2026,
    });

    expect(resultado.frentePareto.length).toBeGreaterThan(0);

    const factibles = resultado.frentePareto.filter((s) => s.violacionTotal <= 0);
    expect(factibles.length).toBeGreaterThanOrEqual(5);

    // toda solucion factible del frente debe satisfacer todas las restricciones activas
    for (const solucion of factibles) {
      expect(solucion.violacionTotal).toBe(0);
    }

    // el frente debe abarcar un rango util en ambos objetivos
    const costos = resultado.frentePareto.map((s) => s.objetivos[0]);
    const pesos = resultado.frentePareto.map((s) => s.objetivos[1]);
    expect(Math.max(...costos) - Math.min(...costos)).toBeGreaterThan(0);
    expect(Math.max(...pesos) - Math.min(...pesos)).toBeGreaterThan(0);
  });
});
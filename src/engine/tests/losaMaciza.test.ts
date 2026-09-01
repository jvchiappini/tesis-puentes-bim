/**
 * Valida el modelo estructural de Losa Maciza (src/structural/tipologias/losaMaciza.ts)
 * contra un caso calculado a mano, con las tolerancias de
 * docs/software/plan-de-validacion.md (+-2% momento resistente, 0% violaciones de
 * restricciones activas en un diseno factible).
 *
 * Caso de referencia (calculado a mano):
 *   luz = 10 m, ancho = 7,30 m, clase exposicion normal.
 *   h = 0,75 m;  diam principal = 25 mm c/ 0,15 m;  diam reparticion = 12 mm c/ 0,30 m;
 *   f'c = 25 MPa; fy = 420 MPa; recubrimiento = 2,5 cm.
 *
 *   w_DL = 24*0,75 + 24*0,05 = 18,0 + 1,2 = 19,2 kN/m2          (gammaHA y rodadura: Tabla 4.2_7)
 *   M_DL = 19,2*10^2/8 = 240 kN·m/m
 *   As   = (pi*25^2/4)/0,15 = 490,87/0,15 = 3272,5 mm2/m = 3,2725e-3 m2/m
 *   d    = 0,75 - 0,025 - 0,0125 = 0,7125 m
 *   a    = As*fy/(0,85*f'c*b) = 3,2725e-3*420/(0,85*25) = 0,06466 m
 *   phiMn= 0,90*As*fy*(d - a/2) = 0,90*3,2725e-3*420*(0,7125 - 0,03233)
 *        = 0,90*1,3745*0,68017 = 841,6 kN·m/m
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { parsearYamlTipologia } from "../src/config/loadYaml";
import { LosaMaciza, type EntradaLosa } from "../src/structural/tipologias/losaMaciza";

function configuracionLosa() {
  const ruta = fileURLToPath(
    new URL("../../../data/parametros_tipologia/losa_maciza.yaml", import.meta.url),
  );
  return parsearYamlTipologia(readFileSync(ruta, "utf8"));
}

function entradaDiseno(): EntradaLosa {
  return {
    luz_diseno: 10,
    ancho_calzada: 7.3,
    clase_exposicion: "normal",
    costo_unitario_hormigon: 150,
    costo_unitario_acero: 1.5,
    espesor_losa: 0.75,
    diametro_armadura_principal: 25,
    separacion_armadura_principal: 0.15,
    diametro_armadura_reparticion: 12,
    separacion_armadura_reparticion: 0.15,
    resistencia_hormigon: 25,
    grado_acero: 420,
    recubrimiento: 0.025,
    numero_capas_armadura: 1,
    espesor_voladizo: 0.4,
  };
}

describe("LosaMaciza - validacion contra caso de referencia", () => {
  it("peso propio y momento por carga permanente coinciden con el calculo manual", () => {
    const losa = new LosaMaciza(configuracionLosa());
    const e = entradaDiseno();
    const sol = losa.calcularSolicitaciones(e);
    expect(sol.wPesoPropio).toBeCloseTo(19.2, 10);
    expect(sol.MPesoPropio).toBeCloseTo(240, 6);
  });

  it("momento resistente dentro de tolerancia (+-2%) del calculo manual", () => {
    const losa = new LosaMaciza(configuracionLosa());
    const sol = losa.calcularSolicitaciones(entradaDiseno());
    const phiMnManual = 841.6;
    expect(sol.phiMn).toBeGreaterThan(phiMnManual * 0.98);
    expect(sol.phiMn).toBeLessThan(phiMnManual * 1.02);
  });

  it("un diseno factible no viola ninguna restriccion activa (perfil basico)", () => {
    const losa = new LosaMaciza(configuracionLosa());
    const resultado = losa.evaluar(entradaDiseno(), "basico");
    for (const [nombre, g] of Object.entries(resultado.violaciones)) {
      expect(g, `restriccion ${nombre} violada`).toBeLessThanOrEqual(0);
    }
    expect(Object.keys(resultado.violaciones).length).toBeGreaterThan(0);
  });

  it("una losa muy delgada viola R4 (espesor minimo) y R1 (flexion)", () => {
    const losa = new LosaMaciza(configuracionLosa());
    const e = entradaDiseno();
    e.espesor_losa = 0.2;
    e.diametro_armadura_principal = 10;
    e.separacion_armadura_principal = 0.3;
    const resultado = losa.evaluar(e, "basico");
    expect(resultado.violaciones["R4_espesor_minimo_por_luz"]).toBeGreaterThan(0);
    expect(resultado.violaciones["R1_flexion_ELU"]).toBeGreaterThan(0);
  });

  it("clase de exposicion agresiva exige recubrimiento mayor (R5)", () => {
    const losa = new LosaMaciza(configuracionLosa());
    const e = entradaDiseno();
    e.clase_exposicion = "agresiva";
    expect(losa.recubrimientoRequerido("agresiva")).toBeCloseTo(0.05, 10);
    const resultado = losa.evaluar(e, "basico");
    expect(resultado.violaciones["R5_recubrimiento_minimo"]).toBeGreaterThan(0);
  });

  it("impacto: formula I = 50/(L+125) con L en pies, tope 30% (fraccion)", () => {
    const losa = new LosaMaciza(configuracionLosa());
    // L = 10 m = 32,81 ft -> I = 50/157,81 = 0,317 -> tope 0,30
    expect(losa.impacto(10)).toBeCloseTo(0.3, 10);
    // L = 6 m = 19,69 ft -> I = 50/144,69 = 0,346 -> tope 0,30
    expect(losa.impacto(6)).toBeCloseTo(0.3, 10);
    // L = 30 m = 98,43 ft -> I = 50/223,43 = 0,224 (sin tope)
    expect(losa.impacto(30)).toBeCloseTo(0.2238, 3);
  });
});
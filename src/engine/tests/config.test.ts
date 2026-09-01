/**
 * Tests de carga/validacion de configuracion (src/config/loadYaml.ts) y del evaluador
 * de expresiones parametrizadas (src/config/expresiones.ts).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { parsearYamlTipologia } from "../src/config/loadYaml";
import { evaluarExpresion } from "../src/config/expresiones";

function yamlLosa() {
  const ruta = fileURLToPath(
    new URL("../../../data/parametros_tipologia/losa_maciza.yaml", import.meta.url),
  );
  return readFileSync(ruta, "utf8");
}

describe("loadYaml - parseo y validacion", () => {
  it("parsea el YAML real de la losa y expone las secciones esperadas", () => {
    const config = parsearYamlTipologia(yamlLosa());
    expect(config.filosofia_normativa).toBe("aashto_standard_2002");
    expect(Object.keys(config.variables).length).toBe(10);
    expect(Object.keys(config.parametros_sitio).length).toBe(14);
    expect(config.parametros_normativos["cargas"]).toBeDefined();
    expect(Object.keys(config.perfiles)).toContain("basico");
  });

  it("rechaza O4 y R9 activos a la vez", () => {
    const yamlInvalido = yamlLosa().replace(
      "O4_deflexion_servicio:\n    activo: false",
      "O4_deflexion_servicio:\n    activo: true",
    );
    expect(() => parsearYamlTipologia(yamlInvalido)).toThrow(/O4_deflexion_servicio/);
  });

  it("rechaza filosofia_normativa desconocida", () => {
    const yamlInvalido = yamlLosa().replace(
      'filosofia_normativa: "aashto_standard_2002"',
      'filosofia_normativa: "aashto_standard_1962"',
    );
    expect(() => parsearYamlTipologia(yamlInvalido)).toThrow(/filosofia_normativa/);
  });

  it("rechaza un item sin campo activo", () => {
    const yamlInvalido = yamlLosa().replace(
      "V1_espesor_losa:\n    activo: true\n",
      "V1_espesor_losa:\n",
    );
    expect(() => parsearYamlTipologia(yamlInvalido)).toThrow(/activo/);
  });
});

describe("expresiones - evaluador seguro de formulas del YAML", () => {
  it("impacto: 50/(L+125)", () => {
    expect(evaluarExpresion("50/(L+125)", { L: 100 })).toBeCloseTo(50 / 225, 10);
  });

  it("espesor minimo: 1.2*(S+10)/30", () => {
    expect(evaluarExpresion("1.2*(S+10)/30", { S: 390 })).toBeCloseTo((1.2 * 400) / 30, 10);
  });

  it("reparticion: 100/sqrt(S)", () => {
    expect(evaluarExpresion("100/sqrt(S)", { S: 25 })).toBe(20);
  });

  it("numero de vias: floor(ancho/3.5)", () => {
    expect(evaluarExpresion("floor(ancho/3.5)", { ancho: 7.3 })).toBe(2);
    expect(evaluarExpresion("floor(ancho/3.5)", { ancho: 10.9 })).toBe(3);
  });

  it("funciones y precedencia", () => {
    expect(evaluarExpresion("2+3*4", {})).toBe(14);
    expect(evaluarExpresion("max(1,5,3)", {})).toBe(5);
    expect(evaluarExpresion("pow(2,10)", {})).toBe(1024);
  });

  it("falla con variable desconocida o sintaxis invalida", () => {
    expect(() => evaluarExpresion("50/(L+125)", {})).toThrow(/L/);
    expect(() => evaluarExpresion("2+", {})).toThrow(/Expresion invalida/);
  });
});
/**
 * Valida la generacion de IFC (src/bim/ifcGenerator.ts + iso19650Metadata.ts): el archivo
 * producido debe ser un STEP/IFC4 valido que web-ifc pueda RE-LEER, con la estructura
 * esperada (IFCPROJECT -> IFCSITE -> IFCSLAB), material y property set del diseno.
 *
 * Criterio: el archivo generado se reabre con web-ifc (mismo motor que lo escribe) y se
 * verifica la cantidad de entidades clave y la presencia de los Pset de diseno.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { IfcAPI } from "web-ifc";
import { parsearYamlTipologia } from "../src/config/loadYaml";
import { LosaMaciza, type EntradaLosa, type SitioLosa } from "../src/structural/tipologias/losaMaciza";
import { generarIFC, generarGlobalId, crearModeloIFC } from "../src/bim/ifcGenerator";

function disenoFactible(): { entrada: EntradaLosa; resultado: ReturnType<LosaMaciza["evaluar"]> } {
  const ruta = fileURLToPath(
    new URL("../../../data/parametros_tipologia/losa_maciza.yaml", import.meta.url),
  );
  const losa = new LosaMaciza(parsearYamlTipologia(readFileSync(ruta, "utf8")));
  const entrada: EntradaLosa = {
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
  const resultado = losa.evaluar(entrada, "basico");
  for (const g of Object.values(resultado.violaciones)) {
    expect(g).toBeLessThanOrEqual(0);
  }
  return { entrada, resultado };
}

describe("ifcGenerator - generacion IFC4 del puente losa maciza", () => {
  it("genera un archivo STEP/IFC4 con la estructura esperada", async () => {
    const { entrada, resultado } = disenoFactible();
    const datos = {
      nombre: "Puente losa maciza",
      descripcion: "Modelo de prueba generado por los tests del engine",
      luz: entrada.luz_diseno,
      ancho: entrada.ancho_calzada,
      espesor: entrada.espesor_losa,
      diseno: entrada,
      resultado,
    };
    const bytes = await generarIFC(datos);
    const texto = new TextDecoder().decode(bytes);

    expect(texto.startsWith("ISO-10303-21;")).toBe(true);
    expect(texto).toContain("FILE_SCHEMA(('IFC4'))");
    expect(texto).toContain("IFCPROJECT(");
    expect(texto).toContain("IFCSITE(");
    expect(texto).toContain("IFCSLAB(");
    expect(texto).toContain("IFCRELAGGREGATES(");
    expect(texto).toContain("IFCRELCONTAINEDINSPATIALSTRUCTURE(");
    expect(texto).toContain("IFCPROPERTYSET(");
    expect(texto).toContain("Pset_TesisDiseno");
    expect(texto).toContain("IFCMATERIAL(");
    // valores del diseno en el pset (IfcReal; web-ifc escribe 25. con punto)
    expect(texto).toContain("IFCREAL(0.75)");
    expect(texto).toContain("IFCREAL(25.)");
    expect(texto).toContain("AASHTO STANDARD 2002 / Manual");
  });

  it("el archivo generado puede re-leerse con web-ifc (OpenModel no falla) y contiene 1 de cada entidad clave", async () => {
    const { entrada, resultado } = disenoFactible();
    const api = new IfcAPI();
    await api.Init();
    const bytes = crearModeloIFC(api as never, {
      nombre: "Relectura",
      descripcion: "test",
      luz: entrada.luz_diseno,
      ancho: entrada.ancho_calzada,
      espesor: entrada.espesor_losa,
      diseno: entrada,
      resultado,
    });
    // Re-lectura con web-ifc (el mismo motor que lo escribe): no debe fallar.
    const modelID = api.OpenModel(bytes);
    expect(typeof modelID).toBe("number");
    api.CloseModel(modelID);

    // Conteo de entidades sobre el texto STEP (independiente del parseo).
    const texto = new TextDecoder().decode(bytes);
    const contar = (re: RegExp) => (texto.match(re) ?? []).length;
    expect(contar(/IFCPROJECT\(/g)).toBe(1);
    expect(contar(/IFCSITE\(/g)).toBe(1);
    expect(contar(/IFCSLAB\(/g)).toBe(1);
    expect(contar(/IFCPROPERTYSET\(/g)).toBe(1);
    expect(contar(/IFCRELAGGREGATES\(/g)).toBe(1);
    expect(contar(/IFCRELCONTAINEDINSPATIALSTRUCTURE\(/g)).toBe(1);
    expect(contar(/IFCMATERIAL\(/g)).toBe(1);
  });

  it("generarGlobalId produce 22 caracteres del alfabeto IFC y es determinista", () => {
    const a = generarGlobalId("losa");
    const b = generarGlobalId("losa");
    expect(a).toBe(b);
    expect(a).toHaveLength(22);
    expect(a).toMatch(/^[0-9A-Z_$]{22}$/);
  });
});
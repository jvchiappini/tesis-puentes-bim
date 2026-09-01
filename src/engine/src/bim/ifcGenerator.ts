/**
 * Generacion de modelo IFC en el navegador, usando web-ifc (WASM), conforme a los
 * lineamientos de ISO 19650 documentados en docs/software/bim-ifc.md.
 *
 * TODO (Agente Programador): integrar web-ifc (que soporta lectura Y escritura --
 * confirmado en docs/tesis/bitacora-busquedas.md), mapear la solucion optima
 * (geometria + propiedades estructurales) a entidades IFC y property sets. La API de
 * web-ifc es de mas bajo nivel que ifcopenshell (se arman entidades/property sets mas a
 * mano) -- ver ejemplos en la documentacion oficial de ThatOpen/engine_web-ifc antes de
 * implementar.
 */

export async function generarIFC(solucionOptima: unknown): Promise<Uint8Array> {
  throw new Error("TODO: implementar generacion de IFC con web-ifc");
}

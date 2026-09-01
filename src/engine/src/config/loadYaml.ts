/**
 * Carga data/parametros_tipologia/<tipologia>.yaml -- la unica fuente de verdad de
 * configuracion del proyecto (variables, parametros de sitio, objetivos, restricciones,
 * perfiles, filosofia_normativa). Nunca duplicar estos valores hardcodeados en TS.
 *
 * TODO (Agente Programador): implementar con `js-yaml`. Debe validar la estructura del
 * YAML al cargar y fallar explicitamente ante configuraciones invalidas -- por ejemplo,
 * O4_deflexion_servicio y R9_deflexion_servicio activos simultaneamente (ver
 * docs/software/algoritmo-nsga2.md).
 */

export async function cargarConfiguracionTipologia(rutaYaml: string): Promise<unknown> {
  throw new Error("TODO: implementar carga de YAML con js-yaml");
}

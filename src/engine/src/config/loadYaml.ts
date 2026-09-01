/**
 * Carga data/parametros_tipologia/<tipologia>.yaml -- la unica fuente de verdad de
 * configuracion del proyecto (variables, parametros de sitio, parametros normativos,
 * objetivos, restricciones, perfiles, filosofia_normativa). Nunca duplicar estos
 * valores hardcodeados en TS.
 *
 * Valida la estructura del YAML al cargar y falla explicitamente ante configuraciones
 * invalidas -- por ejemplo, O4_deflexion_servicio y R9_deflexion_servicio activos
 * simultaneamente (misma cantidad fisica modelada dos veces, ver
 * docs/software/algoritmo-nsga2.md). Nunca resuelve esa ambiguedad en silencio.
 */

import yaml from "js-yaml";

export type FilosofiaNormativa = "aashto_standard_2002" | "aashto_lrfd_2007";

export interface ItemActivable {
  activo: boolean;
  [clave: string]: unknown;
}

export interface PerfilTipologia {
  descripcion: string;
  variables_activas: string[];
  objetivos_activos: string[];
  restricciones_activas: string[];
}

export interface ConfiguracionTipologia {
  filosofia_normativa: FilosofiaNormativa;
  variables: Record<string, ItemActivable>;
  parametros_sitio: Record<string, ItemActivable>;
  parametros_normativos: Record<string, unknown>;
  objetivos: Record<string, ItemActivable>;
  restricciones: Record<string, ItemActivable>;
  perfiles: Record<string, PerfilTipologia>;
}

const FILOSOFIAS_VALIDAS: FilosofiaNormativa[] = ["aashto_standard_2002", "aashto_lrfd_2007"];

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function errorConfiguracion(mensaje: string): never {
  throw new Error(`Configuracion de tipologia invalida: ${mensaje}`);
}

function validarSeccionActivable(
  seccion: unknown,
  nombre: string,
): Record<string, ItemActivable> {
  if (!esRegistro(seccion)) errorConfiguracion(`seccion "${nombre}" debe ser un mapa`);
  for (const [clave, valor] of Object.entries(seccion)) {
    if (!esRegistro(valor) || typeof valor.activo !== "boolean") {
      errorConfiguracion(`item "${nombre}.${clave}" debe tener campo "activo" booleano`);
    }
  }
  return seccion as Record<string, ItemActivable>;
}

/** Verifica que O4 (objetivo) y R9 (restriccion) no esten activos a la vez en un conjunto dado. */
function verificarMutuaExclusion(
  objetivosActivos: string[],
  restriccionesActivas: string[],
  contexto: string,
): void {
  const o4 = objetivosActivos.includes("O4_deflexion_servicio");
  const r9 = restriccionesActivas.includes("R9_deflexion_servicio");
  if (o4 && r9) {
    errorConfiguracion(
      `${contexto}: O4_deflexion_servicio y R9_deflexion_servicio no pueden estar activos ` +
        `simultaneamente (son la misma cantidad fisica: deflexion de servicio). Desactivar una de las dos.`,
    );
  }
}

export function parsearYamlTipologia(textoYaml: string): ConfiguracionTipologia {
  let datos: unknown;
  try {
    datos = yaml.load(textoYaml);
  } catch (e) {
    errorConfiguracion(`YAML no parseable: ${(e as Error).message}`);
  }
  if (!esRegistro(datos)) errorConfiguracion("el documento YAML debe ser un mapa de nivel superior");

  const filosofia = datos.filosofia_normativa as FilosofiaNormativa;
  if (!FILOSOFIAS_VALIDAS.includes(filosofia)) {
    errorConfiguracion(
      `filosofia_normativa="${String(filosofia)}" no es valida. Opciones: ${FILOSOFIAS_VALIDAS.join(", ")}`,
    );
  }

  const configuracion: ConfiguracionTipologia = {
    filosofia_normativa: filosofia,
    variables: validarSeccionActivable(datos.variables, "variables"),
    parametros_sitio: validarSeccionActivable(datos.parametros_sitio, "parametros_sitio"),
    parametros_normativos: esRegistro(datos.parametros_normativos)
      ? (datos.parametros_normativos as Record<string, unknown>)
      : errorConfiguracion(`seccion "parametros_normativos" debe ser un mapa`),
    objetivos: validarSeccionActivable(datos.objetivos, "objetivos"),
    restricciones: validarSeccionActivable(datos.restricciones, "restricciones"),
    perfiles: {},
  };

  if (!esRegistro(datos.perfiles)) errorConfiguracion(`seccion "perfiles" debe ser un mapa`);

  const objetivosActivosBase = Object.entries(configuracion.objetivos)
    .filter(([, v]) => v.activo)
    .map(([k]) => k);
  const restriccionesActivasBase = Object.entries(configuracion.restricciones)
    .filter(([, v]) => v.activo)
    .map(([k]) => k);
  verificarMutuaExclusion(objetivosActivosBase, restriccionesActivasBase, "configuracion base");

  for (const [nombre, perfil] of Object.entries(datos.perfiles)) {
    if (!esRegistro(perfil)) errorConfiguracion(`perfil "${nombre}" debe ser un mapa`);
    const p = perfil as unknown as PerfilTipologia;
    if (!Array.isArray(p.variables_activas) || !Array.isArray(p.objetivos_activos) || !Array.isArray(p.restricciones_activas)) {
      errorConfiguracion(`perfil "${nombre}" debe definir variables_activas, objetivos_activos y restricciones_activas`);
    }
    verificarMutuaExclusion(p.objetivos_activos, p.restricciones_activas, `perfil "${nombre}"`);
    configuracion.perfiles[nombre] = p;
  }

  return configuracion;
}

/**
 * Carga la configuracion desde una URL/ruta (fetch). En el navegador conviene importar
 * el YAML como texto (?raw en Vite) y usar parsearYamlTipologia directamente.
 */
export async function cargarConfiguracionTipologia(rutaYaml: string): Promise<ConfiguracionTipologia> {
  const respuesta = await fetch(rutaYaml);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar "${rutaYaml}" (HTTP ${respuesta.status})`);
  }
  return parsearYamlTipologia(await respuesta.text());
}
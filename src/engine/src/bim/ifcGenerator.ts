/**
 * Generacion de modelo IFC (schema IFC4) en el navegador usando web-ifc (WASM), conforme
 * a los lineamientos de ISO 19650 documentados en docs/software/bim-ifc.md y con los
 * metadatos/property sets de bim/iso19650Metadata.ts.
 *
 * El modelo representa la solucion optima elegida del frente de Pareto como un puente
 * losa maciza: IFCPROJECT -> IFCSITE -> IFCSLAB (tablero) con geometria solida
 * (extrusion de seccion rectangular), material de hormigon y un property set
 * "Pset_TesisDiseno" con las variables de diseno, resultados estructurales y metadata.
 *
 * web-ifc soporta lectura Y escritura (confirmado en docs/tesis/bitacora-busquedas.md);
 * su API de escritura es de bajo nivel: cada argumento de tipo definido (IfcIdentifier,
 * IfcReal, IfcLabel, ...) se pasa como instancia del namespace IFC4 de web-ifc.
 */

import * as webIfcPkg from "web-ifc";
import type { EntradaLosa, ResultadoEvaluacion } from "../structural/tipologias/losaMaciza";
import {
  construirPropiedadesDiseno,
  crearMetadataISO19650,
  type MetadataISO19650,
} from "./iso19650Metadata";

// El runtime de web-ifc exporta los codigos de entidad como constantes sueltas (IFCPROJECT,
// IFCSLAB, ...) y el namespace IFC4 con las clases de tipos definidos (IfcIdentifier, ...).
const webIfc = webIfcPkg as unknown as Record<string, unknown>;
const CODIGO = webIfc as unknown as Record<string, number>;
const TIPOS = webIfc.IFC4 as unknown as Record<string, new (valor: unknown) => { value: unknown }>;

/** Interfaz minima de la API de web-ifc que usa el generador. */
export interface IfcAPICompatible {
  CreateModel(opciones: { projectID: number; name: string; schema: string }): number;
  CreateIfcEntity(modelID: number, tipo: number, ...args: unknown[]): unknown;
  WriteLine(modelID: number, entidad: unknown): void;
  SaveModel(modelID: number): Uint8Array;
  CloseModel(modelID: number): void;
}

export interface DatosIFC {
  nombre: string;
  descripcion: string;
  /** Luz del puente en m (profundidad de extrusion). */
  luz: number;
  /** Ancho del tablero en m. */
  ancho: number;
  /** Espesor de la losa en m. */
  espesor: number;
  diseno: EntradaLosa;
  resultado: ResultadoEvaluacion;
  metadata?: Partial<MetadataISO19650>;
}

const ALFABETO_GUID = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_$";

/** Genera un GlobalId IFC valido (22 caracteres del alfabeto IFC) determinista por semilla. */
export function generarGlobalId(semilla: string): string {
  let s = 0;
  for (const c of semilla) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  let resultado = "";
  for (let i = 0; i < 22; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    resultado += ALFABETO_GUID[s % ALFABETO_GUID.length];
  }
  return resultado;
}

function entidad<T = unknown>(
  api: IfcAPICompatible,
  modelID: number,
  codigo: keyof typeof CODIGO,
  ...args: unknown[]
): T {
  return api.CreateIfcEntity(modelID, CODIGO[codigo], ...args) as T;
}

/**
 * Construye el modelo IFC completo sobre una instancia de web-ifc YA inicializada.
 * Devuelve el archivo IFC (STEP/ISO-10303-21) como Uint8Array.
 */
export function crearModeloIFC(api: IfcAPICompatible, datos: DatosIFC): Uint8Array {
  const metadata = crearMetadataISO19650(datos.metadata);
  const modelID = api.CreateModel({ projectID: 0, name: datos.nombre, schema: "IFC4" });

  // --- Coordenadas y contexto geometrico -----------------------------------
  const origen = entidad(api, modelID, "IFCCARTESIANPOINT", [0.0, 0.0, 0.0]);
  const ejeZ = entidad(api, modelID, "IFCDIRECTION", [0.0, 0.0, 1.0]);
  const axisOrigen = entidad(api, modelID, "IFCAXIS2PLACEMENT3D", origen, null, null);
  const contexto = entidad(
    api,
    modelID,
    "IFCGEOMETRICREPRESENTATIONCONTEXT",
    null,
    "Model",
    3,
    1.0e-5,
    axisOrigen,
    null,
  );

  // --- Unidades ------------------------------------------------------------
  const sLongitud = entidad(api, modelID, "IFCSIUNIT", "LENGTHUNIT", null, "METRE");
  const sArea = entidad(api, modelID, "IFCSIUNIT", "AREAUNIT", null, "SQUARE_METRE");
  const sFuerza = entidad(api, modelID, "IFCSIUNIT", "FORCEUNIT", null, "NEWTON");
  const sPresion = entidad(api, modelID, "IFCSIUNIT", "PRESSUREUNIT", null, "PASCAL");
  const unidades = entidad(api, modelID, "IFCUNITASSIGNMENT", [sLongitud, sArea, sFuerza, sPresion]);

  // --- IFCPROJECT (portador de la metadata ISO 19650) ----------------------
  const proyecto = entidad(
    api,
    modelID,
    "IFCPROJECT",
    generarGlobalId("proyecto"),
    null,
    metadata.titulo,
    metadata.descripcion,
    "Puente",
    "Puente losa maciza de hormigon armado",
    metadata.fase,
    [contexto],
    unidades,
  );

  // --- IFCSITE + agregacion -------------------------------------------------
  const sitio = entidad(
    api,
    modelID,
    "IFCSITE",
    generarGlobalId("sitio"),
    null,
    "Sitio - " + datos.nombre,
    "Emplazamiento del puente",
    "Sitio",
    null,
    null,
    "Sitio del puente",
    "ELEMENT",
    null,
    null,
    0.0,
    null,
    null,
  );
  const agregarSitio = entidad(
    api,
    modelID,
    "IFCRELAGGREGATES",
    generarGlobalId("agrega-sitio"),
    null,
    "Agregacion de sitio al proyecto",
    null,
    proyecto,
    [sitio],
  );

  // --- Geometria del tablero (losa maciza) ----------------------------------
  const perfil = entidad(
    api,
    modelID,
    "IFCRECTANGLEPROFILEDEF",
    "AREA",
    "Seccion transversal losa",
    null,
    datos.ancho,
    datos.espesor,
  );
  const direccion = entidad(api, modelID, "IFCDIRECTION", [0.0, 0.0, 1.0]);
  const axisLosa = entidad(api, modelID, "IFCAXIS2PLACEMENT3D", origen, null, null);
  const extruido = entidad(
    api,
    modelID,
    "IFCEXTRUDEDAREASOLID",
    perfil,
    axisLosa,
    direccion,
    datos.luz,
  );
  const representacion = entidad(
    api,
    modelID,
    "IFCSHAPEREPRESENTATION",
    contexto,
    "Body",
    "SweptSolid",
    [extruido],
  );
  const forma = entidad(api, modelID, "IFCPRODUCTDEFINITIONSHAPE", "Geometria", null, [representacion]);
  const ubicacion = entidad(api, modelID, "IFCLOCALPLACEMENT", null, axisLosa);
  const losa = entidad(
    api,
    modelID,
    "IFCSLAB",
    generarGlobalId("losa"),
    null,
    "Losa maciza - tablero",
    datos.descripcion,
    null,
    ubicacion,
    forma,
    "LOSA-01",
    "BASESLAB",
  );

  // --- Material ---------------------------------------------------------------
  const material = entidad(
    api,
    modelID,
    "IFCMATERIAL",
    `Hormigon armado f'c=${datos.diseno.resistencia_hormigon} MPa`,
    "Hormigon armado conforme a AASHTO STANDARD 2002",
    "Concreto",
  );
  const asociarMaterial = entidad(
    api,
    modelID,
    "IFCRELASSOCIATESMATERIAL",
    generarGlobalId("material-losa"),
    null,
    "Material del tablero",
    null,
    [losa],
    material,
  );

  // --- Property set "Pset_TesisDiseno" (diseno + ISO 19650) -------------------
  const propiedades = construirPropiedadesDiseno(datos.diseno, datos.resultado, metadata).map(
    (p, i) => {
      const nombre = new TIPOS.IfcIdentifier(p.nombre);
      const valor =
        typeof p.valor === "number"
          ? new TIPOS.IfcReal(p.valor)
          : new TIPOS.IfcLabel(p.valor);
      return entidad(
        api,
        modelID,
        "IFCPROPERTYSINGLEVALUE",
        nombre,
        null,
        valor,
        null,
      ) as unknown;
    },
  );
  const pset = entidad(
    api,
    modelID,
    "IFCPROPERTYSET",
    generarGlobalId("pset-diseno"),
    null,
    "Pset_TesisDiseno",
    "Propiedades de diseno de la solucion optima (NSGA-II)",
    propiedades,
  );
  const asociarPset = entidad(
    api,
    modelID,
    "IFCRELDEFINESBYPROPERTIES",
    generarGlobalId("pset-rel"),
    null,
    "Property set del tablero",
    null,
    [losa],
    pset,
  );

  // --- Contencion espacial de la losa en el sitio -----------------------------
  const contenerLosa = entidad(
    api,
    modelID,
    "IFCRELCONTAINEDINSPATIALSTRUCTURE",
    generarGlobalId("contiene-losa"),
    null,
    "Contenido espacial del tablero",
    null,
    [losa],
    sitio,
  );

  // --- Escribir todo -----------------------------------------------------------
  const lineas: unknown[] = [
    origen, ejeZ, axisOrigen, contexto,
    sLongitud, sArea, sFuerza, sPresion, unidades,
    proyecto,
    sitio, agregarSitio,
    perfil, direccion, axisLosa, extruido, representacion, forma, ubicacion, losa,
    material, asociarMaterial,
    ...propiedades, pset, asociarPset,
    contenerLosa,
  ];
  for (const linea of lineas) api.WriteLine(modelID, linea);

  const archivo = api.SaveModel(modelID);
  api.CloseModel(modelID);
  return archivo;
}

/** Inicializa web-ifc por defecto (funciona en Node; en navegador conviene pasar inicializarApi). */
export async function iniciarWebIfc(): Promise<IfcAPICompatible> {
  const api = new (webIfcPkg as unknown as { IfcAPI: new () => IfcAPICompatible }).IfcAPI();
  await (api as unknown as { Init(): Promise<void> }).Init();
  return api;
}

/**
 * Genera el IFC del puente: inicializa web-ifc (o usa el inicializador provisto por el
 * llamador, que puede configurar la ruta del WASM en el navegador) y construye el modelo.
 */
export async function generarIFC(
  datos: DatosIFC,
  opciones: { inicializarApi?: () => Promise<IfcAPICompatible> } = {},
): Promise<Uint8Array> {
  const api = opciones.inicializarApi ? await opciones.inicializarApi() : await iniciarWebIfc();
  return crearModeloIFC(api, datos);
}
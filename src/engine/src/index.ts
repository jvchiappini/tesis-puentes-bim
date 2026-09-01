/**
 * API publica del paquete @tesis-puentes-bim/engine.
 * Es lo que importa src/web/ y lo que queda expuesto si se empaqueta.
 */

// Configuracion (YAML = unica fuente de verdad)
export {
  parsearYamlTipologia,
  cargarConfiguracionTipologia,
  type ConfiguracionTipologia,
  type ItemActivable,
  type PerfilTipologia,
  type FilosofiaNormativa,
} from "./config/loadYaml";

// Formulas parametrizadas del YAML
export { evaluarExpresion } from "./config/expresiones";

// NSGA-II
export {
  optimizarNSGA2,
  decodificarVariable,
  esDominante,
  ordenamientoNoDominado,
  asignarDistanciaCrowding,
  seleccionarTorneo,
  cruceSBX,
  mutacionPolinomial,
  type ConfiguracionNSGA2,
  type DefinicionVariable,
  type ProblemaOptimizacion,
  type ResultadoNSGA2,
  type SolucionNSGA2,
  type Evaluacion,
  type TipoVariable,
} from "./optimization/nsga2";

// Metricas de calidad de frentes
export {
  distanciaGeneracional,
  indiceSpread,
  normalizarFrente,
  distanciaEuclidea,
} from "./optimization/metricasFrente";

// Problemas de prueba (benchmarks)
export {
  crearProblemaZDT1,
  frenteAnaliticoZDT1,
  problemaSRN,
  frenteReferenciaSRN,
} from "./optimization/problemasBenchmark";

// Modelo estructural: losa maciza
export {
  LosaMaciza,
  parsearParametrosNormativos,
  MAPA_VARIABLES,
  decodificarEntradaLosa,
  type SitioLosa,
  type EntradaLosa,
  type SolicitacionesLosa,
  type ResultadoEvaluacion,
  type ParametrosNormativosLosa,
} from "./structural/tipologias/losaMaciza";

// Interfaz comun de tipologias
export type { BaseTipologia } from "./structural/baseTipologia";

// BIM (IFC) -- pendiente de implementacion en Fase 4
export { generarIFC } from "./bim/ifcGenerator";
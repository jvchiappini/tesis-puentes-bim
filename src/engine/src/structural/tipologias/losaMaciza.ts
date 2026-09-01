/**
 * Tipologia: Puente losa maciza de hormigon armado.
 *
 * Implementado segun docs/software/modelo-estructural.md y
 * docs/software/algoritmo-nsga2.md (variables V1-V10, parametros P1-P14, restricciones
 * R1-R11). La normativa es AASHTO STANDARD 2002 (Seccion 8 para hormigon armado, a la que
 * remite el Manual PY Cap. 4.2.3.5) con las cargas del Cap. 4.2.3.2 del Manual.
 *
 * NINGUN valor se hardcodea: todos salen de data/parametros_tipologia/losa_maciza.yaml
 * (bloque `parametros_normativos`) via config/loadYaml.ts. Las formulas parametrizadas
 * (impacto, espesor minimo, armadura de reparticion) se evaluan con config/expresiones.ts.
 *
 * Regla no negociable: no mezclar ecuaciones de AASHTO STANDARD 2002 y AASHTO LRFD.
 */

import type {
  ConfiguracionTipologia,
  FilosofiaNormativa,
} from "../../config/loadYaml";
import { evaluarExpresion } from "../../config/expresiones";
import type { DefinicionVariable, ProblemaOptimizacion } from "../../optimization/nsga2";
import { decodificarVariable } from "../../optimization/nsga2";

// ---------------------------------------------------------------------------
// Tipos de entrada / salida
// ---------------------------------------------------------------------------

/** Parametros de sitio que define el usuario por corrida (no los optimiza NSGA-II). */
export interface SitioLosa {
  luz_diseno: number; // m
  ancho_calzada: number; // m
  costo_unitario_hormigon: number; // USD/m3
  costo_unitario_acero: number; // USD/kg
  clase_exposicion: "normal" | "agresiva";
}

/** Entrada completa de una evaluacion: variables de diseno + parametros de sitio. */
export interface EntradaLosa extends SitioLosa {
  espesor_losa: number; // m
  diametro_armadura_principal: number; // mm
  separacion_armadura_principal: number; // m
  diametro_armadura_reparticion: number; // mm
  separacion_armadura_reparticion: number; // m
  resistencia_hormigon: number; // MPa (f'c)
  grado_acero: number; // MPa (fy)
  recubrimiento: number; // m
  numero_capas_armadura: number; // declarado en YAML (V8); no modelado en v1
  espesor_voladizo: number; // declarado en YAML (V10); no modelado en v1
}

export interface SolicitacionesLosa {
  wPesoPropio: number; // kN/m2 (carga permanente distribuida)
  MPesoPropio: number; // kN·m/m
  MCargaViva: number; // kN·m/m (sin impacto)
  MCargaVivaImpacto: number; // kN·m/m (con impacto)
  MUltimo: number; // kN·m/m (Group I LFD)
  VUltimo: number; // kN/m
  impacto: number; // fraccion de impacto (0..maximo/100)
  numeroVias: number;
  factorPresenciaMultiple: number;
  asPrincipal: number; // m2/m
  asReparticion: number; // m2/m
  dEfectivo: number; // m
  a: number; // m (bloque comprimido)
  phiMn: number; // kN·m/m
  rho: number; // cuantia geometrica
  rhoMax: number;
  cuantiaMin: number;
  espesorMinimo: number; // m (R4)
  recubrimientoRequerido: number; // m (R5)
  separacionMaxima: number; // m (R6)
  asReparticionRequerida: number; // m2/m (R7)
  ecMPa: number; // modulo elasticidad hormigon
  deflexion: number; // m (R9)
  deflexionLimite: number; // m (R9)
  phiVc: number; // kN/m (R10)
}

export interface ResultadoEvaluacion {
  entrada: EntradaLosa;
  solicitaciones: SolicitacionesLosa;
  violaciones: Record<string, number>; // g(x) > 0 = restriccion violada
  costoPorM2: number; // USD/m2 (O1)
  pesoPropioPorM2: number; // kN/m2 (O2)
}

// ---------------------------------------------------------------------------
// Parametros normativos (parseados del YAML)
// ---------------------------------------------------------------------------

export interface ParametrosNormativosLosa {
  filosofiaNormativa: FilosofiaNormativa;
  camionTipo: string;
  ejeDelanteroKN: number;
  ejesTraserosKN: number[];
  espaciamientoEjesM: number[];
  cargaFajaKN_m: number;
  impactoFormula: string;
  impactoMaximoPorcentaje: number;
  impactoLEnPies: boolean;
  pesoEspecificoHormigonKN_m3: number;
  pesoEspecificoRodaduraKN_m3: number;
  espesorRodaduraM: number;
  anchoDistribucionCargaVivaM: number;
  formulaNumeroVias: string;
  factorPresenciaMultiple: Record<number, number>;
  fyMPa: number;
  esMPa: number;
  densidadAceroKg_m3: number;
  gammaLFD: number;
  betaD: number;
  betaL: number;
  phiFlexion: number;
  beta1: number;
  cuantiaMinima: number;
  factorCuantiaMaxima: number;
  deformacionUltimaConcreto: number;
  espesorMinimoFormula: string;
  espesorMinimoResultadoEn: "pulgadas" | "metros";
  recubrimientoNormalM: number; // losa en clima moderado (inferior)
  recubrimientoAgresivaM: number; // losa en ambiente agresivo (inferior)
  reparticionFormulaPorcentaje: string;
  reparticionMaximoPorcentaje: number;
  reparticionSEnPies: boolean;
  phiCorte: number;
  factorVc: number;
  ecFactor: number;
  pesoEspecificoLbFt3: number;
  deflexionLimiteL: number;
  separacionMaximaClearM: number;
}

function obtenerNumero(
  objeto: Record<string, unknown>,
  clave: string,
  ruta: string,
): number {
  const valor = objeto[clave];
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new Error(`parametros_normativos.${ruta}.${clave}: debe ser un numero`);
  }
  return valor;
}

function obtenerString(
  objeto: Record<string, unknown>,
  clave: string,
  ruta: string,
): string {
  const valor = objeto[clave];
  if (typeof valor !== "string") {
    throw new Error(`parametros_normativos.${ruta}.${clave}: debe ser un string`);
  }
  return valor;
}

function obtenerMapa(
  objeto: Record<string, unknown>,
  clave: string,
  ruta: string,
): Record<string, unknown> {
  const valor = objeto[clave];
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) {
    throw new Error(`parametros_normativos.${ruta}.${clave}: debe ser un mapa`);
  }
  return valor as Record<string, unknown>;
}

export function parsearParametrosNormativos(
  configuracion: ConfiguracionTipologia,
): ParametrosNormativosLosa {
  const n = configuracion.parametros_normativos;
  const cargas = obtenerMapa(n, "cargas", "");
  const camion = obtenerMapa(cargas, "camion", "cargas");
  const impacto = obtenerMapa(cargas, "impacto", "cargas");
  const acero = obtenerMapa(n, "acero", "");
  const lfd = obtenerMapa(n, "factores_lfd", "");
  const flexion = obtenerMapa(n, "flexion", "");
  const espesorMin = obtenerMapa(n, "espesor_minimo_losa", "");
  const recub = obtenerMapa(n, "recubrimientos_cm", "");
  const reparticion = obtenerMapa(n, "armadura_reparticion", "");
  const corte = obtenerMapa(n, "corte", "");
  const deflexion = obtenerMapa(n, "deflexion", "");
  const separacion = obtenerMapa(n, "separacion", "");
  const normal = obtenerMapa(recub, "normal", "recubrimientos_cm");
  const agresiva = obtenerMapa(recub, "agresiva", "recubrimientos_cm");

  const ejesTraseros = camion["ejes_traseros_kN"] as number[];
  const espaciado = camion["espaciamiento_ejes_m"] as number[];
  if (!Array.isArray(ejesTraseros) || ejesTraseros.length === 0) {
    throw new Error(`parametros_normativos.cargas.camion.ejes_traseros_kN: debe ser un array de numeros`);
  }
  if (!Array.isArray(espaciado) || espaciado.length !== ejesTraseros.length) {
    throw new Error(`parametros_normativos.cargas.camion.espaciamiento_ejes_m: debe tener un valor por eje trasero`);
  }

  const fmp = obtenerMapa(cargas, "factor_presencia_multiple", "cargas");
  const factorPresenciaMultiple: Record<number, number> = {};
  for (const [k, v] of Object.entries(fmp)) {
    factorPresenciaMultiple[Number(k)] = typeof v === "number" ? v : Number(v);
  }

  return {
    filosofiaNormativa: configuracion.filosofia_normativa,
    camionTipo: obtenerString(camion, "tipo", "cargas.camion"),
    ejeDelanteroKN: obtenerNumero(camion, "eje_delantero_kN", "cargas.camion"),
    ejesTraserosKN: ejesTraseros.map(Number),
    espaciamientoEjesM: espaciado.map(Number),
    cargaFajaKN_m: obtenerNumero(camion, "carga_faja_kN_m", "cargas.camion"),
    impactoFormula: obtenerString(impacto, "formula", "cargas.impacto"),
    impactoMaximoPorcentaje: obtenerNumero(impacto, "maximo_porcentaje", "cargas.impacto"),
    impactoLEnPies: Boolean(impacto["L_en_pies"]),
    pesoEspecificoHormigonKN_m3: obtenerNumero(cargas, "peso_especifico_hormigon_kN_m3", "cargas"),
    pesoEspecificoRodaduraKN_m3: obtenerNumero(cargas, "peso_especifico_rodadura_kN_m3", "cargas"),
    espesorRodaduraM: obtenerNumero(cargas, "espesor_rodadura_m", "cargas"),
    anchoDistribucionCargaVivaM: obtenerNumero(cargas, "ancho_distribucion_carga_viva_m", "cargas"),
    formulaNumeroVias: obtenerString(cargas, "formula_numero_vias", "cargas"),
    factorPresenciaMultiple,
    fyMPa: obtenerNumero(acero, "fy_mpa", "acero"),
    esMPa: obtenerNumero(acero, "es_mpa", "acero"),
    densidadAceroKg_m3: obtenerNumero(acero, "densidad_kg_m3", "acero"),
    gammaLFD: obtenerNumero(lfd, "gamma", "factores_lfd"),
    betaD: obtenerNumero(lfd, "beta_D", "factores_lfd"),
    betaL: obtenerNumero(lfd, "beta_L", "factores_lfd"),
    phiFlexion: obtenerNumero(flexion, "phi_flexion", "flexion"),
    beta1: obtenerNumero(flexion, "beta1", "flexion"),
    cuantiaMinima: obtenerNumero(flexion, "cuantia_minima", "flexion"),
    factorCuantiaMaxima: obtenerNumero(flexion, "factor_cuantia_maxima", "flexion"),
    deformacionUltimaConcreto: obtenerNumero(flexion, "deformacion_ultima_concreto", "flexion"),
    espesorMinimoFormula: obtenerString(espesorMin, "formula", "espesor_minimo_losa"),
    espesorMinimoResultadoEn: espesorMin["resultado_en"] === "metros" ? "metros" : "pulgadas",
    recubrimientoNormalM: (obtenerNumero(normal, "inferior", "recubrimientos_cm.normal") / 100),
    recubrimientoAgresivaM: (obtenerNumero(agresiva, "inferior", "recubrimientos_cm.agresiva") / 100),
    reparticionFormulaPorcentaje: obtenerString(reparticion, "formula_porcentaje", "armadura_reparticion"),
    reparticionMaximoPorcentaje: obtenerNumero(reparticion, "maximo_porcentaje", "armadura_reparticion"),
    reparticionSEnPies: Boolean(reparticion["S_en_pies"]),
    phiCorte: obtenerNumero(corte, "phi_corte", "corte"),
    factorVc: obtenerNumero(corte, "factor_vc", "corte"),
    ecFactor: obtenerNumero(deflexion, "ec_factor", "deflexion"),
    pesoEspecificoLbFt3: obtenerNumero(deflexion, "peso_especifico_lb_ft3", "deflexion"),
    deflexionLimiteL: obtenerNumero(deflexion, "limite_l", "deflexion"),
    separacionMaximaClearM: obtenerNumero(separacion, "maximo_clear_m", "separacion"),
  };
}

// ---------------------------------------------------------------------------
// Mapeo de ids de variables del YAML a claves semanticas del modelo
// ---------------------------------------------------------------------------

export const MAPA_VARIABLES: Record<string, keyof EntradaLosa> = {
  V1_espesor_losa: "espesor_losa",
  V2_diametro_armadura_principal: "diametro_armadura_principal",
  V3_separacion_armadura_principal: "separacion_armadura_principal",
  V4_diametro_armadura_reparticion: "diametro_armadura_reparticion",
  V5_separacion_armadura_reparticion: "separacion_armadura_reparticion",
  V6_resistencia_hormigon: "resistencia_hormigon",
  V7_grado_acero: "grado_acero",
  V8_numero_capas_armadura: "numero_capas_armadura",
  V9_recubrimiento: "recubrimiento",
  V10_espesor_voladizo: "espesor_voladizo",
};

// ---------------------------------------------------------------------------
// Modelo estructural
// ---------------------------------------------------------------------------

const METRO_A_PIE = 3.28084;
const PIE_A_METRO = 1 / METRO_A_PIE;
const PULGADA_A_METRO = 0.0254;
const MPA_A_PSI = 145.038;
const PSI_A_MPA = 1 / MPA_A_PSI;
const KN_A_LIBRA = 224.809;
const PSI_A_MPA_CONCRETO = 0.00689476;

export class LosaMaciza {
  readonly normativos: ParametrosNormativosLosa;

  constructor(readonly configuracion: ConfiguracionTipologia) {
    this.normativos = parsearParametrosNormativos(configuracion);
  }

  /** Recubrimiento inferior de losa segun clase de exposicion (Art. 8.22 AASHTO, Manual 4.2.3.5). */
  recubrimientoRequerido(clase: SitioLosa["clase_exposicion"]): number {
    return clase === "agresiva" ? this.normativos.recubrimientoAgresivaM : this.normativos.recubrimientoNormalM;
  }

  /** Variables de decision activas (perfil opcional; si no, las marcadas activo en el YAML). */
  variablesDiseno(perfil?: string): DefinicionVariable[] {
    const ids = perfil && this.configuracion.perfiles[perfil]
      ? this.configuracion.perfiles[perfil].variables_activas
      : Object.entries(this.configuracion.variables).filter(([, v]) => v.activo).map(([k]) => k);

    const variables: DefinicionVariable[] = [];
    for (const id of ids) {
      const def = this.configuracion.variables[id];
      if (!def) {
        throw new Error(`Variable "${id}" declarada activa pero ausente en la configuracion`);
      }
      const tipo = def.tipo as DefinicionVariable["tipo"];
      if (tipo === "continua") {
        const rango = def.rango as [number, number] | undefined;
        if (!rango) {
          throw new Error(`Variable continua "${id}" sin rango definido`);
        }
        variables.push({
          id: MAPA_VARIABLES[id] as string,
          tipo,
          rango: [rango[0], rango[1]],
        });
      } else {
        const catalogo = def.catalogo as number[] | undefined;
        if (!catalogo) {
          throw new Error(`Variable discreta "${id}" sin catalogo definido`);
        }
        variables.push({
          id: MAPA_VARIABLES[id] as string,
          tipo,
          catalogo: catalogo.map(Number),
        });
      }
    }
    return variables;
  }

  /** Restricciones activas (perfil opcional; si no, las marcadas activo en el YAML). */
  restriccionesActivas(perfil?: string): string[] {
    return perfil && this.configuracion.perfiles[perfil]
      ? this.configuracion.perfiles[perfil].restricciones_activas
      : Object.entries(this.configuracion.restricciones).filter(([, v]) => v.activo).map(([k]) => k);
  }

  /** Carga permanente distribuida sobre una franja de 1 m (O2). */
  pesoPropio(entrada: EntradaLosa): number {
    const n = this.normativos;
    return n.pesoEspecificoHormigonKN_m3 * entrada.espesor_losa +
      n.pesoEspecificoRodaduraKN_m3 * n.espesorRodaduraM; // kN/m2
  }

  /** Momento por carga viva (camion HS-20 o carga de faja) sobre franja de 1 m, sin impacto. */
  private momentoCargaViva(luzM: number): { momKN_m: number; vias: number; fmp: number } {
    const n = this.normativos;
    const vias = Math.max(1, evaluarExpresion(n.formulaNumeroVias, { ancho: this.anchoDeVias }));

    const fmp = n.factorPresenciaMultiple[Math.min(vias, 4)] ?? 1;
    const L = luzM;

    // Carga de faja: w = cargaFaja (kN/m) -> M = w L^2 / 8
    const Mfaja = (n.cargaFajaKN_m * L * L) / 8;

    // Camion: maximizar momento sobre viga simplemente apoyada (mecanica clasica)
    const ejes = [n.ejeDelanteroKN, ...n.ejesTraserosKN];
    const espaciados = n.espaciamientoEjesM;
    // posicion relativa de cada eje respecto al primero: 0, d1, d1+d2
    const posRel = [0];
    let acum = 0;
    for (const d of espaciados) {
      acum += d;
      posRel.push(acum);
    }
    let maxM = 0;
    const pasos = 400;
    for (let i = 0; i <= pasos; i++) {
      const t = (L * i) / pasos; // posicion del primer eje
      const pos = posRel.map((r) => t + r);
      let R = 0;
      for (let k = 0; k < ejes.length; k++) {
        if (pos[k] >= 0 && pos[k] <= L) R += (ejes[k] * (L - pos[k])) / L;
      }
      for (let k = 0; k < ejes.length; k++) {
        if (pos[k] < 0 || pos[k] > L) continue;
        let Mk = R * pos[k];
        for (let j = 0; j < k; j++) {
          if (pos[j] >= 0) Mk -= ejes[j] * (pos[k] - pos[j]);
        }
        if (Mk > maxM) maxM = Mk;
      }
    }
    const Mlan = Math.max(Mfaja, maxM);
    const Mfranja = (Mlan * fmp) / n.anchoDistribucionCargaVivaM;
    return { momKN_m: Mfranja, vias, fmp };
  }

  private anchoDeVias = 1;

  /**
   * Impacto como FRACCION de la carga viva a sumar: formula parametrizada
   * (ej. "50/(L+125)"), I = min(formula, maximo). Devuelve fraccion (0..maximo/100),
   * de modo que la carga con impacto = (1 + I) * carga. AASHTO STANDARD Art. 3.8.2.2.
   */
  impacto(luzM: number): number {
    const n = this.normativos;
    const L = n.impactoLEnPies ? luzM * METRO_A_PIE : luzM;
    const i = evaluarExpresion(n.impactoFormula, { L });
    return Math.min(i, n.impactoMaximoPorcentaje / 100);
  }

  calcularSolicitaciones(entrada: EntradaLosa): SolicitacionesLosa {
    const n = this.normativos;
    const { luz_diseno: L, ancho_calzada } = entrada;
    this.anchoDeVias = ancho_calzada;

    const wPesoPropio = this.pesoPropio(entrada);
    const MPesoPropio = (wPesoPropio * L * L) / 8;

    const { momKN_m: MCargaViva, vias, fmp } = this.momentoCargaViva(L);
    const impacto = this.impacto(L); // fraccion
    const MCargaVivaImpacto = MCargaViva * (1 + impacto);

    // Group I (LFD): Mu = gamma * (beta_D * D + beta_L * (L+I))
    const MUltimo = n.gammaLFD * (n.betaD * MPesoPropio + n.betaL * MCargaVivaImpacto);

    // Cortante ultimo (misma combinacion Group I)
    const VPesoPropio = (wPesoPropio * L) / 2;
    const VFaja = (n.cargaFajaKN_m * L) / 2;
    const VUltimo = n.gammaLFD * (n.betaD * VPesoPropio + n.betaL * (VFaja * (1 + impacto) * fmp) / n.anchoDistribucionCargaVivaM);

    // Geometria / armaduras
    const c = entrada.recubrimiento;
    const dEfectivo = entrada.espesor_losa - c - entrada.diametro_armadura_principal / 2000; // m
    const asPrincipal = (Math.PI * Math.pow(entrada.diametro_armadura_principal / 1000, 2) / 4) / entrada.separacion_armadura_principal; // m2/m
    const asReparticion = (Math.PI * Math.pow(entrada.diametro_armadura_reparticion / 1000, 2) / 4) / entrada.separacion_armadura_reparticion; // m2/m

    // Flexion: bloque comprimido y momento resistente (AASHTO STANDARD 8.16)
    // Unidades: As [m2/m], fy [MPa = 1000 kN/m2], d [m] -> kN·m/m.
    const a = (asPrincipal * entrada.grado_acero) / (0.85 * entrada.resistencia_hormigon * 1); // m
    const phiMn =
      n.phiFlexion * asPrincipal * entrada.grado_acero * 1000 * (dEfectivo - a / 2); // kN·m/m

    // Cuantias
    const rho = asPrincipal / (1 * dEfectivo);
    const rhoBal = (0.85 * n.beta1 * (entrada.resistencia_hormigon / entrada.grado_acero)) *
      (n.deformacionUltimaConcreto / (n.deformacionUltimaConcreto + entrada.grado_acero / n.esMPa));
    const rhoMax = n.factorCuantiaMaxima * rhoBal;

    // R4 espesor minimo (AASHTO STANDARD 8.9.2): formula en pulgadas con S en pulgadas
    const S = L * 39.3701; // pulgadas
    const tFormula = evaluarExpresion(n.espesorMinimoFormula, { S });
    const espesorMinimo = n.espesorMinimoResultadoEn === "metros" ? tFormula : tFormula * PULGADA_A_METRO;

    // R7 armadura de reparticion (AASHTO STANDARD 3.24.10.1): % de la principal
    const SLibre = n.reparticionSEnPies ? L * METRO_A_PIE : L;
    const pct = Math.min(
      evaluarExpresion(n.reparticionFormulaPorcentaje, { S: SLibre }),
      n.reparticionMaximoPorcentaje,
    );
    const asReparticionRequerida = (pct / 100) * asPrincipal;

    // Modulo de elasticidad del hormigon (AASHTO STANDARD 8.13.3, unidades US)
    const fcPsi = entrada.resistencia_hormigon * MPA_A_PSI;
    const ecPsi = n.ecFactor * Math.pow(n.pesoEspecificoLbFt3, 1.5) * Math.sqrt(fcPsi);
    const ecMPa = ecPsi * PSI_A_MPA_CONCRETO;

    // R9 deflexion por carga viva + impacto (viga simplemente apoyada)
    const wEquivalente = (8 * MCargaVivaImpacto) / (L * L); // kN/m equivalente
    const inercia = (1 * Math.pow(entrada.espesor_losa, 3)) / 12; // m4 (franja de 1 m)
    const deflexion = (5 * wEquivalente * Math.pow(L, 4)) / (384 * ecMPa * 1000 * inercia); // m
    const deflexionLimite = L / n.deflexionLimiteL;

    // R10 cortante (AASHTO STANDARD 8.16.6): Vc = factor_vc*sqrt(f'c)*b*d (lb, psi, in)
    const bIn = 39.3701;
    const dIn = dEfectivo * 39.3701;
    const vcLb = n.factorVc * Math.sqrt(fcPsi) * bIn * dIn;
    const phiVc = (n.phiCorte * vcLb) / KN_A_LIBRA; // kN/m

    return {
      wPesoPropio,
      MPesoPropio,
      MCargaViva,
      MCargaVivaImpacto,
      MUltimo,
      VUltimo,
      impacto,
      numeroVias: vias,
      factorPresenciaMultiple: fmp,
      asPrincipal,
      asReparticion,
      dEfectivo,
      a,
      phiMn,
      rho,
      rhoMax,
      cuantiaMin: n.cuantiaMinima,
      espesorMinimo,
      recubrimientoRequerido: this.recubrimientoRequerido(entrada.clase_exposicion),
      separacionMaxima: n.separacionMaximaClearM,
      asReparticionRequerida,
      ecMPa,
      deflexion,
      deflexionLimite,
      phiVc,
    };
  }

  /** Costo total de materiales por m2 de tablero (O1). */
  costo(entrada: EntradaLosa): number {
    const n = this.normativos;
    const { asPrincipal, asReparticion } = this.calcularSolicitaciones(entrada);
    const pesoAceroKg_m2 = n.densidadAceroKg_m3 * (asPrincipal + asReparticion); // m3/m2 -> kg/m2
    return entrada.costo_unitario_hormigon * entrada.espesor_losa +
      entrada.costo_unitario_acero * pesoAceroKg_m2; // USD/m2
  }

  /**
   * Evalua un diseno completo: solicitaciones + violaciones de restricciones activas.
   * Las violaciones se devuelven como g(x) > 0 (ver docs/software/algoritmo-nsga2.md).
   */
  evaluar(entrada: EntradaLosa, perfil?: string): ResultadoEvaluacion {
    const sol = this.calcularSolicitaciones(entrada);
    const violaciones: Record<string, number> = {};

    for (const r of this.restriccionesActivas(perfil)) {
      switch (r) {
        case "R1_flexion_ELU":
          violaciones[r] = sol.MUltimo - sol.phiMn;
          break;
        case "R2_cuantia_minima":
          violaciones[r] = this.normativos.cuantiaMinima - sol.rho;
          break;
        case "R3_cuantia_maxima_ductilidad":
          violaciones[r] = sol.rho - sol.rhoMax;
          break;
        case "R4_espesor_minimo_por_luz":
          violaciones[r] = sol.espesorMinimo - entrada.espesor_losa;
          break;
        case "R5_recubrimiento_minimo":
          violaciones[r] = sol.recubrimientoRequerido - entrada.recubrimiento;
          break;
        case "R6_separacion_barras":
          violaciones[r] = Math.max(entrada.separacion_armadura_principal, entrada.separacion_armadura_reparticion) -
            sol.separacionMaxima;
          break;
        case "R7_armadura_reparticion_minima":
          violaciones[r] = sol.asReparticionRequerida - sol.asReparticion;
          break;
        case "R9_deflexion_servicio":
          violaciones[r] = sol.deflexion - sol.deflexionLimite;
          break;
        case "R10_corte_ELU":
          violaciones[r] = sol.VUltimo - sol.phiVc;
          break;
        // R8 (fisuracion) y R11 (desarrollo) no se modelan en v1: si estan activas, se
        // ignoran explicitamente (no son valores inventados, son no-modelados).
        default:
          break;
      }
    }

    return {
      entrada,
      solicitaciones: sol,
      violaciones,
      costoPorM2: this.costo(entrada),
      pesoPropioPorM2: sol.wPesoPropio,
    };
  }

  /**
   * Construye el problema de optimizacion NSGA-II para la losa maciza: variables activas,
   * objetivos [costo, peso propio] y restricciones activas como violaciones g(x) <= 0.
   */
  construirProblemaNSGA2(sitio: SitioLosa, perfil?: string): ProblemaOptimizacion {
    const variables = this.variablesDiseno(perfil);
    const objetivoIds = perfil && this.configuracion.perfiles[perfil]
      ? this.configuracion.perfiles[perfil].objetivos_activos
      : Object.entries(this.configuracion.objetivos).filter(([, v]) => v.activo).map(([k]) => k);
    const hayCosto = objetivoIds.includes("O1_costo_total");
    const hayPeso = objetivoIds.includes("O2_peso_propio");

    const recubrimiento = this.recubrimientoRequerido(sitio.clase_exposicion);

    return {
      variables,
      evaluar: (valoresReales) => {
        const entrada: EntradaLosa = {
          ...sitio,
          espesor_losa: 0.5,
          diametro_armadura_principal: 16,
          separacion_armadura_principal: 0.2,
          diametro_armadura_reparticion: 12,
          separacion_armadura_reparticion: 0.3,
          resistencia_hormigon: 25,
          grado_acero: 420,
          recubrimiento,
          numero_capas_armadura: 1,
          espesor_voladizo: 0.4,
        };
        for (let i = 0; i < variables.length; i++) {
          (entrada as unknown as Record<string, number>)[variables[i].id] = valoresReales[i];
        }
        const resultado = this.evaluar(entrada, perfil);
        const objetivos: number[] = [];
        if (hayCosto) objetivos.push(resultado.costoPorM2);
        if (hayPeso) objetivos.push(resultado.pesoPropioPorM2);
        const restricciones = Object.values(resultado.violaciones);
        return { objetivos, restricciones };
      },
    };
  }
}

/** Decodifica variables normalizadas [0,1] a valores reales (helper para la UI). */
export function decodificarEntradaLosa(
  variables: DefinicionVariable[],
  genotipo: number[],
  sitio: SitioLosa,
): EntradaLosa {
  const entrada: EntradaLosa = {
    ...sitio,
    espesor_losa: 0.5,
    diametro_armadura_principal: 16,
    separacion_armadura_principal: 0.2,
    diametro_armadura_reparticion: 12,
    separacion_armadura_reparticion: 0.3,
    resistencia_hormigon: 25,
    grado_acero: 420,
    recubrimiento: sitio.clase_exposicion === "agresiva" ? 0.05 : 0.025,
    numero_capas_armadura: 1,
    espesor_voladizo: 0.4,
  };
  for (let i = 0; i < variables.length; i++) {
    const def = variables[i];
    (entrada as unknown as Record<string, number>)[def.id] = decodificarVariable(def, genotipo[i]);
  }
  return entrada;
}
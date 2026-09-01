/**
 * Metadatos ISO 19650 (ISO 19650-1/-2, ver docs/tesis/referencias.bib) y construccion de
 * los Property Sets que se vuelcan al modelo IFC generado por bim/ifcGenerator.ts.
 *
 * ISO 19650 pide gestionar la informacion por contenedores de informacion con titulo,
 * estado, autor, fecha, fase (PIM/AIM, etc.). En IFC esto se materializa en los atributos
 * del IFCPROJECT (Name/Description/Phase) y en property sets asociados a los elementos.
 */

import type { EntradaLosa, ResultadoEvaluacion } from "../structural/tipologias/losaMaciza";

export interface MetadataISO19650 {
  titulo: string;
  descripcion: string;
  autor: string;
  organizacion: string;
  fecha: string;
  /** Fase del ciclo de vida (ISO 19650: concept/design/construction/operation...). */
  fase: string;
  /** Estado del contenedor de informacion (Ej: "Entregable de diseno"). */
  estado: string;
  normaAplicada: string;
  filosofiaNormativa: string;
}

export interface EntradaPropiedad {
  nombre: string;
  /** string -> IfcLabel/IfcText; number -> IfcReal. */
  valor: string | number;
}

/** Metadata por defecto para el proyecto (autor = autor de la tesis). */
export function crearMetadataISO19650(opciones: Partial<MetadataISO19650> = {}): MetadataISO19650 {
  return {
    titulo: "Puente losa maciza de hormigon armado - optimizacion NSGA-II",
    descripcion:
      "Modelo IFC generado automaticamente desde la solucion optima del frente de Pareto (NSGA-II) de la herramienta de tesis.",
    autor: "Jose Valentino Chiappini Vergara",
    organizacion: "UNINTER/FACITPRO - Ciudad del Este, Paraguay",
    fecha: new Date().toISOString().slice(0, 10),
    fase: "Diseno",
    estado: "Entregable de diseno",
    normaAplicada: "AASHTO STANDARD 2002 / Manual de Carreteras del Paraguay Vol. 4.2",
    filosofiaNormativa: "aashto_standard_2002",
    ...opciones,
  };
}

/**
 * Construye el Property Set "Pset_TesisDiseno" con la solucion de diseno (variables,
 * resultados estructurales) y la metadata ISO 19650. Todo valor sale del diseno evaluado.
 */
export function construirPropiedadesDiseno(
  diseno: EntradaLosa,
  resultado: ResultadoEvaluacion,
  metadata: MetadataISO19650,
): EntradaPropiedad[] {
  const s = resultado.solicitaciones;
  return [
    { nombre: "TipoPuente", valor: "Losa maciza de hormigon armado" },
    { nombre: "LuzDiseno_m", valor: diseno.luz_diseno },
    { nombre: "AnchoCalzada_m", valor: diseno.ancho_calzada },
    { nombre: "ClaseExposicion", valor: diseno.clase_exposicion },
    { nombre: "EspesorLosa_m", valor: diseno.espesor_losa },
    { nombre: "DiametroArmaduraPrincipal_mm", valor: diseno.diametro_armadura_principal },
    { nombre: "SeparacionArmaduraPrincipal_m", valor: diseno.separacion_armadura_principal },
    { nombre: "DiametroArmaduraReparticion_mm", valor: diseno.diametro_armadura_reparticion },
    { nombre: "SeparacionArmaduraReparticion_m", valor: diseno.separacion_armadura_reparticion },
    { nombre: "ResistenciaHormigon_MPa", valor: diseno.resistencia_hormigon },
    { nombre: "GradoAcero_MPa", valor: diseno.grado_acero },
    { nombre: "Recubrimiento_m", valor: diseno.recubrimiento },
    { nombre: "MomentoUltimo_kNm_m", valor: Number(s.MUltimo.toFixed(3)) },
    { nombre: "MomentoResistente_kNm_m", valor: Number(s.phiMn.toFixed(3)) },
    { nombre: "CuantiaGeometrica", valor: Number(s.rho.toFixed(6)) },
    { nombre: "CostoPorM2_USD", valor: Number(resultado.costoPorM2.toFixed(2)) },
    { nombre: "PesoPropioPorM2_kN_m2", valor: Number(resultado.pesoPropioPorM2.toFixed(3)) },
    { nombre: "Normativa", valor: metadata.normaAplicada },
    { nombre: "FilosofiaNormativa", valor: metadata.filosofiaNormativa },
    { nombre: "EstadoISO19650", valor: metadata.estado },
    { nombre: "FaseISO19650", valor: metadata.fase },
    { nombre: "Autor", valor: metadata.autor },
    { nombre: "Organizacion", valor: metadata.organizacion },
    { nombre: "FechaGeneracion", valor: metadata.fecha },
  ];
}
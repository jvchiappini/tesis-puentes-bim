/**
 * Configuración del documento: orden de capítulos y metadatos de portada.
 * Actualizar cuando se confirme el reglamento de formato de la facultad (Fase 0).
 */

export const metadatosPortada = {
  titulo:
    "DESARROLLO DE UNA HERRAMIENTA PARAMÉTRICA DE OPTIMIZACIÓN MULTIOBJETIVO (NSGA-II) Y GENERACIÓN AUTOMÁTICA DE MODELOS BIM (ISO 19650) PARA EL DISEÑO DE PUENTES VIALES DE HORMIGÓN ARMADO, BASADA EN EL MANUAL DE CARRETERAS DEL PARAGUAY",
  autor: "José Valentino Chiappini Vergara",
  tutor: "TODO: completar", // pendiente de confirmar con la facultad
  carrera: "Ingeniería Civil",
  institucion:
    "Facultad de Ciencias, Tecnología y Producción (FACITPRO) — Universidad Internacional Tres Fronteras (UNINTER)",
  ciudad: "Ciudad del Este, Paraguay",
  anio: "2026",
};

// Orden real de compilación. Debe reflejar el ROADMAP.md y el README.md raíz.
export const ordenCapitulos = [
  "00-portada-caratula.md",
  "01-introduccion.md",
  "02-marco-teorico.md",
  "03-estado-del-arte.md",
  "04-metodologia.md",
  "05-desarrollo.md",
  "06-resultados-validacion.md",
  "07-conclusiones-recomendaciones.md",
  // anexos/ se procesan aparte, no van en el cuerpo principal
];

export const rutaCapitulos = "../../docs/tesis";
export const rutaSalida = "../../docs/tesis/output/tesis-final.docx";

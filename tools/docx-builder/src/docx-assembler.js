/**
 * Toma los bloques intermedios de todos los capítulos + el mapa de citas ya resuelto
 * (Map<claveBibtex, numeroIEEE> de src/citations.js) + los estilos de
 * styles/thesis-styles.js, y arma el objeto Document() de la librería `docx`.
 *
 * Orden de ensamblado esperado (ver build-thesis.js):
 *   1. Portada (metadatosPortada)
 *   2. Tabla de contenidos automática (TableOfContents de la librería docx)
 *   3. Capítulos en el orden de ordenCapitulos, con cada "[@clave]" ya reemplazado por
 *      "[n]" según el mapa de citas
 *   4. Sección "REFERENCIAS" al final, generada por generarSeccionReferencias()
 *      (src/citations.js), en orden numérico [1]..[n]
 *
 * TODO (Agente Programador): mapear cada tipo de bloque intermedio a su equivalente en
 * docx (Paragraph con HeadingLevel para títulos, TextRun para texto corrido, Table para
 * tablas, etc.), aplicando siempre los estilos centralizados (nunca hardcodear tamaño de
 * fuente o espaciado acá -- todo sale de thesis-styles.js).
 */

export function ensamblarDocumento(bloquesPorCapitulo, mapaDeCitas, seccionReferencias, metadatosPortada, estilos) {
  throw new Error("TODO: implementar ensamblado del Document() con la librería docx");
}

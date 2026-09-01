/**
 * Gestor de citas IEEE del proyecto.
 *
 * Convención de citación en Markdown (usada por el Agente Redactor):
 *   Texto que cita una fuente [@deb2002] y otra [@aashto2020].
 *   Múltiples fuentes en una misma cita: [@deb2002; @aashto2020]
 *
 * La clave (ej. "deb2002") DEBE coincidir exactamente con la clave de la entrada
 * correspondiente en docs/tesis/referencias.bib (el Agente Investigador es responsable
 * de mantener ese archivo).
 *
 * Responsabilidades de este módulo:
 *   1. Cargar y parsear referencias.bib (via @citation-js/plugin-bibtex).
 *   2. Escanear TODOS los capítulos, en el orden de `ordenCapitulos` (config.js), y
 *      registrar el orden de PRIMERA aparición de cada clave citada -> ese orden define
 *      el número IEEE ([1], [2], [3]...), tal como exige el formato IEEE (numerado por
 *      orden de aparición, no alfabético).
 *   3. Exponer un mapa { claveBibtex: numeroIEEE } para que markdown-parser.js reemplace
 *      cada "[@clave]" por "[n]" en el texto.
 *   4. Generar la lista de Referencias final, formateada en IEEE real usando el estilo
 *      CSL "ieee" de @citation-js/plugin-csl (no reinventar el formato a mano: apellidos,
 *      iniciales, comillas de título, cursiva de journal, etc. los resuelve la librería).
 *
 * TODO (Agente Programador):
 *   - export function cargarReferencias(rutaBib) -> registro de citation-js
 *   - export function construirMapaDeCitas(bloquesPorCapitulo, registroReferencias)
 *       -> Map<claveBibtex, numeroIEEE>
 *   - export function generarSeccionReferencias(mapaDeCitas, registroReferencias)
 *       -> lista de strings formateados en IEEE, en el orden numérico correcto,
 *          usando Cite(entry).format("bibliography", { format: "text", template: "ieee" })
 *
 * Caso borde a manejar: si el Redactor cita una clave que NO existe en referencias.bib,
 * este módulo debe lanzar un error claro con el nombre de la clave y el archivo/capítulo
 * donde se encontró -- nunca compilar en silencio con una referencia rota (eso es
 * exactamente lo que el Agente Revisor/QA audita antes de cada entrega).
 */

export function cargarReferencias(rutaBib) {
  throw new Error("TODO: implementar carga de referencias.bib con @citation-js/plugin-bibtex");
}

export function construirMapaDeCitas(bloquesPorCapitulo, registroReferencias) {
  throw new Error("TODO: implementar escaneo de [@clave] en orden de aparición");
}

export function generarSeccionReferencias(mapaDeCitas, registroReferencias) {
  throw new Error("TODO: implementar formateo IEEE con @citation-js/plugin-csl (template: \"ieee\")");
}

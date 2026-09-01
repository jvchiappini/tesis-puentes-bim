/**
 * Convierte un archivo Markdown de un capítulo en una lista de "bloques intermedios"
 * simples: { tipo: "titulo1" | "titulo2" | "parrafo" | "lista" | "tabla", contenido: ... }
 *
 * IMPORTANTE (citas): en esta etapa NO se resuelven los números IEEE todavía -- eso
 * requiere haber escaneado TODOS los capítulos primero (ver src/citations.js). Lo que
 * este módulo sí hace es detectar los marcadores de cita en el texto crudo, con el patrón:
 *   /\[@([a-zA-Z0-9_-]+(?:;\s*@[a-zA-Z0-9_-]+)*)\]/g
 * y dejarlos etiquetados en el bloque intermedio como { tipo: "cita", claves: [...] }
 * dentro del contenido del párrafo, para que docx-assembler.js los reemplace por "[n]"
 * una vez que build-thesis.js ya calculó el mapa de citas completo.
 *
 * TODO (Agente Programador): implementar el parseo real. No hace falta soportar Markdown
 * completo -- alcanza con lo que realmente se usa en docs/tesis/ (encabezados #/##/###,
 * párrafos, listas con "-", tablas simples, y el marcador de cita [@clave] descripto
 * arriba). Para casos complejos (fórmulas LaTeX, imágenes), definir una convención propia
 * y documentarla en este mismo archivo.
 */

export function parsearMarkdown(contenidoArchivo) {
  throw new Error("TODO: implementar parseo de Markdown a bloques intermedios (incluye detección de [@clave])");
}

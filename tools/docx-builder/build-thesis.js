/**
 * Script principal: lee cada capítulo de docs/tesis/, resuelve todas las citas IEEE de
 * forma global, ensambla el documento final y lo guarda en docs/tesis/output/.
 *
 * Uso: npm run build
 *
 * Flujo (ver TODOs en cada módulo de src/):
 *   1. Leer cada archivo en el orden de `ordenCapitulos` (config.js)
 *   2. Parsear cada uno con `parsearMarkdown` (src/markdown-parser.js)
 *   3. Cargar referencias.bib con `cargarReferencias` (src/citations.js)
 *   4. Escanear TODOS los bloques ya parseados y construir el mapa clave->numero IEEE
 *      con `construirMapaDeCitas` -- esto tiene que hacerse DESPUÉS de tener todos los
 *      capítulos parseados, porque el número depende del orden global de aparición
 *   5. Generar la lista de Referencias formateada con `generarSeccionReferencias`
 *   6. Ensamblar todo con `ensamblarDocumento` (src/docx-assembler.js), reemplazando cada
 *      marcador de cita por su número [n] correspondiente
 *   7. Escribir el resultado en `rutaSalida` con la API de Packer de la librería docx
 *
 * Si `construirMapaDeCitas` encuentra una clave citada que no existe en referencias.bib,
 * el script debe fallar con un mensaje claro (archivo + clave) y NO generar el .docx --
 * un documento de tesis con una referencia rota no debería poder compilarse.
 */

import { ordenCapitulos, rutaCapitulos, rutaSalida, metadatosPortada } from "./src/config.js";
import { estilos } from "./styles/thesis-styles.js";
import { parsearMarkdown } from "./src/markdown-parser.js";
import { cargarReferencias, construirMapaDeCitas, generarSeccionReferencias } from "./src/citations.js";
import { ensamblarDocumento } from "./src/docx-assembler.js";

console.log("TODO: implementar build-thesis.js — ver comentarios en este archivo y en cada módulo de src/.");

# docx-builder

Compila el documento final de la tesis (`.docx`) a partir del contenido fuente en
Markdown que vive en `docs/tesis/`. **El Markdown es la fuente de verdad** — nunca se edita
el `.docx` a mano; si hay que corregir algo, se corrige el `.md` correspondiente y se
vuelve a compilar.

## Por qué este enfoque

- El texto queda versionado en Git como texto plano (diffs legibles, historial real de
  cambios) — un `.docx` binario no se puede versionar bien.
- Los agentes LLM (Redactor, Revisor) trabajan directamente sobre Markdown, que es el
  formato en el que mejor operan.
- El formato institucional (fuente, interlineado, márgenes, numeración, tabla de
  contenidos) se define **una sola vez** en `styles/thesis-styles.js` y se aplica
  automáticamente a todo el documento — cero trabajo manual de formato en Word.

## Stack

- Node.js + [`docx`](https://www.npmjs.com/package/docx) (librería para generar `.docx`
  mediante código, sin depender de Word ni de macros).
- [`citation-js`](https://citation.js.org/) (`@citation-js/core` + `plugin-bibtex` +
  `plugin-csl`) para el **gestor de citas IEEE**: parsea `referencias.bib` y formatea
  tanto las citas numeradas como la lista de Referencias final usando el estilo CSL
  oficial "ieee", en vez de reimplementar las reglas de formato IEEE a mano.
- Un parser simple de Markdown → estructura intermedia → objetos `docx` (Paragraph,
  Heading, Table, etc.).

## Estructura

```
tools/docx-builder/
├── README.md              ← este archivo
├── package.json
├── build-thesis.js        ← script principal: orquesta todo el proceso
├── src/
│   ├── markdown-parser.js ← convierte cada .md de docs/tesis/ a bloques intermedios
│   ├── citations.js       ← gestor de citas IEEE (referencias.bib -> [1],[2].. + lista final)
│   ├── docx-assembler.js  ← arma el Document() final con docx.js
│   └── config.js          ← orden de capítulos, metadatos de portada
└── styles/
    └── thesis-styles.js   ← fuente, tamaños, interlineado, márgenes, numeración
                              (AJUSTAR según el reglamento exacto de tu facultad)
```

## Citas IEEE — cómo citar en el Markdown

En cualquier capítulo de `docs/tesis/`, citá así:

```markdown
El algoritmo NSGA-II introduce un enfoque elitista de ordenamiento [@deb2002].
```

Usando la clave exacta de `docs/tesis/referencias.bib`. El número `[1]`, `[2]`, etc. se
calcula solo al compilar, según el orden real de aparición en el documento final — nunca
se escribe el número a mano. Ver la convención completa en el encabezado de
`referencias.bib` y en `agents/redactor-tesis/AGENT.md`.

## Uso

```bash
cd tools/docx-builder
npm install
npm run build
```

Esto genera `docs/tesis/output/tesis-final.docx`, recorriendo los capítulos en el orden
definido en `src/config.js` (mismo orden que la tabla de `README.md` raíz y del
`ROADMAP.md`).

## Antes de la primera compilación real

1. Conseguí el **reglamento de formato de tesis** de tu facultad (fuente, tamaño, margen,
   interlineado, numeración de páginas, formato de tabla de contenidos, normas de
   citación exigidas) — es de las primeras tareas de la Fase 0 del `ROADMAP.md`.
2. Volcá esos valores en `styles/thesis-styles.js`.
3. Completá los metadatos de portada (título, autor, tutor, carrera, fecha) en
   `src/config.js`.

## Estado

🟡 Esqueleto inicial. `build-thesis.js` y los módulos de `src/` tienen la estructura y
comentarios `TODO` — la implementación real conviene hacerla junto con el Agente
Programador una vez que el reglamento de formato esté confirmado (no tiene sentido
implementar el estilo exacto antes de saber qué exige la facultad).

# 🌉 Optimización Multiobjetivo (NSGA-II) y Generación Automática de Modelos BIM (ISO 19650) para el Diseño de Puentes Viales de Hormigón Armado

> Trabajo Final de Grado — Ingeniería Civil
> José Valentino Chiappini Vergara · Facultad de Ciencias, Tecnología y Producción (FACITPRO) · Universidad Internacional Tres Fronteras (UNINTER) · Ciudad del Este, Paraguay · 2026

[![Status](https://img.shields.io/badge/estado-en%20desarrollo-yellow)]()
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)]()
[![License](https://img.shields.io/badge/licencia-MIT-green)]()

---

> 🤖 **¿Vas a continuar este proyecto con un agente autónomo (OpenCode, Claude Code, etc.)?**
> Empezá por [`OPENCODE.md`](OPENCODE.md) — tiene el estado exacto del proyecto, qué está
> cerrado, qué falta, y el orden de prioridad de las próximas acciones.

> ⚠️ **Descargo de responsabilidad profesional:** esta es una herramienta académica
> desarrollada en el marco de un trabajo de grado. Los resultados que genera (diseños
> estructurales, modelos BIM, verificaciones normativas) son de apoyo al proceso de
> diseño y **no reemplazan el cálculo, criterio y firma de un ingeniero civil
> matriculado**. Ningún diseño producido por esta herramienta debe usarse para
> construcción real sin la revisión, validación y responsabilidad profesional
> correspondiente de un ingeniero habilitado.

## 📖 Descripción

Este proyecto desarrolla una **herramienta computacional paramétrica** que optimiza el diseño estructural de puentes viales de hormigón armado mediante un **algoritmo genético multiobjetivo (NSGA-II)**, y genera automáticamente el **modelo BIM correspondiente conforme a ISO 19650**, a partir de parámetros de entrada del sitio (luz, carga vehicular, condiciones geotécnicas).

El proyecto nace de una problemática concreta: el **Manual de Carreteras del Paraguay** presenta tipologías y planos estandarizados que son difíciles de adaptar a condiciones específicas de cada sitio, lo que obliga a reinterpretar y recalcular manualmente cada caso, generando diseños conservadores, tiempos largos de cotización/diseño y una nula trazabilidad BIM entre cálculo estructural y documentación gráfica.

A diferencia de un diseño puntual de un puente, este proyecto entrega un **producto reutilizable**: una plataforma abierta (motor de optimización + generador BIM + visualizador web) que puede aplicarse a **múltiples tipologías estructurales**, pensada para ser usada por estudios de ingeniería y empresas del sector privado paraguayo.

### Objetivo general

Desarrollar una herramienta computacional paramétrica que, mediante NSGA-II, optimice el diseño estructural de puentes viales de hormigón armado (minimizando costo y peso propio, maximizando eficiencia estructural), y que genere automáticamente el modelo BIM correspondiente, validando el proceso mediante casos paramétricos de referencia basados en tipologías del Manual de Carreteras del Paraguay.

### Tipologías contempladas

| Tipología | Estado | Módulo |
|---|---|---|
| Losa maciza de hormigón armado | 🟡 En desarrollo | `src/engine/src/structural/tipologias/losaMaciza.ts` |
| Puente de vigas T (hormigón armado, colado in situ) | ⚪ Planificado | `src/engine/src/structural/tipologias/vigaT.ts` |
| Puente de vigas premoldeadas pretensadas | ⚪ Planificado | `src/engine/src/structural/tipologias/vigaPremoldeada.ts` |

> El sistema está diseñado con una interfaz base común (`baseTipologia.ts`) para que agregar una nueva tipología sea un proceso estandarizado. Todo el proyecto es TypeScript — ver [`docs/software/decisiones-arquitectura.md`](docs/software/decisiones-arquitectura.md) (ADR-002) para el porqué, y [`docs/software/arquitectura.md`](docs/software/arquitectura.md) para el detalle.

---

## 🗂️ Estructura del proyecto

Monorepo npm (workspaces): un solo lenguaje (TypeScript) en todo el proyecto — ver
[`docs/software/decisiones-arquitectura.md`](docs/software/decisiones-arquitectura.md)
(ADR-002) para el porqué.

```
tesis-puentes-bim/
│
├── README.md                      ← este archivo
├── OPENCODE.md                    ← onboarding para agentes autónomos (OpenCode, Claude Code)
├── package.json                   ← workspaces del monorepo (src/engine, src/web, tools/docx-builder)
├── LICENSE
├── CONTRIBUTING.md                ← convenciones de código, commits, branches
├── CHANGELOG.md                   ← historial de avances (útil para informes de avance de tesis)
├── .gitignore
│
├── agents/                        ← fichas de rol para trabajar con LLMs (ver agents/README.md)
│   ├── README.md                  ← cómo se relacionan los 4 agentes entre sí
│   ├── programador/AGENT.md
│   ├── investigador/AGENT.md
│   ├── redactor-tesis/AGENT.md
│   └── revisor-qa/AGENT.md
│
├── src/
│   ├── engine/                    ← @tesis-puentes-bim/engine: TODO el cálculo, sin backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── README.md
│   │   ├── src/
│   │   │   ├── config/loadYaml.ts        ← lee data/parametros_tipologia/*.yaml
│   │   │   ├── structural/
│   │   │   │   ├── baseTipologia.ts      ← interfaz común a toda tipología
│   │   │   │   ├── tipologias/losaMaciza.ts
│   │   │   │   └── cargas.ts
│   │   │   ├── optimization/
│   │   │   │   ├── nsga2.ts               ← implementación propia de NSGA-II
│   │   │   │   ├── objetivos.ts
│   │   │   │   └── restricciones.ts
│   │   │   ├── bim/
│   │   │   │   ├── ifcGenerator.ts        ← genera IFC en el navegador (web-ifc, WASM)
│   │   │   │   └── iso19650Metadata.ts
│   │   │   ├── topografia/                🔵 planificado, ver extension-geotecnia-topografia.md
│   │   │   └── geotecnia/                 🔵 planificado, ídem
│   │   └── tests/
│   │       ├── losaMaciza.test.ts
│   │       └── benchmarks/                ← NSGA-II validado contra ZDT1/SRN (literatura)
│   │
│   └── web/                       ← frontend (React), consume @tesis-puentes-bim/engine
│       ├── public/
│       └── src/components/
│
├── tools/
│   └── docx-builder/              ← compila docs/tesis/*.md → .docx final (Node.js + docx)
│       ├── README.md
│       ├── package.json
│       ├── build-thesis.js
│       ├── src/                   ← markdown-parser.js, citations.js (IEEE), docx-assembler.js, config.js
│       └── styles/                ← thesis-styles.js (formato institucional centralizado)
│
├── docs/                          ← TODA la documentación vive acá
│   │
│   ├── tesis/                     ← Documento académico formal (el "libro" de la tesis, en Markdown)
│   │   ├── ROADMAP.md             ← plan completo de 10 meses (programación + tesis en paralelo)
│   │   ├── bitacora-busquedas.md  ← registro de toda búsqueda bibliográfica/normativa realizada
│   │   ├── supuestos-y-limitaciones.md ← qué se asumió y por qué, en el momento en que se decide
│   │   ├── 00-portada-caratula.md
│   │   ├── 01-introduccion.md
│   │   ├── 02-marco-teorico.md
│   │   ├── 03-estado-del-arte.md
│   │   ├── 04-metodologia.md
│   │   ├── 05-desarrollo.md
│   │   ├── 06-resultados-validacion.md
│   │   ├── 07-conclusiones-recomendaciones.md
│   │   ├── anexos/                ← memorias de cálculo, planillas, planos
│   │   ├── output/                ← .docx compilado por tools/docx-builder (no se edita a mano)
│   │   └── referencias.bib        ← bibliografía en formato BibTeX
│   │
│   ├── software/                  ← Documentación TÉCNICA del software (para GitHub/portfolio)
│   │   ├── arquitectura.md        ← diagrama y explicación de módulos
│   │   ├── decisiones-arquitectura.md ← registro ADR (por qué se descartó Python, etc.)
│   │   ├── algoritmo-nsga2.md     ← formulación matemática: variables, objetivos, restricciones
│   │   ├── modelo-estructural.md  ← hipótesis de cálculo, normativa aplicada por tipología
│   │   ├── plan-de-validacion.md  ← criterios de aceptación, definidos ANTES de tener resultados
│   │   ├── extension-geotecnia-topografia.md ← especificación de extensión futura (planificada)
│   │   ├── bim-ifc.md             ← cómo se genera el IFC, mapeo de parámetros ISO 19650
│   │   ├── despliegue-web.md      ← publicación de src/web en GitHub Pages
│   │   └── guia-instalacion.md    ← cómo correr el proyecto localmente
│   │
│   ├── normativa/                 ← resúmenes/fichas técnicas de referencia normativa
│   │   ├── manual-carreteras-py.md
│   │   └── aashto-lrfd-resumen.md
│   │
│   └── figuras/                   ← diagramas, capturas, gráficos usados en tesis y docs
│
├── data/
│   ├── parametros_tipologia/      ← YAML de variables/objetivos/restricciones por tipología
│   ├── casos_referencia/          ← casos paramétricos usados para validar (del Manual de Carreteras)
│   └── resultados/                ← frentes de Pareto y salidas generadas (no versionar resultados pesados)
│
├── examples/                      ← ejemplos end-to-end por tipología, listos para correr
└── .github/workflows/             ← CI (tests + benchmarks NSGA-II) y deploy a GitHub Pages
```

**Regla simple para no perderte:** si es texto que explica el *software* (cómo funciona, cómo se instala, cómo se generó el IFC) va en `docs/software/`. Si es texto que forma parte del *documento de tesis en sí* (el que se defiende ante el tribunal) va en `docs/tesis/`. Nunca se mezclan.

---

## 🛠️ Stack tecnológico

| Componente | Tecnología |
|---|---|
| Motor de cálculo (único, sin backend) | TypeScript — `src/engine/` (`@tesis-puentes-bim/engine`), corre 100% en el navegador |
| Motor de optimización | NSGA-II implementado desde cero en TS, validado contra benchmarks ZDT1/SRN de la literatura (no existe un `pymoo` equivalente maduro en npm — ver `docs/software/decisiones-arquitectura.md`, ADR-002) |
| Cálculo estructural | TypeScript — implementación propia según AASHTO STANDARD 2002 / Manual de Carreteras PY |
| Generación BIM | [`web-ifc`](https://github.com/ThatOpen/engine_web-ifc) (WASM) — lectura y escritura de IFC en el navegador |
| Frontend / Visualizador | React + Three.js / `web-ifc` |
| Backend | Ninguno — no hace falta, todo el cómputo es client-side |
| Despliegue del demo web | GitHub Pages vía GitHub Actions (100% estático — ver `docs/software/despliegue-web.md`) |
| Testing | [`vitest`](https://vitest.dev/) |
| CI/CD | GitHub Actions |
| Compilación del documento de tesis | Node.js + [`docx`](https://www.npmjs.com/package/docx) — ver `tools/docx-builder/` |

---

## 🚀 Instalación rápida

```bash
git clone https://github.com/[tu-usuario]/tesis-puentes-bim.git
cd tesis-puentes-bim
npm install    # instala todos los workspaces (engine, web, docx-builder) de una vez
npm run test:engine
```

Ver guía completa en [`docs/software/guia-instalacion.md`](docs/software/guia-instalacion.md).

---

## 🗺️ Roadmap (10 meses)

- [ ] **Mes 1–2:** Marco teórico, relevamiento normativo, definición formal de variables/objetivos/restricciones por tipología.
- [ ] **Mes 3–4:** Implementación del modelo estructural (tipología 1: losa maciza) + motor NSGA-II funcional.
- [ ] **Mes 5:** Validación del motor contra caso de referencia del Manual de Carreteras.
- [ ] **Mes 6:** Generador BIM/IFC + metadatos ISO 19650.
- [ ] **Mes 7:** Extensión a segunda y tercera tipología.
- [ ] **Mes 8:** Desarrollo del visualizador web paramétrico.
- [ ] **Mes 9:** Validación integral, casos de estudio, redacción de resultados.
- [ ] **Mes 10:** Redacción final del documento de tesis, defensa.

> Este roadmap vive también en `CHANGELOG.md`, que se va actualizando con cada avance real (sirve como bitácora para tus informes de avance ante el tutor).

---

## 🤖 Trabajando con LLMs en este proyecto

El proyecto está pensado para desarrollarse con apoyo de LLMs, organizados en 4 roles con
responsabilidades y "carpetas propias" bien delimitadas: **Programador**, **Investigador**,
**Redactor de tesis** y **Revisor/QA**. Ver [`agents/README.md`](agents/README.md) para el
detalle de cada rol y cómo se coordinan entre sí.

El texto de la tesis se escribe siempre en Markdown (`docs/tesis/*.md`) y se compila a
`.docx` con el pipeline en JavaScript de [`tools/docx-builder/`](tools/docx-builder/README.md) —
nunca se edita el `.docx` final a mano.

## 📄 Licencia

Este proyecto se publica bajo licencia MIT — ver [`LICENSE`](LICENSE).

## 👤 Autor

**José Valentino Chiappini Vergara** — Estudiante de Ingeniería Civil, Facultad de
Ciencias, Tecnología y Producción (FACITPRO), Universidad Internacional Tres Fronteras
(UNINTER), Ciudad del Este, Paraguay.
Tesis dirigida por: [Nombre del tutor — pendiente de confirmar].
Contacto: [tu email] · [LinkedIn/GitHub]

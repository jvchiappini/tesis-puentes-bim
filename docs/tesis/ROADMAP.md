# Roadmap completo — Tesis: Optimización NSGA-II y BIM (ISO 19650) para Puentes Viales de Hormigón Armado

> Documento maestro de planificación. Combina el desarrollo del software con la redacción del documento de tesis (~70 páginas), de forma que ambos avancen en paralelo y se retroalimenten: cada decisión técnica que tomás se convierte, casi directamente, en un párrafo de la tesis.
>
> Duración total: **10 meses**, organizados en **6 fases**. Cada fase indica: objetivos, tareas de programación, tareas de redacción (con capítulo y página objetivo), entregables verificables, y criterios para saber que "está terminada".

---

## Cómo usar este documento

- Marcá cada tarea con `[x]` cuando la termines. Este archivo *es* tu bitácora de avance — copiá los hitos completados a `CHANGELOG.md` con fecha real.
- La columna "Tesis" no significa "escribir prosa bonita" — significa **documentar la decisión que tomaste y por qué**, con las fuentes que consultaste. Si programás algo sin anotar de dónde salió la fórmula o el criterio, después vas a perder horas reconstruyendo la justificación.
- Regla de oro: **nunca programés un criterio de diseño sin haber citado antes la norma/fuente que lo respalda** en `docs/normativa/` o en las notas de búsqueda (ver más abajo). Eso es lo que te va a salvar en la defensa cuando el tribunal pregunte "¿por qué elegiste ese coeficiente?".

### Bitácora de búsquedas (obligatoria desde el día 1)

Vas a necesitar demostrar en el Estado del Arte y el Marco Teórico *cómo* llegaste a las fuentes que usaste — no alcanza con citarlas, un tribunal de ingeniería civil paraguayo valora ver el proceso. Creá ya el archivo `docs/tesis/bitacora-busquedas.md` con esta estructura y completalo **cada vez que investigues algo**, no al final:

```markdown
## [Fecha] — Tema buscado: "optimización NSGA-II diseño de puentes"
- Bases consultadas: Google Scholar, Scopus, ResearchGate
- Palabras clave: "bridge optimization NSGA-II", "multi-objective structural design"
- Resultados relevantes encontrados: (3-5 papers con cita completa)
- Conclusión / qué se usa de acá: ...
```

Esto te resuelve dos cosas a la vez: (1) el capítulo de Estado del Arte se escribe casi solo al final porque ya tenés todo ordenado, y (2) es evidencia concreta de rigor metodológico ante el tribunal.

---

## Estructura de páginas objetivo (documento final, ~70 páginas)

| Capítulo | Páginas aprox. | Carpeta |
|---|---|---|
| Portada, índices, resumen/abstract | 5 | `docs/tesis/00-portada-caratula.md` |
| 1. Introducción (contexto, problemática, justificación, objetivos, alcance) | 6-8 | `01-introduccion.md` |
| 2. Marco teórico | 12-15 | `02-marco-teorico.md` |
| 3. Estado del arte | 8-10 | `03-estado-del-arte.md` |
| 4. Metodología | 10-12 | `04-metodologia.md` |
| 5. Desarrollo (implementación) | 15-18 | `05-desarrollo.md` |
| 6. Resultados y validación | 10-12 | `06-resultados-validacion.md` |
| 7. Conclusiones y recomendaciones | 4-5 | `07-conclusiones-recomendaciones.md` |
| Referencias + Anexos (memorias de cálculo, código relevante, planos) | variable, no cuenta en las 70 | `referencias.bib`, `anexos/` |

Este reparto es orientativo — lo importante es que **Desarrollo + Metodología** sean el núcleo (vos generás contenido real ahí, no relleno), y que Marco Teórico no se infle con paja: cada sección teórica debe existir porque *se usa* después en Desarrollo.

---

## FASE 0 — Formalización y arranque (Semanas 1-2)

**Objetivo:** dejar el tema aprobado formalmente y el entorno de trabajo listo.

### Tareas
- [ ] Redactar y presentar el anteproyecto/perfil de tesis a la facultad (título, problemática, objetivos — ya los tenés del README).
- [ ] Confirmar tutor y, si corresponde, co-tutor con perfil en estructuras o en BIM/programación.
- [ ] Revisar el reglamento de tesis de tu facultad: formato exigido (normas APA/IEEE, estructura de capítulos obligatoria, extensión mínima/máxima) — **esto puede obligar a ajustar los nombres de capítulo del roadmap**, chequealo antes de seguir.
- [ ] Repositorio Git inicializado y subido (privado o público, tu decisión) con la estructura ya armada.
- [ ] Entorno de desarrollo funcionando: Node.js 20+ instalado, `npm install` corrido en la raíz (instala los 3 workspaces: `src/engine`, `src/web`, `tools/docx-builder`) sin errores.

### Tesis
- Completar `01-introduccion.md`: contexto (situación de la infraestructura vial en Paraguay, rol del sector privado), problemática (ya definida), justificación (por qué importa resolver esto), objetivos general/específicos (ya definidos), alcance y limitaciones (aclarar explícitamente que es un caso paramétrico, no un puente real construido).

### Entregable de fase
Anteproyecto aprobado + repo funcional con `npm install` corriendo limpio y `npm run test:engine` ejecutando (aunque todos los tests estén en `skip` todavía) — solo para confirmar que el entorno anda.

---

## FASE 1 — Investigación y marco teórico (Semanas 3-8, ~1.5 meses)

**Objetivo:** dominar los tres pilares teóricos (diseño estructural de puentes, NSGA-II, BIM/ISO 19650) antes de programar nada, y dejar el Marco Teórico y el Estado del Arte prácticamente redactados.

### Tareas de investigación (alimentan `bitacora-busquedas.md`)
- [ ] **Diseño estructural de puentes:** Manual de Carreteras del Paraguay (Vol. 4.2, capítulo de puentes — ya localizado, ver `docs/normativa/manual-carreteras-py.md`), AASHTO STANDARD 2002 (17th ed., confirmado como base normativa principal del Manual), bibliografía de hormigón armado (Nilson, Pérez Rocha, o el texto que uses en la carrera).
- [ ] **Algoritmos genéticos / NSGA-II:** paper original de Deb et al. (2002) "A fast and elitist multiobjective genetic algorithm: NSGA-II" (fuente de los benchmarks ZDT1/SRN que hay que implementar), 3-5 papers de aplicación de NSGA-II a optimización estructural de puentes/vigas (buscar en Scopus/Google Scholar: "NSGA-II bridge girder optimization", "multi-objective structural optimization reinforced concrete").
- [ ] **BIM e ISO 19650:** norma ISO 19650-1 y 19650-2 (resumen, no hace falta comprar la norma completa si hay resúmenes académicos/guías BuildingSMART), casos de aplicación BIM en infraestructura vial en Latinoamérica (buscar experiencias en Chile/Colombia que van adelante en BIM público).
- [ ] **Formato IFC en el navegador:** documentación oficial de `web-ifc` (ThatOpen/engine_web-ifc), esquema IFC4 para elementos de infraestructura (IFC Bridge / IFC Alignment si aplica).

### Tareas de programación (en paralelo, exploratorias)
- [ ] Script exploratorio en `src/engine/`: correr una implementación mínima de NSGA-II sobre el problema de prueba ZDT1 (aunque sea muy básica) solo para entender el algoritmo antes de implementarlo en serio.
- [ ] Script exploratorio: generar un elemento IFC simple (una viga geométrica básica) con `web-ifc` y abrirlo en un visor gratuito (ej. BIMvision o el visor web de ThatOpen) para confirmar el flujo completo funciona antes de complicarlo.

### Tesis
- Redactar `02-marco-teorico.md` completo, con sub-secciones: 2.1 Puentes de hormigón armado (tipologías, normativa), 2.2 Optimización multiobjetivo y algoritmos genéticos, 2.3 NSGA-II (formulación matemática general), 2.4 Metodología BIM, 2.5 ISO 19650, 2.6 Formato IFC.
- Redactar `03-estado-del-arte.md` a partir de la bitácora de búsquedas: agrupar antecedentes en 2-3 líneas (ej. "optimización estructural de puentes", "BIM aplicado a infraestructura vial en LATAM") y cerrar con un párrafo que identifique el **vacío** que tu tesis cubre (combinar ambos enfoques en un caso paraguayo, además de la decisión particular de implementarlo íntegramente para navegador).

### Entregable de fase
Capítulos 2 y 3 en borrador completo (≥80% del texto final). Bitácora de búsquedas con al menos 15-20 fuentes registradas.

---

## FASE 2 — Metodología y definición formal del modelo (Semanas 9-12, 1 mes)

**Objetivo:** cerrar, en papel, todas las decisiones de diseño del sistema antes de escribir código estructural: qué variables, qué función objetivo, qué restricciones, con qué tipología empezás.

> ✅ **Esta fase ya está cerrada** — ver `docs/software/algoritmo-nsga2.md` y
> `data/parametros_tipologia/losa_maciza.yaml` (variables V1-V10, parámetros P1-P14,
> objetivos O1-O5, restricciones R1-R11, perfiles `basico`/`avanzado`/`completo`).

### Tareas de programación
- [x] Definir formalmente en `docs/software/algoritmo-nsga2.md`: vector de variables de decisión para la tipología **Losa Maciza**, funciones objetivo, restricciones.
- [x] Definir el rango válido de cada variable y guardarlo en `data/parametros_tipologia/losa_maciza.yaml`.
- [ ] Definir 2-3 **casos paramétricos de referencia** (luces típicas: ej. 10m, 15m, 20m, con carga de diseño según Manual de Carreteras) que vas a usar más adelante para validar — documentarlos en `data/casos_referencia/`.

### Tesis
- Redactar `04-metodologia.md`: tipo de investigación (aplicada/tecnológica), descripción formal del problema de optimización (notación matemática: minimizar f(x) sujeto a g(x) ≤ 0), justificación de por qué NSGA-II implementado desde cero (vs. usar una librería — no existe una madura en npm, ver ADR-002 en `docs/software/decisiones-arquitectura.md`) y por qué TypeScript/navegador (vs. backend — ver ADR-001 y ADR-002 completos, es contenido directo para esta sección), descripción de los casos de validación elegidos y por qué son representativos.

### Entregable de fase
`04-metodologia.md` completo, incluyendo la justificación de la arquitectura (tomada directamente de los ADR). Archivo YAML de parámetros de la tipología 1 versionado (✅ ya hecho). Sin ambigüedades pendientes sobre qué se va a calcular.

---

## FASE 3 — Motor de optimización + núcleo estructural (Semanas 13-20, 2 meses)

**Objetivo:** tener el corazón del sistema funcionando end-to-end para la primera tipología: parámetros de entrada → cálculo estructural → NSGA-II → frente de Pareto. **Orden importante:** el algoritmo (NSGA-II) se implementa y valida contra benchmarks ANTES de acoplarlo al modelo estructural — así cualquier bug que aparezca después se sabe que es del modelo, no del algoritmo. Ver `OPENCODE.md` para el detalle de este orden.

### Tareas de programación
- [ ] Implementar `src/engine/src/optimization/nsga2.ts` (ordenamiento no dominado, crowding distance, selección por torneo, cruce, mutación — ver comentarios del archivo).
- [ ] Implementar `src/engine/tests/benchmarks/zdt1.test.ts` y `srn.test.ts`, sacando el `skip` recién cuando realmente pasen contra los frentes de Pareto conocidos analíticamente de esos problemas de prueba.
- [ ] Implementar `src/engine/src/config/loadYaml.ts`: carga y valida `losa_maciza.yaml` (incluye rechazar la combinación inválida O4+R9 ambos activos).
- [ ] Implementar `src/engine/src/structural/cargas.ts`: cargas vehiculares (camión de diseño del Manual de Carreteras/AASHTO STANDARD 2002), factores de mayoración.
- [ ] Implementar `src/engine/src/structural/tipologias/losaMaciza.ts` completando todos los métodos de `BaseTipologia` (usar un LLM como asistente acá es perfecto: dale el archivo + la ecuación normativa exacta y pedile la implementación, pero **vos revisás y verificás cada fórmula a mano al menos una vez**, con una calculadora, antes de confiar en el código — esto es defendible ante el tribunal, "confiar ciegamente en el LLM" no).
- [ ] Escribir `src/engine/tests/losaMaciza.test.ts` que verifique el cálculo estructural contra un ejemplo resuelto a mano o de un libro de referencia.
- [ ] Implementar `src/engine/src/optimization/objetivos.ts` y `restricciones.ts` conectando con la tipología.
- [ ] Correr la primera optimización completa sobre uno de los casos de referencia y graficar el frente de Pareto (un script simple en `examples/` alcanza, no hace falta nada elaborado).

### Tesis
- Empezar `05-desarrollo.md`, sección "5.1 Implementación y validación de NSGA-II": mostrar el algoritmo implementado y los resultados de los benchmarks ZDT1/SRN contra el frente de Pareto conocido — esta sección es nueva respecto al plan original (ya no hay `pymoo` que "de gratis" esta validación) y es un buen contenido de rigor técnico.
- Sección "5.2 Modelo estructural — Losa maciza": explicar el modelo de cálculo implementado, con las ecuaciones (formato LaTeX/matemático) y su correspondencia con el código.
- Sección "5.3 Integración: del sitio al frente de Pareto": mostrar el flujo completo con capturas del frente de Pareto obtenido para el caso de puentes.

### Entregable de fase
Benchmarks de NSGA-II en verde. Sistema funcional para 1 tipología: parámetros → frente de Pareto reproducible. Secciones 5.1-5.3 en borrador.

---

## FASE 4 — Validación del modelo (Semanas 21-24, 1 mes)

**Objetivo:** demostrar que los resultados del sistema son correctos y razonables — esta fase es la que le da **credibilidad científica** a toda la tesis.

### Tareas de programación
- [ ] Comparar los resultados óptimos obtenidos contra un diseño de referencia (una solución típica según el Manual de Carreteras, calculada de forma tradicional/manual, **sin reutilizar código de `src/engine/`** — ver `docs/software/plan-de-validacion.md`) para los 2-3 casos de referencia definidos en Fase 2.
- [ ] Analizar el frente de Pareto: ¿tiene sentido físico? ¿las soluciones "baratas" son realmente menos eficientes, las "eficientes" realmente cuestan más? Documentar cualquier resultado contraintuitivo y explicarlo (a veces revela un error de modelado, a veces es un hallazgo real).
- [ ] Análisis de sensibilidad básico: ¿cómo cambia el frente de Pareto si varío la población o generaciones del NSGA-II? (para justificar los hiperparámetros elegidos, no solo "porque sí").

### Tesis
- Redactar `06-resultados-validacion.md` (al menos la parte de la tipología 1): tablas comparativas diseño tradicional vs. óptimo, gráficos del frente de Pareto, discusión crítica de resultados.

### Entregable de fase
Validación cuantitativa documentada, con los criterios de `docs/software/plan-de-validacion.md` aplicados sin relajar. Esta es la parte que más peso tiene frente al tribunal — no la apures.

---

## FASE 5 — BIM/IFC + extensión de tipologías + web (Semanas 25-34, ~2.5 meses)

**Objetivo:** completar el resto del alcance ambicioso: generación BIM automática, segunda/tercera tipología, y el visualizador web desplegado en GitHub Pages.

### Tareas de programación (orden sugerido, ajustable según cómo vengas de tiempo)
- [ ] `src/engine/src/bim/ifcGenerator.ts`: generar el modelo IFC de la solución óptima seleccionada con `web-ifc` (geometría 3D básica del elemento estructural + propiedades).
- [ ] `src/engine/src/bim/iso19650Metadata.ts`: aplicar clasificación/metadatos según ISO 19650 (nomenclatura de contenedores de información, niveles de definición LOD/LOI).
- [ ] Implementar **Viga T** (`vigaT.ts`) siguiendo el mismo patrón que Losa Maciza — debería ser más rápido porque ya tenés el molde (interfaz `BaseTipologia`).
- [ ] (Si el tiempo alcanza) implementar **Viga Premoldeada Pretensada** — la más compleja, dejarla para el final o como "trabajo futuro" si el cronograma se ajusta.
- [ ] Inicializar `src/web/` con Vite + React: formulario de parámetros de entrada, gráfico interactivo del frente de Pareto, visor 3D del IFC generado (importando `@tesis-puentes-bim/engine` como dependencia del workspace).
- [ ] Configurar y probar el deploy en GitHub Pages (`docs/software/despliegue-web.md`, `.github/workflows/deploy-pages.yml` ya están listos — falta habilitar "GitHub Actions" como Source en Settings → Pages del repo real).

### Tesis
- Sección "5.4 Generación automática de modelos BIM": documentar el mapeo de parámetros a entidades IFC y cómo se cumplen los requisitos de ISO 19650.
- Sección "5.5 Extensión a múltiples tipologías": documentar qué tan reutilizable resultó la arquitectura (`BaseTipologia`) al agregar Viga T — esto es un resultado en sí mismo, vale cuánto esfuerzo tomó vs. la primera tipología.
- Sección "5.6 Herramienta web y despliegue": documentar la arquitectura de la aplicación y el flujo de despliegue 100% estático (sin backend), con capturas de pantalla y el link real del demo publicado.

### Entregable de fase
Al menos 2 tipologías funcionando, generación IFC operativa, visualizador web navegable **y publicado en GitHub Pages** (no necesita ser perfecto visualmente, pero sí funcional y accesible por link).

> **Nota de manejo de tiempo:** si a esta altura ves que te vas a quedar corto de meses, la tipología 3 (viga premoldeada) y el pulido visual del frontend son lo primero que se recorta — poné eso como "trabajo futuro" en las conclusiones. Lo que **no** se recorta es la validación (Fase 4) ni los benchmarks de NSGA-II (Fase 3) ni la documentación.

---

## FASE 6 — Cierre: validación integral y redacción final (Semanas 35-42, 2 meses)

**Objetivo:** consolidar todo en el documento final de ~70 páginas, coherente y revisado.

### Tareas de programación
- [ ] Casos de estudio finales en `examples/`: 2-3 ejemplos end-to-end completos y reproducibles (input → Pareto → IFC), documentados con un README propio cada uno — esto es lo primero que va a mirar cualquiera que clone tu repo.
- [ ] Revisar cobertura de tests (`vitest run --coverage` en `src/engine/`), apuntar a que el código del motor tenga tests razonables (no hace falta 100%, pero sí lo crítico) — y confirmar que los benchmarks de NSGA-II (ZDT1, SRN) siguen en verde.
- [ ] Limpieza general de código: comentarios JSDoc completos, tipado estricto sin `any` sueltos, remover scripts exploratorios que ya no aporten.
- [ ] Grabar un video corto (2-3 min) o GIF del visualizador web funcionando (idealmente del demo real publicado en GitHub Pages) — sirve para la defensa y para el README de GitHub.

### Tesis
- Completar `06-resultados-validacion.md` con resultados de todas las tipologías implementadas.
- Redactar `07-conclusiones-recomendaciones.md`: conclusión por cada objetivo específico (¿se cumplió? ¿con qué salvedades?), limitaciones honestas del trabajo, líneas de trabajo futuro (tipologías no implementadas, cargas dinámicas/sísmicas, integración con software BIM comercial, etc.).
- Completar resumen/abstract (en español e inglés si tu facultad lo exige).
- Armar `referencias.bib` completo y verificar formato de citación exigido.
- Armar anexos: memorias de cálculo detalladas, fragmentos de código relevante, capturas del visor BIM.
- **Revisión integral:** leer el documento completo de punta a punta al menos 2 veces, idealmente con alguien más (compañero, tutor) — buscar inconsistencias entre lo que dice la metodología y lo que realmente se hizo (es muy común que estas se desalineen cuando el desarrollo real se desvía del plan original; ajustar el texto para reflejar lo que efectivamente se construyó).
- Preparar presentación de defensa (slides), anticipando preguntas típicas: "¿por qué NSGA-II y no otro algoritmo?", "¿por qué estos parámetros del algoritmo genético?", "¿cómo validaste que el modelo estructural es correcto?", "¿qué tan realista es el costo estimado?".

### Entregable de fase
Documento de tesis completo (~70 páginas) listo para entrega formal. Repositorio de GitHub pulido y presentable. Defensa preparada.

---

## Resumen visual del cronograma

| Fase | Semanas | Foco principal |
|---|---|---|
| 0. Arranque | 1-2 | Formalización + entorno |
| 1. Investigación | 3-8 | Marco teórico + Estado del arte |
| 2. Metodología | 9-12 | Definición formal del modelo (✅ cerrada) |
| 3. Núcleo técnico | 13-20 | NSGA-II + benchmarks + cálculo estructural (tipología 1) |
| 4. Validación | 21-24 | Credibilidad científica de resultados |
| 5. BIM + extensión + web | 25-34 | IFC, tipologías 2-3, web publicada en GitHub Pages |
| 6. Cierre | 35-42 | Redacción final + defensa |

Esto suma ~42 semanas (~9.5 meses), dejándote un pequeño colchón dentro de tus 10 meses para imprevistos (trámites administrativos de la facultad, correcciones del tutor que tardan en volver, etc. — siempre pasa).

---

## Trabajo futuro (fuera de alcance de los 10 meses)

- **Ingesta automática de topografía y geotecnia**: dado un sitio (coordenadas), sugerir
  automáticamente un perfil de elevación aproximado (DEM público) y parámetros de suelo
  de referencia, siempre marcados explícitamente como estimación (no reemplazan
  levantamiento/sondaje real exigido por el Manual PY). Ver especificación completa en
  `docs/software/extension-geotecnia-topografia.md` y los módulos placeholder en
  `src/engine/src/topografia/` y `src/engine/src/geotecnia/`. Mencionar esto en el
  capítulo de Conclusiones como línea de trabajo futuro es un buen cierre — demuestra
  visión de producto sin comprometer el cronograma actual.

## Riesgos a vigilar

- **Alcance inflado:** es la tesis más ambiciosa de las que charlamos hoy. El `BaseTipologia` abstracto está para que, si te falta tiempo, puedas entregar con 1-2 tipologías sólidas en vez de 3 mal hechas, sin que se note como un recorte improvisado.
- **Código hecho con LLM sin entender:** vas a usar LLMs para el código (bien hecho, es la forma moderna de trabajar), pero en la defensa te van a preguntar el *por qué* de cada fórmula estructural. Asegurate de poder explicar cada ecuación sin mirar el código.
- **Desalineación metodología-desarrollo:** es normal que el plan cambie sobre la marcha. El error es no actualizar el capítulo de Metodología para que refleje lo que realmente pasó — el tribunal nota enseguida cuando el texto describe un plan que no es lo que se ve en el software entregado.
- **NSGA-II implementado desde cero:** el proyecto no usa una librería validada de la comunidad (no existe una madura en npm — ver `docs/software/decisiones-arquitectura.md`, ADR-002). Prepará bien la respuesta a "¿cómo sabés que tu implementación de NSGA-II es correcta?" — la respuesta está en los benchmarks ZDT1/SRN de `src/engine/tests/benchmarks/`, pero tenés que poder explicarla con seguridad, no solo señalar que "el test pasa".

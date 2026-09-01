# Registro de decisiones de arquitectura (ADR)

Formato ligero de "Architecture Decision Record": cada decisión importante queda anotada
con su contexto, alternativas evaluadas y motivo — incluidas las decisiones que después
se revirtieron. Mostrar este proceso (no solo el resultado final) es evidencia de
criterio de ingeniería real, y da contenido directo para la sección de Metodología de la
tesis ("se evaluó X, se descartó por Y, se adoptó Z").

---

## ADR-001 — Motor dual: Python (académico) + TypeScript (demo web)

**Estado:** 🔴 Superseded por ADR-002.

**Contexto:** se necesitaba correr el cálculo estructural + NSGA-II + generación BIM
tanto para la validación académica de la tesis como para un visualizador web público en
GitHub Pages (que no admite backend).

**Decisión tomada en su momento:** mantener `src/core/` en Python (usando `pymoo` e
`ifcopenshell`, librerías maduras) para la tesis, y reimplementar el mismo cálculo en
`src/web/src/engine/` (TypeScript) para el demo, con un mecanismo de validación cruzada
(`tests/cross_validation/`) que comparara ambos motores contra las mismas tolerancias del
plan de validación.

**Por qué se descartó:** al preguntarse explícitamente "¿hace falta tener los dos?", el
análisis mostró que mantener dos implementaciones era más costo que beneficio para un
desarrollo en solitario de 10 meses — cada fórmula estructural y cada regla del algoritmo
había que escribirla y mantenerla dos veces, con el riesgo constante de que divergieran.

---

## ADR-002 — Motor único en TypeScript, con validación por benchmarks de la literatura

**Estado:** 🟢 Vigente (decisión actual del proyecto).

**Contexto:** mismo problema que ADR-001, pero evaluando si un único motor en TypeScript
alcanza sin sacrificar rigor científico.

**Investigación previa a la decisión** (ver `docs/tesis/bitacora-busquedas.md`,
2026-08-30):
- BIM: `web-ifc` (ThatOpen/engine_web-ifc) soporta lectura Y escritura de IFC en el
  navegador, activamente mantenido — deja de ser un motivo para necesitar Python.
- NSGA-II: **no existe** en el ecosistema npm una librería con la madurez/adopción de
  `pymoo`. Esta es la asimetría real entre ambas piezas del sistema.

**Decisión:** todo el proyecto (cálculo estructural, NSGA-II, generación BIM) se
implementa en TypeScript, en un único paquete `src/engine/`, sin backend. Se elimina
`src/core/` (Python) y `src/api/` (FastAPI).

**Cómo se compensa el riesgo de implementar NSGA-II desde cero** (la parte que
`pymoo` resolvía "gratis" con una implementación ya validada por la comunidad
científica): la implementación propia de NSGA-II debe validarse contra los **problemas
de prueba estándar de la literatura de optimización multiobjetivo** (ZDT1, SRN — los
mismos que usa el paper original de Deb et al., 2002), no solo contra el caso de puentes
propio. Ver `src/engine/tests/benchmarks/`. Esto da el mismo nivel de rigor que "usar una
librería validada", solo que la validación la hace el propio proyecto en vez de
heredarla de `pymoo`.

**Consecuencias aceptadas:**
- Se pierde la conveniencia de `pymoo` e `ifcopenshell` (APIs de más alto nivel, más
  battle-tested). Se compensa con los benchmarks obligatorios (NSGA-II) y con revisión
  cuidadosa de la API de `web-ifc` (BIM).
- El proyecto ya no puede citar "usamos pymoo, la librería de referencia de la
  literatura" como argumento de rigor — ahora el argumento es "implementamos NSGA-II y lo
  validamos contra los mismos problemas de prueba que usó el paper original que lo
  propuso", lo cual es igual de defendible, pero hay que hacerlo bien.
- Todo el proyecto (motor + web + generador de tesis) queda en un único lenguaje
  (TypeScript/JavaScript), lo cual simplifica mucho el desarrollo en solitario con apoyo
  de LLMs -- era el objetivo original de esta decisión.

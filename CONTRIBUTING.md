# Guía de contribución / convenciones internas

Aunque este es un proyecto de tesis individual, mantener estas convenciones facilita
que el repositorio sea legible por terceros (tribunal, reclutadores, colaboradores futuros).

## Commits
Usar [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: agrega módulo de optimización NSGA-II`
- `fix: corrige cálculo de excentricidad en viga T`
- `docs: agrega ficha normativa AASHTO`
- `test: agrega tests unitarios para base_tipologia`

## Branches
- `main`: siempre estable y ejecutable.
- `dev`: integración de avances.
- `feature/<nombre>`: una rama por funcionalidad (ej. `feature/viga-premoldeada`).

## Código
- TypeScript en modo `strict` en todo el proyecto (`src/engine/tsconfig.json`).
- Toda función de cálculo estructural debe citar la norma/artículo que implementa (comentario JSDoc).
- `src/engine/` no depende de `src/web/` — es un paquete independiente que `src/web/`
  consume como dependencia de workspace, nunca al revés.
- El NSGA-II implementado en `src/engine/src/optimization/nsga2.ts` debe pasar los
  benchmarks de `src/engine/tests/benchmarks/` (ZDT1, SRN) antes de usarse sobre el caso
  real de puentes — ver `docs/software/decisiones-arquitectura.md`, ADR-002.

## Documentación
- Software → `docs/software/`
- Contenido de tesis → `docs/tesis/`
- Todo nuevo módulo en `src/engine/src/` debe tener su contraparte explicada en `docs/software/`.

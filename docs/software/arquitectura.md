# Arquitectura del software

## Resumen

Todo el proyecto (cálculo estructural, optimización NSGA-II, generación BIM) es
**TypeScript**, corre **100% en el navegador del usuario**, y no depende de ningún
backend. Ver el porqué de esta decisión en `docs/software/decisiones-arquitectura.md`
(ADR-002).

## Paquetes del monorepo (npm workspaces)

```
src/engine/    ← @tesis-puentes-bim/engine: calculo estructural, NSGA-II, generacion BIM
src/web/       ← aplicacion React que consume src/engine y renderiza el visualizador
tools/docx-builder/  ← compila docs/tesis/*.md -> .docx (independiente del engine)
```

## Flujo de datos (visualizador web)

```
Usuario ingresa parametros de sitio (formulario React)
        |
        v
src/engine/src/config/loadYaml.ts   -- carga data/parametros_tipologia/<tipologia>.yaml
        |
        v
src/engine/src/structural/tipologias/*.ts   -- calcula solicitaciones y verifica restricciones
        |
        v
src/engine/src/optimization/nsga2.ts        -- optimiza (frente de Pareto)
        |
        v
Usuario elige una solucion del frente de Pareto (UI React)
        |
        v
src/engine/src/bim/ifcGenerator.ts          -- genera el modelo IFC (web-ifc, WASM)
        |
        v
Visualizador 3D en el navegador (Three.js / web-ifc-three)
```

Todo corre en el mismo proceso del navegador -- no hay llamadas de red a un backend
propio en ningún paso de este flujo.

## Por qué una sola tipología usa toda la arquitectura como ejemplo

`src/engine/src/structural/baseTipologia.ts` define la interfaz común para que agregar
una nueva tipología (Viga T, Viga Premoldeada) sea un proceso estandarizado: implementar
esa interfaz + agregar su YAML de parámetros en `data/parametros_tipologia/`. Ver
`docs/tesis/ROADMAP.md` para el orden de implementación planeado.

## Documentos relacionados

- `docs/software/algoritmo-nsga2.md` — espacio de variables/parámetros/objetivos/restricciones.
- `docs/software/plan-de-validacion.md` — criterios de aceptación de resultados.
- `docs/software/decisiones-arquitectura.md` — historial de decisiones (ADR).
- `docs/software/despliegue-web.md` — cómo se publica `src/web/` en GitHub Pages.
- `docs/software/extension-geotecnia-topografia.md` — extensión futura planificada.

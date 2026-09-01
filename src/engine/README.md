# @tesis-puentes-bim/engine

Motor único (TypeScript) del proyecto: cálculo estructural por tipología, optimización
NSGA-II, y generación de modelos BIM (IFC vía `web-ifc`). Corre 100% en el navegador del
usuario, sin backend — es lo que consume `src/web/` para el visualizador público en
GitHub Pages.

Ver `docs/software/arquitectura.md` en la raíz del proyecto para el detalle completo, y
`docs/software/decisiones-arquitectura.md` para el porqué de esta decisión (incluye la
arquitectura de doble motor Python+TS que se evaluó y se descartó antes de esta).

## Estructura

```
src/
├── config/loadYaml.ts       ← lee data/parametros_tipologia/*.yaml (fuente unica de config)
├── structural/
│   ├── baseTipologia.ts     ← interfaz comun a toda tipologia estructural
│   ├── tipologias/
│   │   └── losaMaciza.ts
│   └── cargas.ts
├── optimization/
│   ├── nsga2.ts              ← implementacion propia de NSGA-II
│   ├── objetivos.ts
│   └── restricciones.ts
├── bim/
│   ├── ifcGenerator.ts        ← generacion de IFC con web-ifc
│   └── iso19650Metadata.ts
├── geotecnia/                🔵 planificado, no implementado
└── topografia/                🔵 planificado, no implementado

tests/
├── losaMaciza.test.ts                  ← contra calculo manual / caso de referencia
└── benchmarks/
    ├── zdt1.test.ts                    ← NSGA-II validado contra problema de prueba ZDT1
    └── srn.test.ts                     ← NSGA-II validado contra problema de prueba SRN
```

## Por qué hay una carpeta `benchmarks/`

No existe en el ecosistema JS una librería de NSGA-II con la madurez de `pymoo` (Python) --
confirmado por búsqueda antes de tomar esta decisión, ver
`docs/tesis/bitacora-busquedas.md`. Como se implementa NSGA-II desde cero acá, la forma de
demostrar que la implementación es correcta (y no solo "funciona en mi caso de puentes")
es validarla contra los problemas de prueba estándar de la literatura de optimización
multiobjetivo (ZDT1, SRN — los mismos que usa el paper original de Deb et al. 2002),
verificando que el frente de Pareto obtenido coincide con el conocido analíticamente. Esto
reemplaza a la validación cruzada Python↔TS de la arquitectura anterior, con el mismo
nivel de rigor.

## Uso

```bash
npm install
npm test              # corre todos los tests, incluidos los benchmarks de NSGA-II
npm run test:benchmarks
```

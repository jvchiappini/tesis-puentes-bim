# Changelog

Bitácora de avances del proyecto. Sirve como respaldo para los informes de avance ante el tutor.
Formato: `## [Fecha] - Hito`

## [2026-08-31] - Generación de modelo BIM IFC4 (web-ifc) + visor 3D en la web
- Implementado `src/engine/src/bim/ifcGenerator.ts` (escritura IFC4 con web-ifc: proyecto,
  sitio, losa maciza con geometría solida por extrusión, material, unidades SI, contexto
  geométrico) y `src/engine/src/bim/iso19650Metadata.ts` (metadata ISO 19650 + property
  set "Pset_TesisDiseno" con variables de diseño, resultados estructurales y normativa).
- Se documentaron las reglas de la API de escritura de web-ifc (tipos definidos del
  namespace IFC4, wasm en navegador) en `docs/software/bim-ifc.md`.
- Web: visor 3D paramétrico (Three.js: tablero + armadura principal/repartición + apoyos)
  al seleccionar una solución del frente, y botón "Descargar modelo IFC4 (.ifc)" que
  genera el IFC en el navegador (wasm empaquetado por Vite).
- Tests: 43 pasan (incluye `ifcGenerator.test.ts`: el IFC generado se re-lee con web-ifc y
  contiene 1 de cada entidad clave). `tsc --noEmit` limpio en engine y web.

## [2026-08-31] - Modelo estructural de losa maciza parametrizado + visualizador web (Vite) en línea
- Implementado `src/engine/src/config/loadYaml.ts` (valida el YAML: filosofía normativa,
  items `activo`, y regla O4/R9 mutuamente excluyentes) y `src/engine/src/config/expresiones.ts`
  (evaluador seguro de fórmulas parametrizadas: impacto, espesor mínimo, repartición, nº de vías).
- Implementado `src/engine/src/structural/tipologias/losaMaciza.ts`: solicitaciones (camión
  HS-20 + carga de faja + impacto I=50/(L+125), combinación Group I LFD), flexión φMn,
  restricciones R1–R7, R9 y R10, costos y peso propio. **Todo valor sale de
  `parametros_normativos` del YAML (modificable) — nada hardcodeado**; los valores pendientes
  de contrastar contra AASHTO quedan marcados `[VERIFICAR]` y editables.
- API pública del engine en `src/engine/src/index.ts`.
- `src/web/` inicializado con **Vite + React + TS**: formulario de parámetros de sitio, corre
  el NSGA-II sobre la losa (perfil `basico`) y grafica el frente de Pareto (SVG) + tabla de
  soluciones. `npm run build:web` ahora funciona (antes fallaba por workspace inexistente) →
  desbloquea el deploy de GitHub Pages.
- Tests: 40 pasan — incluido el modelo contra caso calculado a mano (±2% en φMn), la
  integración NSGA-II + losa (frente factible), loadYaml y expresiones. `tsc --noEmit` limpio.
- Documentado el modelo en `docs/software/modelo-estructural.md`.

## [2026-08-31] - NSGA-II implementado desde cero y validado contra benchmarks de la literatura (ZDT1, SRN)
- Implementado `src/engine/src/optimization/nsga2.ts`: fast-non-dominated-sort, crowding
  distance, torneo binario, cruce SBX y mutación polinomial (genotipo normalizado en
  [0,1], decodificado por tipo de variable: continua / discreta / discreta_categorica) y
  dominancia restringida para restricciones. Semilla opcional (mulberry32) para
  reproducibilidad.
- Nuevo `src/engine/src/optimization/metricasFrente.ts`: distancia generacional (GD),
  índice de spread (Deb 2002, ec. 9) y normalización de frentes.
- Nuevo `src/engine/src/optimization/problemasBenchmark.ts`: ZDT1 (frente analítico
  f2 = 1-sqrt(f1)) y SRN (con restricciones g1, g2) + frentes de referencia.
- Tests de componentes unitarios + benchmarks (antes `skip`, ahora activos): 23 tests
  pasan. Criterios definidos ANTES de correr (ver `docs/software/plan-de-validacion.md`):
  ZDT1 GD < 0.02 (observado ~0.006–0.007 a 500 generaciones), spread < 0.5;
  SRN ≥ 95% factible (observado 100%), GD normalizado < 0.05 (observado ~0.002 a 250
  generaciones), no-dominación mutua. Semilla fija en los tests.
- `tsc --noEmit` sin errores. La regla de OPENCODE.md ("nunca confiar en un resultado del
  NSGA-II sobre el caso de puentes si los benchmarks no pasan") queda habilitada.

## [2026-08-31] - Obtenido texto completo de Cap. 4.2.3.2 Cargas y 4.2.3.5 Hormigón Armado (Manual PY Vol. 4.2)
- Descargado el PDF oficial (20 MB, 832 páginas) y resuelto el bloqueo de extracción
  (la capa de texto usa una fuente sin mapeo Unicode; se aplicó OCR local sobre páginas
  renderizadas con pdftoppm).
- **P3 camión de diseño CONFIRMADO:** el Manual PY no define camión propio; usa cargas
  vivas AASHTO (camión H/HS-20 o carga de faja). NO es HL-93 (eso es LRFD).
- **P4 impacto CONFIRMADO:** I = 50/(L+125), máx. 30% (AASHTO STANDARD Art. 3.8, al que
  remite el Manual).
- **R1 CONFIRMADO:** Cap. 4.2.3.5 remite a la Sección 8 de AASHTO STANDARD.
- **R4 CONFIRMADO el origen:** espesor mínimo de losa según AASHTO STANDARD Art. 8.9
  (el Manual no lo define; se corrige la referencia previa a LRFD).
- Confirmados además: vías de tránsito (3,00 m / 3,50 m / dos vías en calzada 7,30 m);
  hormigones Tabla 4.2_17 (35 a 13 MPa); acero Grado 60 fy 420 MPa (Tabla 4.2_18);
  recubrimientos Art. 8.22 AASHTO (2,5 a 7,5 cm); peso específico HA 24 kN/m³;
  losas de aproximación (espesor mín. 20 cm).
- Actualizados: `docs/normativa/manual-carreteras-py.md`, `algoritmo-nsga2.md`,
  `losa_maciza.yaml`, `docs/tesis/bitacora-busquedas.md`.

## [Sin fecha] - Setup inicial
- Estructura de carpetas y documentación base creada.
- Definición de título, problemática y objetivos (Opción A: puentes viales HA + NSGA-II + BIM).

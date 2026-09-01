# Guía de continuidad para agentes autónomos (OpenCode y similares)

> Leé este archivo primero, siempre, antes de tocar cualquier otra cosa del repo. Está
> escrito específicamente para que un agente de codificación autónomo (OpenCode, Claude
> Code, o similar) retome el proyecto sin perder el contexto de sesiones anteriores.

## Qué es este proyecto (resumen de 30 segundos)

Tesis de grado (Ingeniería Civil, UNINTER/FACITPRO, Ciudad del Este, Paraguay) que
desarrolla una herramienta de optimización multiobjetivo (NSGA-II) + generación
automática de modelos BIM (IFC, ISO 19650) para el diseño de puentes viales de hormigón
armado, basada en el Manual de Carreteras del Paraguay. Autor: José Valentino Chiappini
Vergara. **Todo el proyecto es TypeScript, monorepo npm workspaces, sin backend — todo el
cómputo corre en el navegador del usuario.** Ver `README.md` para el detalle completo y
`docs/tesis/ROADMAP.md` para el plan de 10 meses.

## Orden de lectura obligatorio antes de programar cualquier cosa

1. `README.md` — estructura completa del proyecto y stack.
2. `docs/tesis/ROADMAP.md` — en qué fase estamos y qué sigue.
3. `agents/README.md` y la ficha del rol que vas a asumir (`agents/programador/AGENT.md`
   es la más relevante para trabajo de código).
4. `docs/software/decisiones-arquitectura.md` — **registro ADR, léelo entero.** Explica
   por qué el proyecto pasó de "Python académico + TS demo" a "TypeScript único" (ADR-002).
   Si en algún momento te parece raro no encontrar Python en el repo, la respuesta está ahí.
5. `docs/software/algoritmo-nsga2.md` — el espacio de variables/parámetros/objetivos/
   restricciones ya definido (Fase 2, cerrada).
6. `data/parametros_tipologia/losa_maciza.yaml` — la config real que el motor debe leer.
7. `docs/tesis/bitacora-busquedas.md` — **antes de asumir cualquier valor normativo,
   revisá si ya se buscó acá.** No repitas búsquedas ya hechas ni inventes valores que
   están marcados `[VERIFICAR]` sin buscarlos primero.
8. `docs/tesis/supuestos-y-limitaciones.md` — qué se asumió (no qué se buscó) para poder
   avanzar. Completalo en el momento en que tomes una decisión de este tipo, no después.
9. `docs/software/plan-de-validacion.md` — criterios de aceptación ya definidos para la
   Fase 4, incluida la validación obligatoria del NSGA-II contra benchmarks de la
   literatura (ZDT1, SRN). No los relajes ni los redefinas para que un resultado "pase".

## Estado actual exacto (al cierre de esta sesión)

### Cerrado / no reabrir sin razón
- Fase 0 y Fase 1 del ROADMAP: estructura de repo, marco teórico/investigación inicial.
- Fase 2: espacio completo de variables (V1-V10), parámetros (P1-P14), objetivos (O1-O5)
  y restricciones (R1-R11) para la tipología **Losa Maciza**, con perfiles `basico` /
  `avanzado` / `completo` ya definidos en el YAML.
- Pipeline de citas IEEE (`tools/docx-builder/src/citations.js`) y estructura de
  compilación docx — **esqueletos con TODOs, arquitectura ya decidida, no rediseñar**.
- Datos personales/institucionales completados en `README.md`, `LICENSE`,
  `tools/docx-builder/src/config.js`.
- **ADR-002 (vigente): arquitectura de motor único en TypeScript.** Se evaluó y se
  descartó un motor dual Python+TS (ADR-001, ver historial en
  `docs/software/decisiones-arquitectura.md`). Motivo del descarte: mantener dos
  implementaciones del mismo cálculo era más costo que beneficio para un desarrollo en
  solitario. `src/core/` (Python) y `src/api/` (FastAPI) **ya no existen** — todo vive en
  `src/engine/` (TypeScript, `@tesis-puentes-bim/engine`), consumido por `src/web/`
  (React), sin backend.
- **Compensación por no tener `pymoo`:** el NSGA-II se implementa desde cero en
  `src/engine/src/optimization/nsga2.ts`, y se valida contra los benchmarks
  estándar de la literatura (ZDT1, SRN — problemas de prueba del paper original de Deb
  et al. 2002) en `src/engine/tests/benchmarks/`. **IMPLEMENTADO Y PASANDO (2026-08-31):**
  los benchmarks ya no están en `skip`; 23 tests del engine pasan (unitarios por
  componente + ZDT1 + SRN), `tsc --noEmit` sin errores. Criterios y umbrales en
  `docs/software/plan-de-validacion.md` y en los propios tests (semilla fija =
  deterministas). El algoritmo es genérico (ProblemaOptimizacion) y ya está listo para
  acoplarse al caso real de la losa maciza.

### Confirmado con fuente real (no inventar, no volver a buscar)
- El Manual de Carreteras del Paraguay usa **AASHTO STANDARD 2002 (17th ed.)** como base
  normativa PRINCIPAL para diseño de puentes — **no AASHTO LRFD**. Ver
  `docs/normativa/manual-carreteras-py.md`.
- **Regla no negociable:** nunca mezclar ecuaciones de AASHTO STANDARD y AASHTO LRFD en
  la misma corrida. Esto ya está reflejado como `filosofia_normativa` en el YAML — el
  motor DEBE leer y respetar ese campo, fallando explícitamente si detecta mezcla.
- Ancho de calzada mínimo: 7,30 m (doble vía) / 4,00 m (simple vía) — confirmado, Tabla
  4.2_6 del Manual.
- Clasificación de puentes por longitud confirmada (Pequeños/Medianos/Grandes/Mayores).
- El capítulo correcto del Manual es **Volumen 4.2** (no "4.3.2", error de una búsqueda
  anterior ya corregido en todos los archivos).
- `web-ifc` (ThatOpen/engine_web-ifc) soporta lectura Y escritura de IFC en el navegador,
  activamente mantenido — es la librería BIM del proyecto, ver
  `src/engine/src/bim/ifcGenerator.ts`.
- No existe una librería npm de NSGA-II con la madurez de `pymoo` — de ahí la
  implementación propia y la obligación de los benchmarks (ver arriba).
- **Texto completo de Cap. 4.2.3.2 "Cargas" (pág. 307) y 4.2.3.5 "Hormigón Armado"
  (pág. 360) OBTENIDO (2026-08-31)** — descarga directa del PDF (20 MB, 832 págs.) +
  render con `pdftoppm` + OCR local (Windows.Media.Ocr, es-MX), porque la capa de texto
  del PDF usa una fuente sin mapeo Unicode. Detalle en
  `docs/normativa/manual-carreteras-py.md` y `docs/tesis/bitacora-busquedas.md`.
  Con esto quedaron resueltos los `[VERIFICAR]` de P3, P4, R1 y R4:
  - **P3**: el Manual PY no define camión propio; usa cargas vivas AASHTO (camión H/HS-20
    o carga de faja). **NO es HL-93** (HL-93 es de AASHTO LRFD).
  - **P4**: I = 50/(L+125) (%), L en pies, máx. 30% — AASHTO STANDARD Art. 3.8.2.2, al que
    remite el Manual.
  - **R1**: Cap. 4.2.3.5 remite íntegramente a la Sección 8 de AASHTO STANDARD.
  - **R4**: el Manual no define espesor mínimo de losa → AASHTO STANDARD Art. 8.9 (corrige
    la referencia previa a LRFD Tabla 2.5.2.6.3-1).
  - Confirmados además: vías de tránsito (camión 3,00 m; nº vías = ancho/3,50 m; calzada
    7,30 m → dos vías de media calzada); hormigones Tabla 4.2_17 (P 35 a E 13 MPa); acero
    Grado 60, fy 420 MPa (Tabla 4.2_18); recubrimientos Art. 8.22 (2,5–7,5 cm); peso
    específico HA 24 kN/m³; losas de aproximación (espesor mín. 20 cm).

### Pendiente — próxima acción concreta, en orden de prioridad
1. ~~**Conseguir el texto completo de los Cap. 4.2.3.2 "Cargas" (pág. 307) y 4.2.3.5
   "Hormigón Armado" (pág. 360)**~~ — ✅ RESUELTO (2026-08-31), ver sección de
   confirmados. Quedan pendientes de verificar los valores exactos de **R2/R3** (cuantías)
   y **R4** (espesor mínimo, fórmula de AASHTO STANDARD Art. 8.9) contra el texto de
   AASHTO, y completar los `[VERIFICAR]` restantes del YAML si quedara alguno.
2. ~~**Implementar `src/engine/src/optimization/nsga2.ts` y validar contra ZDT1/SRN**~~ —
   ✅ RESUELTO (2026-08-31): benchmarks pasando (23 tests), ver sección "Cerrado".
   Próxima acción concreta:
3. **Implementar `src/engine/src/structural/tipologias/losaMaciza.ts`** (hoy son métodos
   con `throw new Error("TODO")`), citando en cada comentario JSDoc la ecuación y el
   artículo exacto de la norma (regla no negociable del Agente Programador, ver
   `agents/programador/AGENT.md`). El NSGA-II ya está listo para acoplarse vía
   `ProblemaOptimizacion` (ver cómo lo hacen los benchmarks en
   `src/engine/src/optimization/problemasBenchmark.ts`).
4. Implementar `src/engine/src/config/loadYaml.ts` (carga y valida el YAML — incluye la
   regla de que O4/R9 no pueden estar ambos activos) y `src/engine/src/bim/ifcGenerator.ts`
   (con `web-ifc`).
5. Recién ahí: `src/web/` (inicializar con Vite — **hoy `npm run build:web` falla porque
   el workspace no existe**, pendiente deliberado del plan) y `tools/docx-builder/`
   (parser Markdown, ensamblador docx, citas) — sus arquitecturas ya están decididas,
   solo falta implementación.

## Reglas que no se negocian (repetidas acá porque son las que más se rompen)

- **Nunca inventar un valor normativo.** Si algo no está confirmado con fuente real en
  `bitacora-busquedas.md` o `docs/normativa/`, se marca `[VERIFICAR]` y se busca antes de
  usarlo en código o en texto de tesis.
- **Nunca mezclar AASHTO STANDARD y AASHTO LRFD** en el mismo cálculo.
- **Nunca activar simultáneamente O4_deflexion_servicio y R9_deflexion_servicio** en el
  YAML (son la misma cantidad física modelada dos veces).
- **Nunca confiar en un resultado del NSGA-II sobre el caso de puentes si los benchmarks
  de `src/engine/tests/benchmarks/` no pasan primero.**
- Todo módulo de `src/engine/src/` necesita tests en `src/engine/tests/` que verifiquen
  al menos un caso calculado a mano o de un caso de referencia — no alcanza con "el
  código corre".
- `src/engine/` nunca importa de `src/web/` (la dependencia va al revés).
- Las versiones de dependencias están **fijadas** (sin `^`) en cada `package.json` del
  monorepo, por reproducibilidad — no actualizar con `npm update` sin dejar constancia
  deliberada en `CHANGELOG.md`.
- Toda solución "óptima" final que viole alguna restricción activa es, por definición,
  un fallo de validación (ver `docs/software/plan-de-validacion.md`) — nunca se entrega
  ni se documenta como válida.
- Toda decisión de arquitectura significativa se registra como entrada nueva en
  `docs/software/decisiones-arquitectura.md` (formato ADR), no solo en el historial de
  commits.
- Todo lo que hagas: reflejalo en `CHANGELOG.md` con fecha real, y actualizá este archivo
  (`OPENCODE.md`) al final de la sesión con el nuevo estado — es la forma en que la
  siguiente sesión (humana o de otro agente) sabe dónde quedaste.

## Comandos útiles

```bash
# Instalar TODO el monorepo (una sola vez)
npm install

# Correr los tests del motor (incluye benchmarks de NSGA-II una vez implementados)
npm run test:engine

# Levantar el visualizador web en local (una vez inicializado con Vite)
npm run dev --workspace=src/web

# Compilar el documento de tesis a .docx (una vez implementado)
npm run build --workspace=tools/docx-builder
```

No hay ningún entorno Python que instalar en este proyecto — si en algún momento ves un
`requirements.txt`, un `venv` o una llamada a `pip`/`pytest` referenciada en algún
archivo viejo, es un resto de la arquitectura ADR-001 (descartada) y hay que corregirlo,
no seguirlo.

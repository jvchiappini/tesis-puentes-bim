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
  `src/engine/src/optimization/nsga2.ts`, y debe validarse contra los benchmarks
  estándar de la literatura (ZDT1, SRN — problemas de prueba del paper original de Deb
  et al. 2002) en `src/engine/tests/benchmarks/`, hoy marcados `skip`. Sacar el `skip`
  es la señal de que ese hito se cumplió — nunca sacarlo sin que el test realmente pase.

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

### Pendiente — próxima acción concreta, en orden de prioridad
1. **Conseguir el texto completo de los Cap. 4.2.3.2 "Cargas" (pág. 307) y 4.2.3.5
   "Hormigón Armado" (pág. 360)** del Manual. La fuente ya identificada es:
   `http://normativa.itafec.com/obras-de-paso-puentes-estructuras/PG.07.01.001.OT.pdf`
   — la extracción vía `web_fetch` de Claude se corta sistemáticamente en la página 301
   sin importar el límite de tokens pedido (probablemente un límite del extractor de la
   herramienta, no de la fuente). **Si tenés acceso a red completo (que un agente como
   OpenCode normalmente sí tiene), la forma correcta de resolver esto es:**
   ```bash
   curl -o /tmp/manual-puentes.pdf http://normativa.itafec.com/obras-de-paso-puentes-estructuras/PG.07.01.001.OT.pdf
   # luego extraer texto de las paginas 307 y 360 en adelante con una libreria de PDF
   # en Node (ej. pdf-parse, pdfjs-dist) en vez de un fetcher web con limite de extraccion
   ```
   Actualizar `docs/normativa/manual-carreteras-py.md` y reemplazar los `[VERIFICAR]` de
   `docs/software/algoritmo-nsga2.md` y del YAML con los valores reales una vez obtenidos.
2. **Implementar `src/engine/src/optimization/nsga2.ts` primero, antes que el modelo
   estructural.** Cambio de orden respecto a sesiones anteriores: como el algoritmo no
   depende del caso de puentes, conviene implementarlo y dejarlo pasando los benchmarks
   de `src/engine/tests/benchmarks/` (ZDT1, SRN) ANTES de acoplarlo al modelo estructural
   — así cualquier bug que aparezca después se sabe que es del modelo, no del algoritmo.
3. Recién con (1) y (2) resueltos: implementar
   `src/engine/src/structural/tipologias/losaMaciza.ts` (hoy son métodos con
   `throw new Error("TODO")`), citando en cada comentario JSDoc la ecuación y el
   artículo exacto de la norma (regla no negociable del Agente Programador, ver
   `agents/programador/AGENT.md`).
4. Implementar `src/engine/src/config/loadYaml.ts` (carga y valida el YAML — incluye la
   regla de que O4/R9 no pueden estar ambos activos) y `src/engine/src/bim/ifcGenerator.ts`
   (con `web-ifc`).
5. Recién ahí: `src/web/` (inicializar con Vite) y `tools/docx-builder/` (parser
   Markdown, ensamblador docx, citas) — sus arquitecturas ya están decididas, solo falta
   implementación.

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

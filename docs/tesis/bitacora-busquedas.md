# Bitácora de búsquedas

Registro de toda búsqueda bibliográfica y normativa realizada durante el proyecto.
Mantenida por el Agente Investigador (ver `agents/investigador/AGENT.md`).
Completar una entrada por cada sesión de búsqueda, no al final del proyecto.

Formato de cada entrada:

```markdown
## [Fecha] — Tema buscado: "..."
- Bases consultadas: ...
- Palabras clave usadas: ...
- Fuentes relevantes encontradas: ...
- Conclusión / qué se usa de esto en el proyecto: ...
```

---

<!-- Las entradas reales empiezan acá abajo -->

## 2026-08-29 — Tema buscado: "Manual de Carreteras del Paraguay - estructura del capítulo de puentes"
- Bases consultadas: Google (web), sitio normativadecarreteras.com, apcarreteras.org.py
- Palabras clave usadas: "Manual de Carreteras del Paraguay puentes losa hormigón armado"
- Fuentes relevantes encontradas:
  - Manual de Carreteras del Paraguay, Revisión 2019 (MOPC) — capítulo 4.3.2 "Guía para el
    Diseño Estructural de Puentes de Hormigón Armado", con sub-sección 4.3.2.1 "Tableros y
    Sistemas de Tableros" (aplicable directamente a la tipología Losa Maciza), y sección
    4.3.3.1 "Puentes de Hormigón Armado para Caminos Vecinales". Fuente:
    normativadecarreteras.com/listing/guia-diseno-puentes-manual-carreteras-del-paraguay/
  - Existe además un "Manual con Diseños Estructurales Estandarizados para Puentes de
    Hormigón Armado" (Resolución MOPC N° 42, autor Ing. Jorge Rodríguez, con apoyo BID),
    dividido en Manual de Cálculo, Memoria de Utilización, Atlas de Planos y
    Especificaciones Técnicas — potencial fuente adicional a conseguir en su versión
    completa.
  - Catálogo de puentes de hormigón armado para caminos vecinales: Capítulo 8.5 del Manual.
- Conclusión / qué se usa de esto en el proyecto: el capítulo 4.3.2.1 es la referencia
  normativa primaria a citar en `docs/software/modelo-estructural.md` para la tipología
  Losa Maciza. PENDIENTE: conseguir el PDF completo del capítulo 4.3.2 (no solo el índice)
  para extraer los criterios exactos de espesor mínimo, cuantías y recubrimientos vigentes
  en Paraguay — hasta entonces, el modelo usa como respaldo provisorio AASHTO LRFD
  (ver entrada siguiente), marcado explícitamente como tal.

## 2026-08-29 — Tema buscado: "AASHTO LRFD losas de puente - variables de diseño"
- Bases consultadas: Google (web), FHWA, manuales de diseño de DOTs (Illinois, Arizona,
  California, Minnesota) que aplican AASHTO LRFD
- Palabras clave usadas: "AASHTO LRFD slab bridge design minimum thickness reinforcement"
- Fuentes relevantes encontradas:
  - AASHTO LRFD Bridge Design Specifications — artículos relevantes identificados:
    4.6.2.1 (métodos de análisis de tableros), 5.6.3.3 (armadura mínima), 5.6.7 (control
    de fisuración), 5.10.3 (separación de armadura), Tabla 2.5.2.6.3-1 (espesor mínimo
    de losa por luz).
  - Guías de aplicación estatales (IDOT, Caltrans, MnDOT) confirman de forma consistente
    que las variables típicas de diseño de una losa de hormigón armado son: espesor de
    losa, diámetro/separación de armadura principal y de repartición, resistencia del
    hormigón, y recubrimiento (varía según exposición ambiental).
- Conclusión / qué se usa de esto en el proyecto: define el espacio de variables de
  `docs/software/algoritmo-nsga2.md` y las restricciones normativas iniciales. AASHTO se
  usa como referencia técnica de respaldo porque el Manual de Carreteras del Paraguay
  remite explícitamente a AASHTO para varios aspectos de diseño geométrico y estructural.

## 2026-08-29 — Tema buscado: "NSGA-II optimización multiobjetivo hormigón armado - objetivos típicos"
- Bases consultadas: Google Scholar / ResearchGate / ScienceDirect (vía búsqueda web)
- Palabras clave usadas: "NSGA-II reinforced concrete optimization objectives constraints"
- Fuentes relevantes encontradas:
  - Kaveh & Sabzi (Engineering Structures and Technologies, 2016) — optimización de
    pórticos de hormigón armado con NSGA-II, 2 objetivos (costo y desplazamiento),
    restricciones según ACI.
  - Estudio de optimización de losas de hormigón armado con NSGA-II considerando
    incendio (2022, ResearchGate) — confirma el patrón de "pocos objetivos, restricciones
    normativas explícitas" como enfoque estándar en la literatura.
  - Estudio NSGA-III en edificios de hormigón armado (2023, ScienceDirect) — introduce
    huella hídrica/de carbono como objetivo adicional junto a costo, tratando volumen de
    acero y hormigón como objetivos independientes en algunos casos.
- Conclusión / qué se usa de esto en el proyecto: confirma que costo + peso propio son el
  par de objetivos "base" estándar en la literatura, y que sumar un objetivo ambiental
  (CO2/huella de carbono) es una extensión razonable y publicable, no una rareza. Se
  incorpora como objetivo opcional (toggleable) en `algoritmo-nsga2.md`.

## 2026-08-29 (cierre de sesión) — Conseguido: PDF real del Manual de Carreteras Vol. 4.2
- Fuente: http://normativa.itafec.com/obras-de-paso-puentes-estructuras/PG.07.01.001.OT.pdf
- Se obtuvo texto completo de los Capítulos 4.2.1 y 4.2.2 completos, y 4.2.3.1 completo
  (págs. 259-301 del volumen). Se corrigió la ubicación del capítulo (era 4.2, no 4.3.2
  como se había anotado por error en la primera búsqueda indirecta).
- **Corrección importante:** el Manual usa AASHTO STANDARD 2002 (17th ed.) como base
  PRINCIPAL, no AASHTO LRFD -- esto ya se propagó a `algoritmo-nsga2.md` y al YAML.
- **Confirmado con texto real:** ancho de calzada mínimo 7,30 m (doble vía) / 4,00 m
  (simple vía); clasificación de puentes por longitud (Pequeños/Medianos/Grandes/Mayores);
  alcance de la Guía limitado a luces libres ≤ 40 m (coincide con nuestra tipología).
- **Pendiente:** Cap. 4.2.3.2 "Cargas" (pág. 307) y 4.2.3.5 "Hormigón Armado" (pág. 360) --
  la extracción automática del PDF se corta sistemáticamente en la página 301 pese a
  reintentos con distinto límite de tokens. **Acción para la próxima sesión (Agente
  Investigador u OpenCode):** descargar el PDF directo con `curl`/`wget` (dominio
  `normativa.itafec.com` no está en la lista blanca de red actual del entorno Claude --
  puede requerir agregarlo, o descargarlo desde una máquina con red abierta) y extraer
  esas dos secciones con la skill `pdf-reading` en vez de `web_fetch`, que tiene un límite
  de extracción que corta el documento a mitad de camino.

## 2026-08-30 — Tema buscado: "librerias NSGA-II y escritura de IFC en JavaScript/TypeScript"
- Bases consultadas: Google (web), GitHub, npm
- Palabras clave usadas: "web-ifc write IFC generation", "NSGA-II javascript typescript npm library maintained"
- Fuentes relevantes encontradas:
  - `ThatOpen/engine_web-ifc` (antes IFC.js) -- confirmado soporte de LECTURA Y ESCRITURA
    de archivos IFC en JS via WASM, activamente mantenido. Resuelve la generacion BIM
    100% client-side.
  - Busqueda de librerias NSGA-II en npm: no se encontro ninguna con la madurez, adopcion
    o respaldo academico de `pymoo` (Python) -- solo repos pequenos de proyectos
    universitarios puntuales (Java, MATLAB, algunos Python), ninguno JS/TS mantenido y
    citado como referencia.
- Conclusion / que se usa de esto en el proyecto: decision de arquitectura tomada (ver
  `docs/software/decisiones-arquitectura.md`, ADR-002) -- se abandona el motor dual
  Python+TS a favor de TypeScript puro, con la condicion de que el NSGA-II implementado
  desde cero se valide contra los problemas de prueba estandar de la literatura (ZDT1,
  SRN, los mismos del paper original de Deb et al. 2002) en vez de validacion cruzada
  contra una segunda implementacion.

## 2026-08-31 — Tema buscado: "Manual Vol. 4.2 - texto completo de 4.2.3.2 Cargas y 4.2.3.5 Hormigón Armado"
- Bases consultadas: PDF oficial descargado directo (dominio normativa.itafec.com), 20 MB,
  832 páginas (el PDF contiene varios volúmenes concatenados; Vol. 4.2 = págs. 263–381 del
  documento = págs. 5–123 del PDF).
- Palabras clave usadas: n/a (extracción de texto de un PDF ya identificado).
- Método: (1) descarga con `curl`; (2) mapeo de páginas (página del documento =
  página del PDF + 258, verificado en dos puntos: 263→5 y 508→250); (3) extracción con
  pdf.js — la capa de texto del cuerpo usa una fuente sin mapeo Unicode (salen caracteres
  privados ilegibles); (4) OCR local con Windows.Media.Ocr (idioma es-MX) sobre páginas
  renderizadas con `pdftoppm` (págs. 49–58 y 102–106 del PDF). Resultado: texto legible
  completo de ambas secciones.
- Fuentes relevantes encontradas (confirmado con texto real, ya no `[VERIFICAR]`):
  - **P3 camión de diseño:** el Manual PY NO define camión propio — "las cargas vivas de
    diseño son las establecidas por las Normativas AASHTO". Esquema: 1er caso camión tipo
    H/HS (HS-20, HS-15) y 2do caso carga de faja, el que dé el efecto más desfavorable.
    **NO es HL-93** (HL-93 es de AASHTO LRFD, solo se presenta como alcance comparativo).
  - **P4 impacto:** el Manual remite al Art. 3.8 de AASHTO y no redefine la fórmula → rige
    I = 50/(L+125) (%), L en pies, máx. 30% (AASHTO STANDARD 2002, Art. 3.8.2.2).
  - **R1:** Cap. 4.2.3.5 remite íntegramente a la Sección 8 de AASHTO STANDARD.
  - **R4:** el Manual no define espesor mínimo de losa → rige AASHTO STANDARD Art. 8.9
    (corrige la referencia previa a LRFD Tabla 2.5.2.6.3-1).
  - Vías de tránsito: ancho de vía de camión 3,00 m; nº vías = ancho/3,50 m; calzada
    7,30 m → dos vías de media calzada.
  - Hormigones (Tabla 4.2_17): P 35 MPa (350 kgf/cm²), A 28, B 21, C 18, D 15, E 13.
  - Acero (Tabla 4.2_18): Grado 60, fy = 420 MPa (4.200 kgf/cm²), punto 8.15.2.2 AASHTO.
  - Recubrimientos (Art. 8.22 AASHTO): contra terreno 7,5 cm; pilotes in situ 7,5 cm;
    intemperie refuerzo principal 5,0 cm / estribos 4,0 cm; losa clima moderado 2,5 cm
    (sup. e inf.); losa ambiente agresivo sup. 4,0 cm / inf. 5,0 cm.
  - Peso específico hormigón armado 24.000 N/m³ (Tabla 4.2_7) = 24 kN/m³.
  - Losas de aproximación: espesor mínimo 20 cm; Ø12 c/20; juntas ≤ 6 m; vano ≤ 25 m².
- Conclusión / qué se usa de esto en el proyecto: se resolvieron los `[VERIFICAR]` de P3,
  P4, R1 y R4 en `algoritmo-nsga2.md` y en `data/parametros_tipologia/losa_maciza.yaml`, y
  se documentó el texto de las secciones en `docs/normativa/manual-carreteras-py.md`. Queda
  registrado el método (OCR) por si se necesita extraer más secciones del mismo PDF.

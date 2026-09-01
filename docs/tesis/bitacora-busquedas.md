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

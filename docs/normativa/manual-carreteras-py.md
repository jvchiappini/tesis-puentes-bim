# Ficha técnica: Manual de Carreteras del Paraguay

**Edición vigente identificada:** Revisión 2019 (MOPC/APC).
**Fuente verificada (PDF completo, no solo índice):**
http://normativa.itafec.com/obras-de-paso-puentes-estructuras/PG.07.01.001.OT.pdf

## Ubicación exacta del capítulo relevante

Corrección respecto a la primera búsqueda: el capítulo correcto es el **Volumen 4.2 "Guía
para el diseño de puentes"**, dentro de la Unidad 4, NO el "4.3.2" que se había anotado
inicialmente por error de lectura de un resultado de búsqueda indirecto.

- **Capítulo 4.2.1** — Aspectos Generales (nomenclatura, clasificación de puentes por
  longitud/vano/calzada/objetivo/materiales/tipología estructural, estándares y normas,
  niveles de estudio).
- **Capítulo 4.2.2** — Ingeniería Básica (geodesia/topografía, hidrología/hidráulica
  fluvial, geotecnia, demanda de tránsito, aspectos ambientales).
- **Capítulo 4.2.3** — Disposiciones y Recomendaciones de Diseño:
  - 4.2.3.1 Aspectos generales del diseño (secciones transversales tipo, anchos mínimos
    de tablero — **confirmado y con texto completo**)
  - **4.2.3.2 Cargas** (pág. 307) — pendiente de obtener texto completo
  - 4.2.3.3 Fundaciones (pág. 317)
  - 4.2.3.4 Muros de contención (pág. 343)
  - **4.2.3.5 Hormigón Armado** (pág. 360) — pendiente de obtener texto completo,
    **es la sección más crítica para nuestro modelo**
  - 4.2.3.6 Hormigón Pretensado (pág. 362)
  - 4.2.3.7 Acero Estructural (pág. 364)
- **Capítulo 4.2.5** — Consideraciones para sistemas constructivos según luz — el alcance
  de esta Guía se limita explícitamente a **puentes con tramos de luces libres no mayores
  a 40 m** (estructuras menores y medianas), lo cual encaja bien con nuestro caso de
  losa maciza.

## Hallazgo normativo clave (confirmado con texto real, no inferido)

> "Actualmente, los puentes se diseñan en general en base a las disposiciones de la
> Norma 17th edición AASHTO (Standard Specifications for Highway Bridges 2002 — en
> adelante AASHTO STANDARD), y en algunos casos con la norma AASHTO LRFD (Bridge Design
> Specifications 2007, en adelante AASHTO LRFD)."

Es decir: **AASHTO STANDARD (2002) es la base principal**, no AASHTO LRFD como se había
asumido en la primera versión de `algoritmo-nsga2.md` — hay que corregir esa referencia.

También es explícito y terminante en un punto que afecta directamente al Programador:

> "Bajo ningún motivo se permitirá la mezcla de normativas con diferentes filosofías de
> cálculo [...] entre AASHTO STANDARD y AASHTO LRFD; ya que las hipótesis iniciales y
> concepciones fundamentales son totalmente distintas y pueden dar lugar a sobre o
> subdimensionamientos."

**Acción para el modelo:** definir explícitamente, como parámetro de configuración del
YAML, qué filosofía de cálculo se usa (`aashto_standard` o `aashto_lrfd`) — nunca mezclar
ecuaciones de ambas dentro de la misma corrida. Se agrega como TODO en
`docs/software/algoritmo-nsga2.md`.

## Ancho de calzada (dato real, ya no `[VERIFICAR]`)

Confirmado con texto completo (Tabla 4.2_6 y texto asociado):
- Ancho de calzada **mínimo** para tránsito bidireccional o unidireccional de doble faja: **7,30 m**.
- Puentes de simple vía (un solo carril): ancho mínimo de calzada **4,00 m**, reservado
  para caminos locales/de desarrollo con velocidad de diseño < 50 km/h y baja proyección
  de crecimiento futuro.
- El tablero debe mantener el ancho total de la plataforma del camino en los accesos.

Esto reemplaza el placeholder `[VERIFICAR]` de P2 (`ancho_calzada`) en el YAML — ver
`data/parametros_tipologia/losa_maciza.yaml`.

## Clasificación de puentes por longitud (dato real)

- Alcantarillas y Puentes Pequeños: 1,0 m < L ≤ 15,0 m
- Puentes Medianos: 15,0 m < L ≤ 40,0 m
- Puentes Grandes: 40,0 m < L ≤ 100,0 m
- Puentes Mayores: L > 100,0 m

Nuestra tipología (losa maciza) encaja naturalmente en **Puentes Pequeños/Medianos**,
coherente con el alcance explícito de la Guía (luces libres ≤ 40 m).

## Sección 4.2.3.2 "Cargas" (pág. 307) — texto completo obtenido ✅

Obtenido el texto completo de las págs. 307–316 vía descarga directa del PDF + extracción
local (ver método al final). Resumen de lo que afecta al modelo:

- **Filosofía de cargas:** la Guía está basada en **AASHTO Standard** (permite ASD y LFD);
  AASHTO LRFD se presenta solo como alcance comparativo. Se remite a la Sección 3 de AASHTO
  para tipos, combinaciones y distribución de cargas.
- **Carga viva de diseño:** *"las cargas vivas de diseño son las establecidas por las
  Normativas AASHTO"* — **el Manual NO define un camión propio**. Esquema de cargas:
  1er caso **camión tipo H / HS** (HS-20, HS-15) y 2do caso **carga de faja**; se usa el
  que produzca el efecto más desfavorable.
  → **P3 resuelto: NO es HL-93** (HL-93 es de AASHTO LRFD); es camión AASHTO STANDARD tipo
  HS-20 (+ carga de faja).
- **Vías de tránsito:** ancho de vía que ocupa un camión = **3,00 m**; número de vías =
  ancho del puente / **3,50 m** (sin fracciones). Para calzada de **7,30 m**: dos vías de
  diseño, cada una con ancho = mitad de la calzada.
- **Impacto:** remite al **Artículo 3.8 de la AASHTO**. No define fórmula propia → rige la
  de AASHTO STANDARD 2002: **I = 50/(L+125) (%)**, L en pies, máx. 30% → **P4 resuelto**.
- **Reducción de intensidad (múltiples vías):** 1–2 vías 100%; 3 vías 90%; 4+ vías 75%.
- **Pasarelas/ciclovías:** carga distribuida 4.067 N/m² (415 kgf/m²).
- **Combinaciones de carga AASHTO Standard (LFD):** Tabla 4.2_8 (Parte B, Sección 3).
- **Pesos específicos (Tabla 4.2_7):** hormigón simple 22.000 N/m³; **hormigón armado y
  pretensado 24.000 N/m³ (= 24 kN/m³)**; capa asfáltica 24.000 N/m³; acero 78.500 N/m³.

## Sección 4.2.3.5 "Hormigón Armado" (pág. 360) — texto completo obtenido ✅

Págs. 360–361 vía el mismo método. Resumen de lo que afecta al modelo:

- **Rige la Sección 8 de AASHTO STANDARD** para todo el diseño de hormigón armado, con las
  modificaciones/complementos del Manual → resuelve R1.
- **Hormigón (Tabla 4.2_17)** — clasificación por resistencia característica a compresión
  en probeta cilíndrica a 28 días: P = 35 MPa (350 kgf/cm²), A = 28 (280), B = 21 (210),
  C = 18 (180), D = 15 (150), E = 13 (130).
- **Acero (Tabla 4.2_18)** — Grado 60, fy = **420 MPa (4.200 kgf/cm²)**, según el punto
  8.15.2.2 de AASHTO Standard.
- **Control de deformaciones:** miembros a flexión con rigidez suficiente para limitar
  deflexiones "para las cargas en servicio más impacto" (Artículos 8.9 y 8.13 AASHTO).
- **Recubrimientos mínimos (Art. 8.22 AASHTO):**
  - Vaciado contra terreno / permanentemente enterrado: **7,5 cm**
  - Pilotes in situ: **7,5 cm**
  - Expuesto a la intemperie o en contacto con la tierra — refuerzo principal: **5,0 cm**;
    estribos/zunchos: **4,0 cm**
  - Losa en climas moderados: refuerzo superior e inferior **2,5 cm**
  - Losa en ambientes agresivos: refuerzo superior **4,0 cm**, inferior **5,0 cm**
- **Diafragmas/travesaños:** según Art. 8.12 AASHTO (vigas T y cajón).
- **Losas de aproximación:** espesor mínimo **20 cm**; armadura mínima Ø12 c/20; juntas a
  no más de 6 m; vanos ≤ 25 m²; diseño como losa sobre lecho elástico.
- **Nota:** el Manual NO especifica por sí mismo el espesor mínimo de losa por luz → R4
  queda regido por AASHTO STANDARD Sección 8 (Art. 8.9), no por LRFD.

> **Método usado para resolver el bloqueo de extracción:** el PDF se descargó directo con
> `curl` (20 MB, 832 páginas) y se extrajo con pdf.js local. La capa de texto del cuerpo usa
> una fuente sin mapeo Unicode (los párrafos salen como caracteres privados ilegibles), por
> lo que las páginas 49–58 y 102–106 del PDF (= págs. 307–316 y 360–364 del documento) se
> renderizaron con `pdftoppm` y se les aplicó OCR local (Windows OCR, idioma es-MX). El
> resultado completo (legible) quedó en el flujo de esta sesión.

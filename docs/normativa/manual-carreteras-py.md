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

## Pendiente (Investigador — próxima búsqueda)

🟡 **Sección 4.2.3.2 "Cargas" (pág. 307) y 4.2.3.5 "Hormigón Armado" (pág. 360)** son las
más críticas para el modelo (camión de diseño exacto, factor de impacto, cuantías,
espesores mínimos, recubrimientos) y todavía no se consiguió su texto completo — la
extracción automática del PDF se corta sistemáticamente alrededor de la página 301 pese a
reintentos. Próximos pasos posibles: (a) descargar el PDF directamente y extraerlo con
`pdf-reading` localmente en vez de `web_fetch`, (b) contactar a la Asociación Paraguaya de
Carreteras (apcarreteras.org.py) o al MOPC directamente, (c) buscar el PDF fuente en
`apcarreteras.org.py/wp-content/uploads/` con nombre de archivo específico del volumen 4.2.

Hasta conseguir esas dos secciones, `algoritmo-nsga2.md` sigue usando AASHTO como respaldo
provisorio en los puntos marcados `[VERIFICAR]`, ahora corregido a **AASHTO STANDARD
2002** (no LRFD) como la referencia de respaldo correcta, dado que es la que el Manual usa
como base principal.

# Formulación del algoritmo NSGA-II — Tipología: Losa Maciza de Hormigón Armado

> Este documento define el **espacio completo** de variables, parámetros, objetivos y
> restricciones que la herramienta puede llegar a manejar para esta tipología. No todo se
> usa desde el día 1: cada elemento tiene un flag `activo` en
> `data/parametros_tipologia/losa_maciza.yaml`, así que se puede arrancar con un
> subconjunto simple (ver "Perfil recomendado para primera corrida" al final) y activar
> el resto progresivamente sin tocar el código del motor de optimización, solo el YAML.
>
> Fuentes: ver `docs/tesis/bitacora-busquedas.md` (entradas 2026-08-29) y
> `docs/normativa/`. **Corrección importante (confirmada con texto real del Manual, no
> inferida):** la base normativa principal del Manual de Carreteras del Paraguay para
> diseño de puentes es **AASHTO STANDARD (17th ed., 2002)**, no AASHTO LRFD -- LRFD se usa
> solo en algunos casos como complemento. El Manual además **prohíbe explícitamente mezclar
> ambas normativas** en un mismo cálculo, por tener hipótesis y filosofías de cálculo
> distintas. Ver `docs/normativa/manual-carreteras-py.md`. Todo criterio marcado
> `[VERIFICAR]` usa AASHTO STANDARD 2002 como respaldo provisorio, pendiente de contrastar
> contra el texto completo de los Cap. 4.2.3.2 (Cargas) y 4.2.3.5 (Hormigón Armado) del
> Manual, aún no conseguidos en texto completo (ver bitácora).
>
> **Sobre el lenguaje de implementación:** todo lo definido en este documento se
> implementa en TypeScript, en el paquete `src/engine/` — el proyecto no tiene motor en
> Python (ver `docs/software/decisiones-arquitectura.md`, ADR-002, para el porqué).

---

## 1. Variables de decisión (lo que NSGA-II optimiza)

Cada variable puede activarse (el algoritmo la mueve dentro de un rango) o fijarse (el
usuario le da un valor constante y el algoritmo no la toca) — útil para simplificar el
problema mientras se depura el modelo.

| # | Variable | Símbolo | Tipo | Rango típico inicial | Activa por defecto |
|---|---|---|---|---|---|
| V1 | Espesor de losa | `h` | continua | 0.20 – 1.20 m | ✅ Sí |
| V2 | Diámetro de armadura principal | `Øp` | discreta (catálogo comercial: 10, 12, 16, 20, 25, 32 mm) | — | ✅ Sí |
| V3 | Separación de armadura principal | `sp` | continua | 0.10 – 0.30 m | ✅ Sí |
| V4 | Diámetro de armadura de repartición/temperatura | `Ør` | discreta (mismo catálogo que V2) | — | ✅ Sí |
| V5 | Separación de armadura de repartición | `sr` | continua | 0.15 – 0.40 m | ✅ Sí |
| V6 | Resistencia especificada del hormigón | `f'c` | discreta (catálogo: 21, 25, 28, 30, 35 MPa) | — | ⚪ No (fijo en 25 MPa) |
| V7 | Grado del acero de refuerzo | `fy` | discreta (categórica: 420, 500 MPa) | — | ⚪ No (fijo en 420 MPa) |
| V8 | Número de capas de armadura principal | `n_capas` | discreta (1 o 2) | — | ⚪ No (fijo en 1) |
| V9 | Recubrimiento de armadura | `c` | continua | según V13 (clase de exposición) | ⚪ No (fijo por norma) |
| V10 | Espesor del voladizo/borde de losa (si aplica) | `h_voladizo` | continua | 0.15 – 0.40 m | ⚪ No (fuera de alcance v1) |

> **Nota:** V6, V7 y V9 empiezan fijas por simplicidad (menos variables = frente de Pareto
> más fácil de interpretar en las primeras corridas). Activarlas después es la forma más
> directa de ampliar el alcance de la tesis si el tiempo lo permite (ver Fase 5 del
> `ROADMAP.md`).

---

## 2. Parámetros de sitio (fijos por corrida, los ingresa el usuario — no los optimiza el algoritmo)

| # | Parámetro | Símbolo | Activo por defecto | Notas |
|---|---|---|---|---|
| P1 | Luz de diseño (libre o efectiva) | `L` | ✅ Sí | Determina espesor mínimo normativo |
| P2 | Ancho de calzada / número de carriles | `w_calzada` | ✅ Sí | |
| P3 | Sobrecarga vehicular de diseño | `camión_diseño` | ✅ Sí | Camión tipo AASHTO HL-93 o el que defina el Manual PY — `[VERIFICAR]` cuál usa Paraguay exactamente |
| P4 | Incremento por carga dinámica (impacto) | `IM` | ✅ Sí | AASHTO STANDARD 2002 usa fórmula de impacto I = 50/(L+125) (%, L en pies), distinta a la de LRFD -- `[VERIFICAR]` valor exacto en sección 4.2.3.2 Cargas del Manual PY, aún no obtenida en texto completo |
| P5 | Peso específico del hormigón | `γ_hormigón` | ✅ Sí | Típico 24 kN/m³ (verificar valor local) |
| P6 | Cargas de barandas/veredas | `q_barandas` | ⚪ No (v1: sin veredas) | Activar si el caso de estudio las incluye |
| P7 | Clase de exposición ambiental | `exposición` | ✅ Sí | Determina recubrimiento mínimo (V9) y control de fisuración |
| P8 | Ángulo de esviaje del puente | `skew` | ⚪ No (v1: puente recto, skew=0) | Afecta distribución de cargas — complejidad no justificada en v1 |
| P9 | Zona sísmica / aceleración de diseño | `A_sismo` | ⚪ No (fuera de alcance v1) | Reservado para extensión futura (ver Conclusiones del ROADMAP) |
| P10 | Tipo de suelo de fundación | `tipo_suelo` | ⚪ No (no afecta el diseño de la losa en sí, solo fundaciones — fuera del alcance de esta tipología) | |
| P11 | Costo unitario del hormigón | `costo_m3_hormigón` | ✅ Sí | Necesario para el objetivo de costo (O1) |
| P12 | Costo unitario del acero | `costo_kg_acero` | ✅ Sí | Necesario para el objetivo de costo (O1) |
| P13 | Costo unitario del encofrado | `costo_m2_encofrado` | ⚪ No (v1: se ignora, o se aproxima como % del costo de hormigón) | |
| P14 | Factor de importancia del puente | `factor_importancia` | ⚪ No (fijo en 1.0) | |

---

## 3. Funciones objetivo (lo que NSGA-II minimiza — todas en sentido "menor es mejor")

| # | Objetivo | Símbolo | Activo por defecto | Justificación |
|---|---|---|---|---|
| O1 | Costo total de materiales (hormigón + acero) | `f_costo` | ✅ Sí | Objetivo estándar en toda la literatura de optimización RC consultada |
| O2 | Peso propio de la estructura | `f_peso` | ✅ Sí | Objetivo estándar; además reduce carga sobre subestructura/fundaciones |
| O3 | Huella de carbono embebida (CO2-eq de materiales) | `f_co2` | ⚪ No | Extensión de sostenibilidad — literatura reciente (2023) la usa junto a costo/peso; buen diferencial para la tesis si el tiempo alcanza |
| O4 | Deflexión de servicio | `f_deflexion` | ⚪ No | Se puede tratar como restricción (más simple) o como objetivo a minimizar (más completo) — definir según cuánto tiempo haya en Fase 3 |
| O5 | Complejidad constructiva (proxy: cantidad de diámetros de barra distintos usados) | `f_complejidad` | ⚪ No | Objetivo "blando", útil para conectar con el argumento de valor para el sector privado (diseños más simples de ejecutar) |

> **Recomendación:** arrancar con **O1 + O2 activos únicamente** (2 objetivos → frente de
> Pareto 2D, fácil de graficar e interpretar). Sumar O3 es el siguiente paso natural
> (3 objetivos siguen siendo visualizables). O4 y O5 quedan como extensión si sobra
> tiempo — ver Fase 5 del `ROADMAP.md`.

---

## 4. Restricciones (deben cumplirse — `g(x) ≤ 0`)

| # | Restricción | Activa por defecto | Fuente normativa |
|---|---|---|---|
| R1 | Flexión ELU: momento resistente ≥ momento último mayorado | ✅ Sí | AASHTO STANDARD 2002 (base normativa principal confirmada) / Manual PY Cap. 4.2.3.5 Hormigón Armado `[VERIFICAR]` (texto completo aún no obtenido) |
| R2 | Cuantía mínima de armadura | ✅ Sí | AASHTO LRFD 5.6.3.3 |
| R3 | Cuantía máxima / sección controlada por tracción (ductilidad) | ✅ Sí | AASHTO LRFD (factor φ según deformación neta) |
| R4 | Espesor mínimo de losa según luz | ✅ Sí | AASHTO LRFD Tabla 2.5.2.6.3-1 / Manual PY `[VERIFICAR]` |
| R5 | Recubrimiento mínimo según exposición | ✅ Sí | AASHTO LRFD 5.10.1 |
| R6 | Separación máxima/mínima entre barras (constructibilidad) | ✅ Sí | AASHTO LRFD 5.10.3 |
| R7 | Armadura de repartición mínima (transversal) | ✅ Sí | AASHTO LRFD 5.10.3.2 (armadura de temperatura/repartición) |
| R8 | Control de fisuración (separación máxima según tensión de servicio) | ⚪ No (v1: se cubre indirectamente con R6) | AASHTO LRFD 5.6.7 — activar cuando se afine el modelo |
| R9 | Deflexión de servicio ≤ límite normativo (si O4 está desactivado, esto se controla acá como restricción en vez de objetivo) | ✅ Sí (modo restricción, activar SOLO si O4 está inactivo) | AASHTO LRFD 2.5.2.6.2 (L/800 típico) |
| R10 | Corte ELU | ⚪ No (v1: losas macizas de puente rara vez gobiernan por corte, se verifica pero no suele ser crítico — activar si el caso de estudio da luces largas) | AASHTO LRFD 5.7.3 |
| R11 | Longitud de desarrollo/anclaje suficiente en apoyos | ⚪ No (v1: se asume anclaje estándar, no se optimiza) | AASHTO LRFD 5.10.8 |

> **Regla de implementación:** R9 y O4 son la misma cantidad física (deflexión de
> servicio) tratada de dos formas distintas. Nunca deben estar activas las dos a la vez
> (estarías optimizando y restringiendo lo mismo, lo cual es redundante e infla el tiempo
> de cómputo sin aportar nada) — el `validador de configuración` del motor debe chequear
> esto al cargar el YAML y fallar si detecta la combinación inválida.

---

## Perfil recomendado para primera corrida (Fase 3 del ROADMAP)

Para no paralizarte con 10 variables y 5 objetivos desde el primer día, el YAML trae un
perfil `basico` ya armado:

- **Variables activas:** V1, V2, V3, V4, V5 (5 variables — espesor + armadura principal y de repartición)
- **Parámetros activos:** P1, P2, P3, P4, P5, P7, P11, P12
- **Objetivos activos:** O1, O2 (2 objetivos)
- **Restricciones activas:** R1, R2, R3, R4, R5, R6, R7, R9

Este es el conjunto mínimo defendible normativamente (cubre flexión, cuantías, espesor,
recubrimiento, separación y deflexión) con 2 objetivos fáciles de graficar. Todo lo demás
(`avanzado`, `completo`) queda definido en el YAML como perfiles alternativos para cuando
haya tiempo de expandir — ver Fases 4-5 del `ROADMAP.md`.

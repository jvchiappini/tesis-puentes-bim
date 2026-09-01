# Registro de supuestos y limitaciones

A diferencia de `bitacora-busquedas.md` (qué se investigó), este archivo registra **qué se
asumió** para poder seguir avanzando cuando no había información definitiva, o cuando se
decidió simplificar algo a propósito para que el alcance sea manejable en 10 meses.

Se completa en el momento en que se toma la decisión, no al final — es la fuente directa
del capítulo de Limitaciones (`07-conclusiones-recomendaciones.md`) y evita tener que
reconstruir "por qué hicimos esto así" leyendo código ocho meses después.

## Formato de cada entrada

```markdown
## [Fecha] — Supuesto: "..."
- Contexto: por qué hizo falta asumir esto (¿faltaba un dato? ¿se simplificó a propósito?)
- Qué se asumió exactamente: ...
- Impacto si el supuesto resulta incorrecto: (bajo/medio/alto) + explicación breve
- Reversible: ¿se puede corregir después sin rehacer trabajo, o compromete algo ya construido?
- Dónde vive en el código/config: (archivo o parámetro del YAML afectado)
```

---

## Supuestos ya identificados en la Fase 2 (trasladar acá con este formato al confirmarlos)

Estos ya están mencionados de forma dispersa en `docs/software/algoritmo-nsga2.md` y el
YAML — quedan pendientes de formalizar acá con el formato completo apenas se retome el
trabajo de desarrollo:

- Puente recto, sin esviaje (`P8_angulo_esviaje` inactivo, skew=0).
- Sin cargas de veredas/barandas en la v1 (`P6` inactivo).
- Resistencia del hormigón y grado del acero fijos, no optimizados (`V6`, `V7` inactivos).
- Recubrimiento derivado de la clase de exposición, no optimizado como variable propia
  (`V9` inactivo).
- Filosofía normativa fijada en AASHTO STANDARD 2002 para toda la corrida (no se permite
  mezclar con LRFD — ver `filosofia_normativa` en el YAML).
- Deflexión de servicio tratada como restricción (R9), no como objetivo (O4) en el perfil
  `basico`.

<!-- Nuevas entradas con el formato completo, a partir de acá -->

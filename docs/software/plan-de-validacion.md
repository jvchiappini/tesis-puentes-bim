# Plan de validación — criterios de aceptación (definidos ANTES de generar resultados)

> Se define esto en la Fase 2/3, antes de tener resultados, a propósito: fijar el criterio
> de "esto pasa / esto no pasa" después de ver los números es una forma (aunque sea
> involuntaria) de ajustar el criterio para que el resultado quede bien. Un tribunal nota
> esto enseguida. Definirlo antes es lo que le da rigor real a la Fase 4 del ROADMAP.

## Qué se valida

Para cada caso de referencia (definido en `data/casos_referencia/`), comparar la solución
óptima entregada por la herramienta contra un diseño de control calculado de forma
tradicional (manual o planilla, sin NSGA-II) para el mismo sitio y las mismas cargas.

## Criterios de aceptación cuantitativos

| Magnitud comparada | Tolerancia aceptada | Qué significa si se excede |
|---|---|---|
| Momento resistente calculado vs. momento de diseño | ± 2% | Error de implementación de la fórmula estructural — **crítico, bloquea la Fase 4** |
| Cuantía de armadura resultante vs. diseño de control | ± 15% | Diferencia esperable (el óptimo no tiene por qué coincidir con el diseño tradicional) — **aceptable si está justificada** en el frente de Pareto (ej. el óptimo prioriza costo distinto a como lo prioriza un ingeniero por defecto) |
| Peso propio resultante vs. diseño de control | ± 15% | Igual criterio que la cuantía — aceptable con justificación, no aceptable si no hay explicación |
| Verificación de restricciones (R1-R11 activas) en la solución óptima | 0% de violaciones | Cualquier restricción violada en la solución "óptima" final es **automáticamente un fallo de validación**, sin excepción — el algoritmo nunca debe entregar una solución que no cumpla las restricciones activas |
| Tiempo de cómputo de una corrida completa | Referencial, no bloqueante | Se documenta igual (para la sección de Desarrollo), pero no es un criterio de aceptación |

## Diferencia importante entre "error" y "hallazgo"

Si el frente de Pareto da un resultado que se aleja del diseño tradicional **pero cumple
todas las restricciones y tiene una explicación estructural razonable** (ej. "el óptimo
usa más cuantía y menos espesor porque para esta luz el acero resulta más barato por kg
de capacidad que el hormigón, dado el costo unitario ingresado"), **eso no es un error de
validación** — es un resultado real del algoritmo y debe documentarse como tal en
`06-resultados-validacion.md`, no descartarse ni "corregirse" ajustando el modelo hasta
que coincida con lo tradicional (eso invalidaría todo el sentido de optimizar).

## Proceso de validación (checklist por caso de referencia)

1. [ ] Calcular el diseño de control de forma independiente (a mano o planilla aparte,
   NO reutilizando funciones de `src/engine/` — si usás el mismo código para "validar" el
   código, no estás validando nada).
2. [ ] Correr la herramienta con los mismos parámetros de sitio.
3. [ ] Verificar 0% de violaciones de restricciones activas en toda solución del frente
   de Pareto final (no solo en la elegida).
4. [ ] Comparar momento resistente, cuantía y peso contra las tolerancias de la tabla.
5. [ ] Si algo excede tolerancia: clasificar como "error de implementación" (volver a
   Fase 3) o "hallazgo explicable" (documentar en Resultados) — nunca dejarlo sin
   clasificar.
6. [ ] Repetir para los 2-3 casos de referencia definidos en Fase 2.
7. [ ] Análisis de sensibilidad: correr el mismo caso variando población/generaciones del
   NSGA-II y confirmar que el frente de Pareto converge (no cambia sustancialmente al
   aumentar generaciones) — esto justifica los hiperparámetros usados.

## Relación con `agents/revisor-qa/AGENT.md`

El Revisor/QA usa este documento como referencia fija al auditar la Fase 4 — no define
criterios propios ni los relaja para que algo "pase".

## Validación adicional obligatoria: NSGA-II contra benchmarks de la literatura

Como el NSGA-II se implementa desde cero en TypeScript (ver
`docs/software/decisiones-arquitectura.md`, ADR-002), además de la validación del modelo
estructural (arriba), hace falta validar que el **algoritmo en sí** es correcto,
independientemente del caso de puentes:

- `src/engine/tests/benchmarks/zdt1.test.ts` — el frente de Pareto obtenido debe
  aproximarse al frente analítico conocido de ZDT1 dentro de una tolerancia a definir
  (ej. generational distance) antes de implementar.
- `src/engine/tests/benchmarks/srn.test.ts` — ídem, con el problema SRN (que incluye
  restricciones), para validar también el manejo de restricciones del algoritmo.

Estos dos tests **deben pasar antes** de confiar en cualquier resultado del NSGA-II sobre
el caso real de la losa maciza — es la contraparte, en esta arquitectura, de "usar una
librería ya validada por la comunidad" (que es lo que `pymoo` daba gratis en la
arquitectura anterior).

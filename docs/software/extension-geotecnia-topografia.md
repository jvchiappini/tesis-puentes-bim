# Extensión futura: ingesta automática de topografía y geotecnia

> Estado: 🔵 **planificada, no implementada**. Este documento define el alcance y las
> reglas de honestidad técnica que debe respetar cuando se implemente, para que no se
> convierta en una fuente de datos "mágicos" sin respaldo verificable.

## Por qué existe esta extensión

Hoy, `P1_luz_diseno` y todos los parámetros de sitio del YAML se ingresan a mano. Sería
muy valioso — para portfolio y para uso real por parte de un estudio de ingeniería — que
la herramienta pueda sugerir automáticamente un punto de partida (perfil de elevación
aproximado, tipo de suelo dominante) a partir de solo las coordenadas del sitio, dejando
al ingeniero completar/corregir con datos reales.

## Regla de oro: nunca ocultar que es una estimación

El Manual de Carreteras del Paraguay exige explícitamente levantamientos topográficos de
precisión (escala 1:500, curvas de nivel cada 0.5 m) y un número mínimo de sondajes
geotécnicos según la longitud del puente (Tablas 4.2_3 y 4.2_4 del Manual). Ningún dato
traído automáticamente de una fuente pública (DEM satelital, mapa de suelos regional)
tiene ese nivel de precisión.

**Por lo tanto, todo resultado de estos módulos debe incluir siempre:**
```python
{
    "valor": ...,
    "fuente": "SRTM 30m" ,       # o la fuente que corresponda
    "es_estimado": True,          # SIEMPRE True para estos módulos
    "resolucion_o_confianza": "...",
    "nota": "Aproximación para nivel de estudio Perfil de Proyecto. No reemplaza "
            "levantamiento topográfico / sondaje geotécnico según Manual de Carreteras "
            "del Paraguay Cap. 4.2.2.2 / 4.2.2.4.",
}
```

Y en el YAML de parámetros, cada parámetro que pueda venir de esta vía debe soportar:
```yaml
P_ejemplo:
  activo: true
  valor: 123
  origen: "manual"  # o "automatico_estimado"
```

## Alcance por fase (si se implementa)

1. **Fase A (mínima):** función que reciba coordenadas y devuelva un perfil de elevación
   aproximado de un DEM público gratuito (SRTM/Copernicus), sin ningún procesamiento
   adicional — solo para tener un número de partida en `P1_luz_diseno` estimada por
   diferencia de cotas de las márgenes.
2. **Fase B:** integración con mapas de suelo regionales (si existen fuentes públicas
   confiables para Paraguay — el Agente Investigador debe confirmar esto antes de
   programar nada, ver `bitacora-busquedas.md`).
3. **Fase C (opcional, avanzada):** permitir que el usuario suba un informe geotécnico
   real (PDF/Excel) y que se parseen automáticamente los valores relevantes — esto sí
   sería un dato real, no estimado, y podría marcarse `origen: "manual_documento"`.

## Por qué esto NO es parte del alcance de la Fase 3-5 actual del ROADMAP

Implementar esto bien (con fuentes confiables y sin inducir a error a quien use la
herramienta) es un proyecto en sí mismo. Se documenta acá para que quede como **línea de
trabajo futuro explícita** en las Conclusiones de la tesis (ver `docs/tesis/ROADMAP.md`,
Fase 6) — mencionarlo ahí demuestra visión de producto sin comprometer el cronograma de
los 10 meses.

## Módulos ya creados (placeholders)

- `src/engine/src/topografia/ingestaAutomatica.ts`
- `src/engine/src/geotecnia/ingestaAutomatica.ts`

Ambos lanzan un error a propósito (`throw new Error(...)`) — están para documentar el
contrato de función esperado (tipos de entrada/salida en TypeScript), no para ser
llamados todavía.

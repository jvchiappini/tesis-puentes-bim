# Modelo estructural por tipología

Hipótesis de cálculo, normativa aplicada y ecuaciones implementadas para cada tipología.
Cada valor numérico y cada fórmula salen de `data/parametros_tipologia/<tipologia>.yaml`
(bloque `parametros_normativos`) — el código no hardcodea nada. Si se ajusta un valor se
edita el YAML, sin tocar `src/`.

## Losa maciza de hormigón armado (implementada)

`src/engine/src/structural/tipologias/losaMaciza.ts`

### Hipótesis de cálculo

- Franja de **1 m de ancho** de losa, simplemente apoyada, con armadura principal
  paralela al tránsito (luz = `luz_diseno`).
- Normativa: **AASHTO STANDARD 2002**, Sección 8 para hormigón armado (a la que remite el
  Manual PY Cap. 4.2.3.5) y Sección 3 / Cap. 4.2.3.2 del Manual para cargas. Nunca se
  mezclan ecuaciones de AASHTO STANDARD con AASHTO LRFD (`filosofia_normativa` en el YAML).
- Cargas: permanente (peso propio losa + capa de rodadura) + carga viva (camión HS-20 o
  carga de faja, el que dé el efecto más desfavorable) + impacto. Combinación **Group I
  (LFD)**: `Mu = γ·(β_D·D + β_L·(L+I))`.

### Magnitudes implementadas (todas parametrizadas en el YAML)

| Magnitud | Ecuación / origen | Parámetros (clave en `parametros_normativos`) |
|---|---|---|
| Carga permanente `w_DL` | `γ_HA·h + γ_rod·t_rod` | `cargas.peso_especifico_hormigon_kN_m3`, `peso_especifico_rodadura_kN_m3`, `espesor_rodadura_m` |
| Momento por peso propio `M_DL` | `w_DL·L²/8` (apoyo simple) | — |
| Momento por carga viva `M_LL` | camión HS-20 (ejes P1+P2+P3) o carga de faja; maximización numérica sobre la viga; se divide por `ancho_distribucion_carga_viva_m` | `cargas.camion.*`, `carga_faja_kN_m`, `ancho_distribucion_carga_viva_m` |
| Número de vías | `floor(ancho/3,5)` | `cargas.formula_numero_vias` |
| Factor de presencia múltiple | 1 vía: 1,00 · 2: 1,00 · 3: 0,90 · 4+: 0,75 | `cargas.factor_presencia_multiple` |
| Impacto `I` | `min(50/(L+125), 30%)`, L en pies (Art. 3.8 AASHTO) | `cargas.impacto.*` |
| `M_u` | `γ·(β_D·M_DL + β_L·M_LL·(1+I))` | `factores_lfd.*` |
| Bloque comprimido `a` | `As·fy / (0,85·f'c·b)` | `flexion.beta1`, `flexion.phi_flexion` |
| `φMn` | `φ·As·fy·(d − a/2)` (Art. 8.16) | `flexion.phi_flexion` |
| Cuantía mínima `ρ_min` (R2) | `0,0033` (Art. 8.17.1.2, 200·b·d/fy US) | `flexion.cuantia_minima` |
| Cuantía máxima `ρ_max` (R3) | `0,75·ρ_bal` (Art. 8.16.3.2.1) | `flexion.factor_cuantia_maxima`, `deformacion_ultima_concreto`, `acero.es_mpa` |
| Espesor mínimo de losa (R4) | `1,2·(S+10)/30` pulg., S en pulgadas (Art. 8.9.2) | `espesor_minimo_losa.formula` |
| Recubrimiento (R5) | normal 2,5 cm / agresiva 5,0 cm (Art. 8.22, Manual 4.2.3.5) | `recubrimientos_cm.*` |
| Separación máxima (R6) | `0,45 m` claro | `separacion.maximo_clear_m` |
| Armadura de repartición (R7) | `min(100/√S, 50)%` de la principal (Art. 3.24.10.1) | `armadura_reparticion.*` |
| Corte `φVc` (R10) | `2·√f'c·b·d` (psi, pulg) (Art. 8.16.6) | `corte.*` |
| Deflexión (R9) | viga simple, `E_c = 33·w^1,5·√f'c` (Art. 8.13.3); límite `L/800` | `deflexion.*` |

### Restricciones activas por defecto (perfil `basico`)

R1 flexión, R2 cuantía mínima, R3 cuantía máxima, R4 espesor mínimo, R5 recubrimiento,
R6 separación, R7 repartición, R9 deflexión. R8 (fisuración) y R11 (desarrollo) no se
modelan en v1 (si se activan, el motor las ignora explícitamente — no son valores
inventados, son criterios no modelados). R10 (corte) está implementado pero inactivo.

### Pendientes de verificación (Fase 4)

Mientras el Manual PY (Cap. 4.2.3.2 y 4.2.3.5) **confirma** las cargas, el camión HS-20,
el impacto, los recubrimientos, el acero Grado 60 (fy 420 MPa) y los pesos específicos,
varios valores de AASHTO STANDARD 2002 quedaron parametrizados con `[VERIFICAR]` y deben
contrastarse contra el texto de AASHTO antes de la Fase 4 de validación: distribución
empírica de carga viva en tableros de losa (`ancho_distribucion_carga_viva_m`, el de mayor
impacto en resultados), factores LFD Group I (`factores_lfd`), cuantías mínimas/máximas,
fórmula exacta de espesor mínimo (8.9.2), y límite de deflexión. Ver
`docs/normativa/manual-carreteras-py.md`.
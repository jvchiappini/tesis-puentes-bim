# Agentes del proyecto

Esta carpeta define los **roles** con los que vas a trabajar usando LLMs (Claude u otro) durante
la tesis. No es código que se ejecuta — es la "carpeta de personas" del proyecto: cada subcarpeta
tiene un `AGENT.md` que funciona como **prompt de sistema / ficha de rol** para pegarle a un LLM
al arrancar una sesión de trabajo enfocada en esa tarea.

La idea es simple: en vez de tener una sola conversación gigante donde le pedís de todo a un LLM
(que termina mezclando código con prosa académica con revisión), abrís una sesión distinta según
qué estás haciendo, con el rol correspondiente pegado como contexto. Esto da respuestas más
enfocadas y consistentes, y te obliga a vos también a separar mentalmente "ahora estoy
programando" de "ahora estoy escribiendo la tesis".

## Roles definidos

| Agente | Carpeta | Dueño de | Cuándo usarlo |
|---|---|---|---|
| **Programador** | `programador/` | `src/`, `tests/`, `data/` | Implementar/depurar el modelo estructural, NSGA-II, BIM/IFC, API, web. |
| **Investigador** | `investigador/` | `docs/tesis/bitacora-busquedas.md`, `docs/normativa/` | Buscar y sintetizar bibliografía, normativa, antecedentes. Alimenta al Redactor. |
| **Redactor de tesis** | `redactor-tesis/` | `docs/tesis/*.md` | Convertir resultados técnicos + hallazgos del Investigador en prosa académica. |
| **Revisor / QA** | `revisor-qa/` | ninguna carpeta propia — audita todo | Verificar consistencia código ↔ tesis, fórmulas, referencias, antes de cada hito de la Fase 6. |

## Cómo se relacionan (flujo típico)

```
Investigador  →  bitacora-busquedas.md  →  Redactor de tesis  →  docs/tesis/*.md
                                                    ↑
Programador   →  src/ + resultados en data/resultados/ ──┘

Revisor/QA  →  lee src/ + docs/tesis/ + verifica que coincidan  →  lista de inconsistencias
```

## ¿Hace falta un quinto agente ("orquestador")?

No, en este proyecto **vos sos el orquestador** — sos una sola persona coordinando 4 roles de
IA, no un equipo real, así que un agente adicional que solo delegue tareas sería overhead sin
beneficio. Si más adelante el proyecto crece (por ejemplo, sumás un compañero), ahí sí puede
valer la pena separar coordinación como rol propio.

## Convención de uso

1. Abrís una sesión nueva con el LLM.
2. Pegás el contenido de `agents/<rol>/AGENT.md` como primer mensaje o system prompt.
3. Le das contexto puntual (el archivo específico que estás tocando, no todo el repo).
4. Trabajás la tarea puntual de ese rol.
5. Si el LLM te sugiere algo que pertenece a otro rol (ej. el Programador te sugiere una frase
   para la introducción), anotalo y llevalo a una sesión con el rol correspondiente — no lo
   resuelvas ahí mismo, para no perder el enfoque.

# Despliegue del visualizador web en GitHub Pages

## Por qué GitHub Pages

Es gratuito, se integra directo con el repo, y como todo el cómputo corre en el
navegador del usuario (`src/engine/`, ver `docs/software/arquitectura.md`), no hace
falta ningún servidor — un sitio 100% estático alcanza.

## Requisitos

- `src/web/` debe compilar a archivos estáticos puros (HTML/JS/CSS) — un build de Vite
  estándar cumple esto.
- `web-ifc` corre en WASM en el navegador — su archivo `.wasm` debe quedar servido como
  asset estático junto con el resto del build (verificar en la documentación oficial de
  `web-ifc` la configuración exacta al implementar).
- `src/engine/` (el paquete `@tesis-puentes-bim/engine`) no hace ninguna llamada de red a
  un backend propio — no existe tal backend en este proyecto (ver ADR-002 en
  `docs/software/decisiones-arquitectura.md`).

## Flujo de build y publicación

1. GitHub Actions (`.github/workflows/deploy-pages.yml`) se dispara en cada push a `main`
   que modifique `src/web/` o `src/engine/`.
2. Corre primero el job de tests (`ci.yml`, reusado vía `workflow_call`) — incluye los
   tests unitarios del engine **y los benchmarks obligatorios de NSGA-II**
   (`src/engine/tests/benchmarks/`). Si algo falla, el deploy no continúa.
3. Compila `src/web/` con `npm run build` (Vite).
4. Publica `src/web/dist/` con `actions/deploy-pages`.

## Configuración pendiente (una sola vez, manual, en GitHub)

Settings → Pages → Source: "GitHub Actions" (no "branch").

## URL resultante

`https://<tu-usuario>.github.io/tesis-puentes-bim/`

## Nota sobre el `base` de Vite

GitHub Pages sirve el proyecto bajo un subpath (`/tesis-puentes-bim/`, no la raíz del
dominio) — hay que configurar `base: "/tesis-puentes-bim/"` en `vite.config.ts`, si no
los assets no cargan en producción aunque funcionen perfecto en local.

## Estado

🔵 Planificado — el workflow (`deploy-pages.yml`) ya está creado. Se activa recién cuando
`src/web/` y `src/engine/` tengan algo real para compilar y testear (Fase 3-5 del
`ROADMAP.md`).

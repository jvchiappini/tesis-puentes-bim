# Frontend / Visualizador paramétrico

Proyecto web (React + Three.js / web-ifc) donde el usuario ingresa parámetros del sitio
y visualiza en tiempo real la geometría optimizada y el modelo BIM — **todo el cómputo
corre en el navegador**, usando el paquete `@tesis-puentes-bim/engine` (`src/engine/`,
ver su README). No hay backend ni API — ver `docs/software/arquitectura.md` y
`docs/software/despliegue-web.md` (deploy en GitHub Pages).

Pendiente de inicializar (`npm create vite@latest . -- --template react-ts`), importando
`@tesis-puentes-bim/engine` como dependencia del workspace.

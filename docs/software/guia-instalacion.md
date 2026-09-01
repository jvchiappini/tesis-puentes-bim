# Guía de instalación y ejecución local

El proyecto es un monorepo npm (workspaces): `src/engine`, `src/web`, `tools/docx-builder`.

## Requisitos

- Node.js 20+
- npm 10+

## Instalación

```bash
git clone https://github.com/<tu-usuario>/tesis-puentes-bim.git
cd tesis-puentes-bim
npm install    # instala TODOS los workspaces de una vez
```

## Correr los tests del motor (incluye benchmarks de NSGA-II)

```bash
npm run test:engine
```

## Levantar el visualizador web en local

```bash
npm run dev --workspace=src/web
```

## Compilar el documento de tesis (.docx)

```bash
npm run build --workspace=tools/docx-builder
```

## Notas

- No hay entorno Python que instalar (venv, pip, requirements.txt) — el proyecto no
  depende de Python en ningún punto. Ver `docs/software/decisiones-arquitectura.md`
  (ADR-002) para el porqué.
- Las versiones de dependencias están fijadas (sin `^`) en cada `package.json` por
  reproducibilidad — no actualizar con `npm update` sin dejar constancia en
  `CHANGELOG.md`.

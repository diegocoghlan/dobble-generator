# Spot It (Dobble) Card Generator

Herramienta web para subir 57 imágenes, aplicar la secuencia Order 7 (Dobble) y generar un PDF imprimible de cartas circulares.

## Requisitos

- Node.js y npm (instalados localmente; no se usa `npm install -g`).

## Instalación y uso

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (p. ej. `http://localhost:5173`). Sube exactamente 57 imágenes (JPG, PNG, WEBP o SVG), revisa la vista previa y pulsa **Descargar PDF**.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — compilación para producción
- `npm run preview` — previsualizar build

## Proyecto autocontenido

Todas las dependencias están en `package.json`. Para eliminar el proyecto, borra la carpeta (y `node_modules` si existe).

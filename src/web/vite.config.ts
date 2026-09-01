import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativo: permite publicar en GitHub Pages bajo cualquier subruta
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5173,
  },
});
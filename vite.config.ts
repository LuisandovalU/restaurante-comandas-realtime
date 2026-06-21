// vite.config.ts — Configuración de Vite con plugin de TanStack Start
import { defineConfig } from "vite";
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tanstackStart({
      // Genera automáticamente el árbol de rutas desde src/routes/
      // y actualiza routeTree.gen.ts en cada cambio de archivo
    }),

    // Plugin de React para transformar JSX/TSX
    react(),
  ],
  resolve: {
    alias: {
      "~": "/src",
    },
    tsconfigPaths: true,
  },
  build: {
    // Genera sourcemaps en producción para depuración en Railway
    sourcemap: true,
    target: "esnext",
  },
});

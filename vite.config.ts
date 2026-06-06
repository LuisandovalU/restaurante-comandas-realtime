// vite.config.ts — Configuración de Vite con plugin de TanStack Router
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // Genera automáticamente el árbol de rutas desde src/routes/
    // y actualiza routeTree.gen.ts en cada cambio de archivo
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      routeFileIgnorePattern: ".(css|test|spec).(ts|tsx|js|jsx)$",
    }),

    // Plugin de React para transformar JSX/TSX
    react(),

    // Permite usar alias ~/ definidos en tsconfig.json
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
  resolve: {
    alias: {
      "~": "/src",
    },
  },
  build: {
    // Genera sourcemaps en producción para depuración en Railway
    sourcemap: true,
    target: "esnext",
  },
});

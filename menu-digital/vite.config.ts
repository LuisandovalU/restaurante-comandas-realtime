import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    // Genera routeTree.gen.ts automáticamente desde src/routes/
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
  ],
  // El micrositio es 100% cliente — Vite genera archivos estáticos
  // que Railway puede servir directamente sin servidor Node.js
  build: {
    outDir: "dist",
    // Base path vacío = raíz del dominio (rincon-del-parque-menu.railway.app)
    sourcemap: false,
  },
});

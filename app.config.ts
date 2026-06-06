// app.config.ts — Configuración de TanStack Start
// Documentación: https://tanstack.com/start/latest/docs/framework/react/hosting
import { defineConfig } from "@tanstack/start/config";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    // Preset para Railway (Node.js compatible)
    preset: "node-server",
  },
  vite: {
    plugins: [
      // Resuelve los paths alias definidos en tsconfig.json (~/)
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
  routers: {
    // El router SSR de TanStack Start
    ssr: {
      entry: "./src/main.tsx",
    },
  },
});

// src/routes/index.tsx — Página principal: redirige al tablero
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Por ahora redirige directamente al tablero
    // Cuando implementes auth, aquí verificas la sesión
    throw redirect({ to: "/tablero" });
  },
  component: () => null,
});

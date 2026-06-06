// src/routes/__root.tsx — Layout raíz de la aplicación principal
// Envuelve toda la app con ConvexProvider para acceso reactivo en tiempo real
import {
  createRootRoute,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(
  (import.meta as unknown as { env: Record<string, string> }).env[
    "VITE_CONVEX_URL"
  ] ?? "",
);

export const Route = createRootRoute({
  component: () => (
    <ConvexProvider client={convex}>
      <ScrollRestoration />
      <Outlet />
    </ConvexProvider>
  ),
});

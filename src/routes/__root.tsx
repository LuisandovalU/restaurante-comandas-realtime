import {
  createRootRoute,
  Outlet,
  ScrollRestoration,
  Scripts,
  HeadContent,
} from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import * as React from "react";
import "../index.css";

// Provide a safe fallback if VITE_CONVEX_URL is missing to avoid crashing SSR
const convexUrl = typeof process !== 'undefined' && process.env.VITE_CONVEX_URL
  ? process.env.VITE_CONVEX_URL
  : (import.meta as any).env?.VITE_CONVEX_URL || "https://happy-animal-123.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

export const Route = createRootRoute({
  component: () => (
    <RootDocument>
      <ConvexProvider client={convex}>
        <Outlet />
      </ConvexProvider>
    </RootDocument>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Restaurante Comandas</title>
        <HeadContent />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

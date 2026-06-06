// menu-digital/src/main.tsx — Entry point del micrositio
import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles/menu.css";

const CONVEX_URL = (import.meta.env["VITE_CONVEX_URL"] as string) ?? "";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register { router: typeof router; }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Elemento #root no encontrado en el DOM");

// Si no hay URL de Convex configurada, mostramos solo el shell UI
const App = () => <RouterProvider router={router} />;

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    {CONVEX_URL && CONVEX_URL !== "https://placeholder.convex.cloud" ? (
      <ConvexProvider client={new ConvexReactClient(CONVEX_URL)}>
        <App />
      </ConvexProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);

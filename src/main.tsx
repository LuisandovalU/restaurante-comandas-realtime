// src/main.tsx — Entry point para visualización con Vite
// Renderiza el TableroKanban directamente (sin router ni Convex)
// para demostración inmediata.
import React from "react";
import ReactDOM from "react-dom/client";
import { TableroKanban } from "./presentation/components/kanban/TableroKanban";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Elemento #root no encontrado");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <TableroKanban />
  </React.StrictMode>,
);

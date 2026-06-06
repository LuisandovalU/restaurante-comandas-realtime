// src/routes/tablero/index.tsx — Ruta del tablero Kanban
import { createFileRoute } from "@tanstack/react-router";
import { TableroKanban } from "~/presentation/components/kanban/TableroKanban";

export const Route = createFileRoute("/tablero/")({
  component: TableroKanban,
});

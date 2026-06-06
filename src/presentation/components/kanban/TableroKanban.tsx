// src/presentation/components/kanban/TableroKanban.tsx
// Tablero Kanban con DnD — datos demo integrados para visualización inmediata.
// Cuando Convex esté configurado, reemplaza PEDIDOS_DEMO con:
//   const pedidosRaw = useQuery(api.pedidos.listarPedidos);
import "../../styles/tablero.css";

import React, { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ColumnaKanban } from "./ColumnaKanban";
import { ContenidoTarjeta } from "./TarjetaComanda";

// ---------------------------------------------------------------------------
// TIPOS EXPORTADOS
// ---------------------------------------------------------------------------
export type EstadoPedido = "Pendiente" | "En Preparación" | "Listo";

export interface PedidoConItems {
  _id: string;
  platillo: string;
  estacion: "Postres" | "Calientes" | "Fríos";
  tiempo_preparacion: number;
  dificultad: 1 | 2 | 3 | 4 | 5;
  estado: string;
  numero_mesa: number;
  id_mesero: string;
  notas?: string;
  total: number;
  creado_en: number;
  actualizado_en: number;
}

// ---------------------------------------------------------------------------
// DATOS DE DEMOSTRACIÓN
// ---------------------------------------------------------------------------
const PEDIDOS_DEMO: PedidoConItems[] = [
  { _id: "d1", platillo: "Tacos de Canasta", estacion: "Calientes", tiempo_preparacion: 12, dificultad: 2, estado: "Pendiente",      numero_mesa: 3, id_mesero: "m1", total: 95,  notas: "Sin cebolla por favor", creado_en: Date.now() - 8 * 60000,  actualizado_en: Date.now() - 8 * 60000 },
  { _id: "d2", platillo: "Sopa de Lima",     estacion: "Calientes", tiempo_preparacion: 10, dificultad: 2, estado: "Pendiente",      numero_mesa: 7, id_mesero: "m2", total: 85,  notas: undefined,                  creado_en: Date.now() - 5 * 60000,  actualizado_en: Date.now() - 5 * 60000 },
  { _id: "d3", platillo: "Guacamole",        estacion: "Fríos",     tiempo_preparacion: 5,  dificultad: 1, estado: "Pendiente",      numero_mesa: 2, id_mesero: "m1", total: 75,  notas: "Extra totopos",            creado_en: Date.now() - 3 * 60000,  actualizado_en: Date.now() - 3 * 60000 },
  { _id: "d4", platillo: "Chiles Rellenos",  estacion: "Calientes", tiempo_preparacion: 25, dificultad: 4, estado: "En Preparación", numero_mesa: 1, id_mesero: "m3", total: 145, notas: undefined,                  creado_en: Date.now() - 20 * 60000, actualizado_en: Date.now() - 15 * 60000 },
  { _id: "d5", platillo: "Enchiladas Verdes",estacion: "Calientes", tiempo_preparacion: 18, dificultad: 3, estado: "En Preparación", numero_mesa: 5, id_mesero: "m2", total: 120, notas: "Sin chile",                creado_en: Date.now() - 18 * 60000, actualizado_en: Date.now() - 10 * 60000 },
  { _id: "d6", platillo: "Flan Napolitano",  estacion: "Postres",   tiempo_preparacion: 3,  dificultad: 2, estado: "Listo",          numero_mesa: 4, id_mesero: "m1", total: 65,  notas: undefined,                  creado_en: Date.now() - 30 * 60000, actualizado_en: Date.now() - 2 * 60000 },
  { _id: "d7", platillo: "Arroz con Leche",  estacion: "Postres",   tiempo_preparacion: 3,  dificultad: 1, estado: "Listo",          numero_mesa: 6, id_mesero: "m3", total: 55,  notas: undefined,                  creado_en: Date.now() - 25 * 60000, actualizado_en: Date.now() - 1 * 60000 },
];

// ---------------------------------------------------------------------------
// TRANSICIONES VÁLIDAS — Patrón State
// ---------------------------------------------------------------------------
const TRANSICIONES_VALIDAS: Record<EstadoPedido, EstadoPedido[]> = {
  "Pendiente":      ["En Preparación"],
  "En Preparación": ["Listo"],
  "Listo":          [],
};

const COLUMNAS: EstadoPedido[] = ["Pendiente", "En Preparación", "Listo"];

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------------------
export function TableroKanban() {
  // Estado local de pedidos (en producción viene de useQuery Convex)
  const [pedidos, setPedidos] = useState<PedidoConItems[]>(PEDIDOS_DEMO);
  const [pedidoActivo, setPedidoActivo] = useState<PedidoConItems | null>(null);

  // Agrupar por columna
  const porColumna = useMemo<Record<EstadoPedido, PedidoConItems[]>>(
    () => ({
      "Pendiente":      pedidos.filter((p) => p.estado === "Pendiente"),
      "En Preparación": pedidos.filter((p) => p.estado === "En Preparación"),
      "Listo":          pedidos.filter((p) => p.estado === "Listo"),
    }),
    [pedidos],
  );

  // Sensores DnD — mouse y touch (para tablets de cocina)
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const alIniciarArrastre = useCallback(({ active }: DragStartEvent) => {
    setPedidoActivo(active.data.current?.pedido as PedidoConItems ?? null);
  }, []);

  const alSoltarTarjeta = useCallback(({ active, over }: DragEndEvent) => {
    setPedidoActivo(null);
    if (!over) return;

    const id = String(active.id);
    const destino = String(over.id) as EstadoPedido;
    const actual = (active.data.current?.estadoActual ?? "") as EstadoPedido;

    if (actual === destino) return;

    const permitidos = TRANSICIONES_VALIDAS[actual] ?? [];
    if (!permitidos.includes(destino)) return;

    // Actualiza localmente (en producción: llama useMutation Convex → EDA push a todos)
    setPedidos((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, estado: destino, actualizado_en: Date.now() } : p,
      ),
    );
  }, []);

  return (
    <div className="tablero-kanban">
      {/* Encabezado */}
      <div className="tablero-header">
        <h1 className="tablero-titulo">🍽️ Tablero de Comandas</h1>
        <div className="tablero-meta">
          <div className="estrategia-badge">⚡ Prioridad por Tiempo (hora pico)</div>
          <div className="indicador-rt">
            <div className="indicador-rt-dot" />
            Demo — Conecta Convex para tiempo real
          </div>
        </div>
      </div>

      {/* DnD Kanban */}
      <DndContext
        sensors={sensores}
        collisionDetection={closestCenter}
        onDragStart={alIniciarArrastre}
        onDragEnd={alSoltarTarjeta}
      >
        <div className="tablero-columnas">
          {COLUMNAS.map((estado) => (
            <ColumnaKanban
              key={estado}
              estado={estado}
              pedidos={porColumna[estado]}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {pedidoActivo
            ? <ContenidoTarjeta pedido={pedidoActivo} esOverlay />
            : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

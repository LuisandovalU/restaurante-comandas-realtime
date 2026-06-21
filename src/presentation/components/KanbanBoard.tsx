import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { PedidoCard } from "./PedidoCard";
import { EstadoPedido, useKanban } from "../../application/useKanban";
import { Doc } from "../../../convex/_generated/dataModel";

export function KanbanBoard() {
  const { pedidos, cargando, moverPedido } = useKanban();
  const [activePedido, setActivePedido] = useState<Doc<"pedidos"> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (cargando) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "var(--text-secondary)" }}>
        Cargando comandas en tiempo real...
      </div>
    );
  }

  // Columnas estructuradas
  const columns: { id: EstadoPedido; title: string; color: string }[] = [
    { id: "Pendiente", title: "Pendiente", color: "var(--status-pendiente)" },
    { id: "En Preparación", title: "En Preparación", color: "var(--status-preparacion)" },
    { id: "Listo", title: "Listo para Entregar", color: "var(--status-listo)" },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "Pedido") {
      setActivePedido(active.data.current.pedido);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActivePedido(null);
    const { active, over } = event;
    if (!over) return;

    const pedidoId = active.id as string;
    const isOverAColumn = over.data.current?.type === "Column";
    const isOverAPedido = over.data.current?.type === "Pedido";
    
    let nuevoEstado: EstadoPedido | null = null;
    
    if (isOverAColumn) {
      nuevoEstado = over.id as EstadoPedido;
    } else if (isOverAPedido) {
      nuevoEstado = over.data.current?.pedido.estado as EstadoPedido;
    }

    const pedidoAnterior = pedidos.find(p => p._id === pedidoId);

    if (nuevoEstado && pedidoAnterior && pedidoAnterior.estado !== nuevoEstado) {
      // Optimistic update podría ir aquí, pero Convex es tan rápido que 
      // confiaremos en la sincronización reactiva para la clase.
      await moverPedido(pedidoId, nuevoEstado);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            statusColor={col.color}
            pedidos={pedidos.filter((p) => p.estado === col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activePedido ? <PedidoCard pedido={activePedido} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

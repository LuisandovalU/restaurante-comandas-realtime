import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Doc } from "../../../convex/_generated/dataModel";
import { PedidoCard } from "./PedidoCard";
import { EstadoPedido } from "../../application/useKanban";

interface KanbanColumnProps {
  id: EstadoPedido;
  title: string;
  pedidos: Doc<"pedidos">[];
  statusColor: string;
}

export function KanbanColumn({ id, title, pedidos, statusColor }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "Column",
      status: id,
    },
  });

  return (
    <div className="kanban-column glass-panel" style={{ 
      borderColor: isOver ? statusColor : 'var(--kanban-column-border)',
      boxShadow: isOver ? `0 0 20px ${statusColor}33` : 'var(--shadow-card)'
    }}>
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          <div className="status-dot" style={{ backgroundColor: statusColor, color: statusColor }}></div>
          <h2>{title}</h2>
        </div>
        <span className="badge-count">{pedidos.length}</span>
      </div>

      <div ref={setNodeRef} className="kanban-column-content">
        <SortableContext items={pedidos.map(p => p._id)} strategy={verticalListSortingStrategy}>
          {pedidos.map((pedido) => (
            <PedidoCard key={pedido._id} pedido={pedido} />
          ))}
          {pedidos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No hay pedidos aquí
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

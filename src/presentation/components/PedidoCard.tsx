import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Doc } from "../../../convex/_generated/dataModel";

interface PedidoCardProps {
  pedido: Doc<"pedidos">;
}

export function PedidoCard({ pedido }: PedidoCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: pedido._id,
      data: {
        type: "Pedido",
        pedido,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Renderizador de Dificultad (Patrón Strategy reflejado en la UI)
  const renderDificultad = (nivel: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className={`dificultad-dot ${i < nivel ? "active" : ""}`} />
    ));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`pedido-card ${isDragging ? "is-dragging" : ""} animate-slide-in`}
    >
      <div className="pedido-card-header">
        <span className="pedido-mesa">Mesa {pedido.numero_mesa}</span>
        <span className="pedido-tiempo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {pedido.tiempo_preparacion}m
        </span>
      </div>
      
      <h3 className="pedido-platillo">{pedido.platillo}</h3>
      
      {pedido.notas && <p className="pedido-notas">"{pedido.notas}"</p>}
      
      <div className="pedido-footer">
        <span className="badge-estacion">{pedido.estacion}</span>
        <div className="badge-dificultad" title={`Dificultad: ${pedido.dificultad}/5`}>
          {renderDificultad(pedido.dificultad)}
        </div>
      </div>
    </div>
  );
}

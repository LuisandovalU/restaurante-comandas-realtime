// src/presentation/components/kanban/ColumnaKanban.tsx
// =============================================================================
// Columna receptora del tablero Kanban.
// Usa `useDroppable` de @dnd-kit/core para detectar cuando una tarjeta
// es soltada sobre ella y comunicárselo al TableroKanban vía onDragEnd.
// =============================================================================
import { useDroppable } from "@dnd-kit/core";
import { TarjetaComanda } from "./TarjetaComanda";
import type { EstadoPedido, PedidoConItems } from "./TableroKanban";

// ---------------------------------------------------------------------------
// Configuración estática de cada columna
// ---------------------------------------------------------------------------
export const CONFIG_COLUMNAS: Record<
  EstadoPedido,
  { icono: string; label: string }
> = {
  "Pendiente":      { icono: "🕐", label: "Pendiente" },
  "En Preparación": { icono: "🔥", label: "En Preparación" },
  "Listo":          { icono: "✅", label: "Listo" },
};

// ---------------------------------------------------------------------------
// Componente ColumnaKanban
// ---------------------------------------------------------------------------
interface ColumnaKanbanProps {
  estado: EstadoPedido;
  pedidos: PedidoConItems[];
}

export function ColumnaKanban({ estado, pedidos }: ColumnaKanbanProps) {
  // useDroppable registra esta columna como zona de aterrizaje.
  // El id debe coincidir con el `over.id` que recibe onDragEnd.
  const { setNodeRef, isOver } = useDroppable({ id: estado });

  const config = CONFIG_COLUMNAS[estado];

  return (
    <div
      ref={setNodeRef}
      className={`columna-kanban${isOver ? " drop-activo" : ""}`}
      data-estado={estado}
    >
      {/* Encabezado de la columna */}
      <div className="columna-header">
        <div className="columna-titulo">
          <span className="columna-icono">{config.icono}</span>
          {config.label}
        </div>
        <div className="columna-contador">{pedidos.length}</div>
      </div>

      {/* Tarjetas o estado vacío */}
      {pedidos.length === 0 ? (
        <div className="columna-vacia">
          {isOver ? "Suelta aquí" : "Sin comandas"}
        </div>
      ) : (
        pedidos.map((pedido) => (
          <TarjetaComanda key={pedido._id} pedido={pedido} />
        ))
      )}
    </div>
  );
}

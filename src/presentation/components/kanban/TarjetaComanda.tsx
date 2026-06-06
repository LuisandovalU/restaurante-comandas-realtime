// src/presentation/components/kanban/TarjetaComanda.tsx
// =============================================================================
// Tarjeta arrastrable de una comanda individual.
// Usa `useDraggable` de @dnd-kit/core.
// Implementa el Patrón State visualmente: el color de acento cambia
// dependiendo del estado en que se encuentra la tarjeta.
// =============================================================================
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { PedidoConItems } from "./TableroKanban";

// ---------------------------------------------------------------------------
// Mapas de configuración visual — un único punto de cambio
// ---------------------------------------------------------------------------
const CONFIG_ESTADO = {
  "Pendiente":      { acento: "#7c3aed" },
  "En Preparación": { acento: "#f59e0b" },
  "Listo":          { acento: "#10b981" },
  "Pagado":         { acento: "#6b7280" },
} as const;

const LABEL_DIFICULTAD: Record<number, string> = {
  1: "Muy fácil",
  2: "Fácil",
  3: "Medio",
  4: "Difícil",
  5: "Complejo",
};

// ---------------------------------------------------------------------------
// Componente interno reutilizable — usado por TarjetaComanda Y DragOverlay
// ---------------------------------------------------------------------------
interface ContenidoTarjetaProps {
  pedido: PedidoConItems;
  esOverlay?: boolean;
}

export function ContenidoTarjeta({ pedido, esOverlay = false }: ContenidoTarjetaProps) {
  const config = CONFIG_ESTADO[pedido.estado as keyof typeof CONFIG_ESTADO] ?? {
    acento: "#6b7280",
  };

  const minutosEspera = Math.floor((Date.now() - pedido.creado_en) / 60000);

  return (
    <div
      className={esOverlay ? "tarjeta-overlay" : "tarjeta-comanda"}
      style={{ "--acento-color": config.acento } as React.CSSProperties}
    >
      {/* Línea de acento lateral (Patrón State — color semántico) */}
      <div className="tarjeta-acento" />

      {/* Fila superior: mesa + tiempo de espera */}
      <div className="tarjeta-fila-top">
        <span className="tarjeta-mesa">Mesa {pedido.numero_mesa}</span>
        <span className="tarjeta-tiempo">
          ⏱ {minutosEspera}m
        </span>
      </div>

      {/* Nombre del platillo */}
      <div className="tarjeta-platillo">{pedido.platillo}</div>

      {/* Badges de estación y dificultad (insumos para el priorizador) */}
      <div className="tarjeta-badges">
        <span className="badge-estacion" data-estacion={pedido.estacion}>
          {pedido.estacion === "Fríos" && "❄️"}
          {pedido.estacion === "Calientes" && "🔥"}
          {pedido.estacion === "Postres" && "🍮"}
          {" "}{pedido.estacion}
        </span>
        <span className="badge-dificultad" data-nivel={pedido.dificultad}>
          {"★".repeat(pedido.dificultad)}{" "}
          {LABEL_DIFICULTAD[pedido.dificultad]}
        </span>
        <span className="tarjeta-tiempo" style={{ marginLeft: "auto" }}>
          🕐 {pedido.tiempo_preparacion} min
        </span>
      </div>

      {/* Notas del mesero (si existen) */}
      {pedido.notas && (
        <div className="tarjeta-notas">📝 {pedido.notas}</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta Arrastrable — usa useDraggable de @dnd-kit/core
// ---------------------------------------------------------------------------
interface TarjetaComandaProps {
  pedido: PedidoConItems;
}

export function TarjetaComanda({ pedido }: TarjetaComandaProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: pedido._id,
      // Datos que viajan con el evento de arrastre — el TableroKanban
      // los lee en `onDragEnd` para saber el estado actual de la tarjeta
      data: {
        tipo: "comanda",
        estadoActual: pedido.estado,
        pedido,
      },
    });

  const estilo: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    // La tarjeta original se hace semi-transparente mientras se arrastra
    // El DragOverlay muestra la copia "flotante" con rotación
    opacity: isDragging ? 0.35 : 1,
    transition: isDragging ? "none" : "opacity 0.15s ease",
  };

  return (
    <div ref={setNodeRef} style={estilo} {...listeners} {...attributes}>
      <ContenidoTarjeta pedido={pedido} />
    </div>
  );
}

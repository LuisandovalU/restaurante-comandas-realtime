import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCallback } from "react";
import { Id } from "../../convex/_generated/dataModel";

export type EstadoPedido = "Pendiente" | "En Preparación" | "Listo" | "Pagado";

export function useKanban() {
  const pedidos = useQuery(api.pedidos_kanban.getPedidosActivos);
  const actualizarEstado = useMutation(api.pedidos_kanban.actualizarEstadoPedido);

  const moverPedido = useCallback(
    async (pedidoId: string, nuevoEstado: EstadoPedido) => {
      try {
        await actualizarEstado({
          pedidoId: pedidoId as Id<"pedidos">,
          nuevoEstado,
        });
      } catch (error) {
        console.error("Error al mover el pedido:", error);
        // Aquí podríamos disparar un toast o alerta
      }
    },
    [actualizarEstado]
  );

  return {
    pedidos: pedidos ?? [],
    cargando: pedidos === undefined,
    moverPedido,
  };
}

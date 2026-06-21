import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Obtiene todos los pedidos activos (que no están Pagados).
 * Usado por el tablero Kanban.
 */
export const getPedidosActivos = query({
  args: {},
  handler: async (ctx) => {
    const pedidos = await ctx.db
      .query("pedidos")
      .order("desc")
      .collect();

    // Filtramos los que NO deben salir en la cocina
    return pedidos.filter((p) => 
      p.estado === "Pendiente" || 
      p.estado === "En Preparación" || 
      p.estado === "Listo"
    );
  },
});

export const actualizarEstadoPedido = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    nuevoEstado: v.union(
      v.literal("Pendiente"),
      v.literal("En Preparación"),
      v.literal("Listo")
    ),
  },
  handler: async (ctx, { pedidoId, nuevoEstado }) => {
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) throw new Error("Pedido no encontrado");

    const transicionesPermitidas: Record<string, string[]> = {
      "Pendiente": ["En Preparación"],
      "En Preparación": ["Listo", "Pendiente"],
      "Listo": ["En Preparación"], // Solo puede regresar si hubo error. Para avanzar a Entregado es mediante el botón del mesero.
    };

    const permitidos = transicionesPermitidas[pedido.estado] || [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new Error(`Transición inválida de ${pedido.estado} a ${nuevoEstado}`);
    }

    await ctx.db.patch(pedidoId, {
      estado: nuevoEstado,
      actualizado_en: Date.now(),
    });

    return { exito: true };
  },
});

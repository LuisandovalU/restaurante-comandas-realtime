import { query } from "./_generated/server";

/**
 * Obtiene todos los pedidos que han sido marcados como "Pagado".
 * Estos son los pedidos que ya pasaron por todo el flujo de cocina y fueron cobrados.
 */
export const obtenerTicketsPagados = query({
  args: {},
  handler: async (ctx) => {
    // En producción se filtraría por fecha o turno, pero para la demo traemos todos
    const pedidos = await ctx.db
      .query("pedidos")
      .withIndex("by_estado", (q) => q.eq("estado", "Pagado"))
      .order("desc")
      .collect();

    return pedidos;
  },
});

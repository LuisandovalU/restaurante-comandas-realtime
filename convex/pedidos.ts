// convex/pedidos.ts — Queries y Mutations para el tablero Kanban
// Implementa RF-03 (Tablero), RF-04 (Drag & Drop), RF-05 (Sincronización)
// El Patrón State es aplicado en la mutation `actualizarEstado`
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// QUERIES (Lectura reactiva en tiempo real via WebSocket)
// ---------------------------------------------------------------------------

/**
 * Obtiene todos los pedidos agrupados implícitamente por estado.
 * Los clientes suscritos a esta query reciben actualizaciones en tiempo real
 * cuando cualquier pedido cambia de estado (EDA — Event-Driven Architecture).
 */
export const listarPedidos = query({
  args: {},
  handler: async (ctx) => {
    const identidad = await ctx.auth.getUserIdentity();
    if (!identidad) throw new Error("No autenticado");

    const pedidos = await ctx.db
      .query("pedidos")
      .order("desc")
      .collect();

    // Enriquecemos cada pedido con sus items para renderizar la tarjeta Kanban
    return Promise.all(
      pedidos.map(async (pedido) => {
        const items = await ctx.db
          .query("items_pedido")
          .withIndex("by_pedido", (q) => q.eq("pedidoId", pedido._id))
          .collect();

        // Hidratamos los items con el nombre del producto
        const itemsDetallados = await Promise.all(
          items.map(async (item) => {
            const producto = await ctx.db.get(item.productoId);
            return { ...item, nombre_producto: producto?.nombre ?? "Desconocido" };
          }),
        );

        return { ...pedido, items: itemsDetallados };
      }),
    );
  },
});

/**
 * Obtiene los pedidos filtrados por estado (útil para columnas individuales del Kanban).
 */
export const listarPedidosPorEstado = query({
  args: {
    estado: v.union(
      v.literal("pendiente"),
      v.literal("en_preparacion"),
      v.literal("listo"),
    ),
  },
  handler: async (ctx, { estado }) => {
    const identidad = await ctx.auth.getUserIdentity();
    if (!identidad) throw new Error("No autenticado");

    return ctx.db
      .query("pedidos")
      .withIndex("by_estado", (q) => q.eq("estado", estado))
      .order("asc")
      .collect();
  },
});

// ---------------------------------------------------------------------------
// MUTATIONS (Escritura con validación de transiciones de estado — Patrón State)
// ---------------------------------------------------------------------------

/**
 * Crea un nuevo pedido en estado "pendiente".
 * Corresponde a HU-02 (cocinero ve pedidos entrantes) y CU-03.
 */
export const crearPedido = mutation({
  args: {
    numero_mesa: v.number(),
    notas: v.optional(v.string()),
    items: v.array(
      v.object({
        productoId: v.id("productos"),
        cantidad: v.number(),
        observaciones: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { numero_mesa, notas, items }) => {
    const identidad = await ctx.auth.getUserIdentity();
    if (!identidad) throw new Error("No autenticado");

    const ahora = Date.now();

    // Creamos el pedido en estado inicial "pendiente"
    const pedidoId = await ctx.db.insert("pedidos", {
      numero_mesa,
      estado: "pendiente",
      meseroId: identidad.subject,
      notas,
      creado_en: ahora,
      actualizado_en: ahora,
    });

    // Insertamos los items con el precio histórico del momento
    await Promise.all(
      items.map(async ({ productoId, cantidad, observaciones }) => {
        const producto = await ctx.db.get(productoId);
        if (!producto) throw new Error(`Producto ${productoId} no encontrado`);

        return ctx.db.insert("items_pedido", {
          pedidoId,
          productoId,
          cantidad,
          precio_unitario: producto.precio,
          observaciones,
        });
      }),
    );

    return pedidoId;
  },
});

/**
 * Actualiza el estado de un pedido (Drag & Drop del Kanban).
 * Implementa el Patrón State: valida las transiciones permitidas (RN-01).
 *
 * Transiciones válidas:
 *   pendiente → en_preparacion  (HU-03: cocinero empieza a cocinar)
 *   en_preparacion → listo      (HU-04: mesero ve el plato listo)
 *
 * Transición inválida (bloqueada):
 *   listo → cualquier estado    (no se puede "deshacer" un plato listo)
 */
export const actualizarEstado = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    nuevoEstado: v.union(
      v.literal("pendiente"),
      v.literal("en_preparacion"),
      v.literal("listo"),
    ),
  },
  handler: async (ctx, { pedidoId, nuevoEstado }) => {
    const identidad = await ctx.auth.getUserIdentity();
    if (!identidad) throw new Error("No autenticado");

    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) throw new Error("Pedido no encontrado");

    // --- PATRÓN STATE: Validación de transiciones permitidas ---
    const transicionesPermitidas: Record<string, string[]> = {
      pendiente: ["en_preparacion"],
      en_preparacion: ["listo"],
      listo: [], // Estado terminal — no se puede mover
    };

    const estadosPermitidos = transicionesPermitidas[pedido.estado] ?? [];
    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new Error(
        `Transición inválida: ${pedido.estado} → ${nuevoEstado}. ` +
          `Solo se permite: ${estadosPermitidos.join(", ") || "ninguna (estado terminal)"}`,
      );
    }

    // Emite el evento de cambio de estado — todos los clientes suscritos
    // reciben la actualización en tiempo real (EDA)
    await ctx.db.patch(pedidoId, {
      estado: nuevoEstado,
      actualizado_en: Date.now(),
    });

    return { exito: true, estadoAnterior: pedido.estado, estadoNuevo: nuevoEstado };
  },
});

/**
 * Elimina un pedido completado del tablero (limpieza de cocina).
 */
export const archivarPedido = mutation({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, { pedidoId }) => {
    const identidad = await ctx.auth.getUserIdentity();
    if (!identidad) throw new Error("No autenticado");

    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) throw new Error("Pedido no encontrado");
    if (pedido.estado !== "listo") {
      throw new Error("Solo se pueden archivar pedidos en estado 'listo'");
    }

    // Eliminamos primero los items para mantener integridad referencial
    const items = await ctx.db
      .query("items_pedido")
      .withIndex("by_pedido", (q) => q.eq("pedidoId", pedidoId))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
    await ctx.db.delete(pedidoId);
  },
});

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

export const crearPedido = mutation({
  args: {
    platillo: v.string(),
    estacion: v.union(v.literal("Postres"), v.literal("Calientes"), v.literal("Fríos")),
    tiempo_preparacion: v.number(),
    dificultad: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5)),
    numero_mesa: v.number(),
    notas: v.optional(v.string()),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    // Para la demo actual, usamos un id ficticio o del auth si existe
    const identidad = await ctx.auth.getUserIdentity();
    const id_mesero = identidad ? identidad.subject : "mesero_anonimo";

    const ahora = Date.now();

    // Creamos el pedido en estado inicial "Pendiente"
    const pedidoId = await ctx.db.insert("pedidos", {
      platillo: args.platillo,
      estacion: args.estacion,
      tiempo_preparacion: args.tiempo_preparacion,
      dificultad: args.dificultad,
      estado: "Pendiente",
      numero_mesa: args.numero_mesa,
      id_mesero: id_mesero,
      notas: args.notas,
      total: args.total,
      creado_en: ahora,
      actualizado_en: ahora,
    });

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

// =====================================================================
// FLUJO DE SINERGIA: MESERO Y CAJA (FASE 5)
// =====================================================================

export const marcarEntregado = mutation({
  args: { pedidoId: v.id("pedidos") },
  handler: async (ctx, { pedidoId }) => {
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido || pedido.estado !== "Listo") throw new Error("Solo platillos Listos pueden ser Entregados");

    await ctx.db.patch(pedidoId, {
      estado: "Entregado",
      actualizado_en: Date.now(),
    });
  },
});

export const solicitarCuentaMesa = mutation({
  args: { 
    numero_mesa: v.number(),
    metodo_pago: v.union(v.literal("Efectivo"), v.literal("Tarjeta"), v.literal("Dividido"))
  },
  handler: async (ctx, { numero_mesa, metodo_pago }) => {
    // Buscar todos los pedidos entregados de la mesa
    const pedidosMesa = await ctx.db
      .query("pedidos")
      .withIndex("by_mesa", (q) => q.eq("numero_mesa", numero_mesa))
      .collect();
      
    const pedidosEntregados = pedidosMesa.filter(p => p.estado === "Entregado");

    if (pedidosEntregados.length === 0) {
      throw new Error("No hay pedidos entregados para esta mesa");
    }

    // Cambiar a En Proceso de Pago
    for (const pedido of pedidosEntregados) {
      await ctx.db.patch(pedido._id, {
        estado: "En Proceso de Pago",
        metodo_pago: metodo_pago,
        actualizado_en: Date.now(),
      });
    }
    
    return { exito: true };
  },
});

export const cobrarMesa = mutation({
  args: { numero_mesa: v.number() },
  handler: async (ctx, { numero_mesa }) => {
    const pedidosMesa = await ctx.db
      .query("pedidos")
      .withIndex("by_mesa", (q) => q.eq("numero_mesa", numero_mesa))
      .collect();
      
    const pedidosEnPago = pedidosMesa.filter(p => p.estado === "En Proceso de Pago");

    if (pedidosEnPago.length === 0) {
      throw new Error("No hay pedidos en proceso de pago para esta mesa");
    }

    // Cambiar a Pagado
    for (const pedido of pedidosEnPago) {
      await ctx.db.patch(pedido._id, {
        estado: "Pagado",
        actualizado_en: Date.now(),
      });
    }
    
    return { exito: true };
  },
});

export const getCuentaMesa = query({
  args: { numero_mesa: v.number() },
  handler: async (ctx, { numero_mesa }) => {
    const pedidosMesa = await ctx.db
      .query("pedidos")
      .withIndex("by_mesa", (q) => q.eq("numero_mesa", numero_mesa))
      .collect();

    // Mostrar todo lo que no esté Pagado (Pendiente, Preparación, Listo, Entregado, En Proceso de Pago)
    return pedidosMesa.filter(p => p.estado !== "Pagado");
  },
});

export const getMesasPorCobrar = query({
  args: {},
  handler: async (ctx) => {
    const pedidosEnPago = await ctx.db
      .query("pedidos")
      .withIndex("by_estado", (q) => q.eq("estado", "En Proceso de Pago"))
      .collect();

    // Agrupar por mesa
    const mesasMap = new Map<number, { mesa: number, total: number, metodo_pago: string, pedidos: any[] }>();

    for (const pedido of pedidosEnPago) {
      if (!mesasMap.has(pedido.numero_mesa)) {
        mesasMap.set(pedido.numero_mesa, {
          mesa: pedido.numero_mesa,
          total: 0,
          metodo_pago: pedido.metodo_pago ?? "Efectivo",
          pedidos: []
        });
      }
      
      const mesaInfo = mesasMap.get(pedido.numero_mesa)!;
      mesaInfo.total += pedido.total;
      mesaInfo.pedidos.push(pedido);
    }

    return Array.from(mesasMap.values());
  },
});

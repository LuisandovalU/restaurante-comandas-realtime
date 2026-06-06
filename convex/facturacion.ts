// convex/facturacion.ts — Plugin de Facturación (Microkernel)
// =============================================================================
// Responsabilidades:
//   1. Mutation `marcarComoPagado` → cambia estado en Convex y dispara el webhook
//   2. Action `enviarWebhookSQL`   → hace el HTTP POST al endpoint SQL (desacoplado)
//   3. Mutation `confirmarSync`    → recibe el ACK del SQL y registra el ticket_sql_id
//
// Flujo completo:
//   Mesero confirma pago
//     → marcarComoPagado (mutation)
//       → actualiza pedido.estado = "Pagado" en Convex
//       → ctx.scheduler.runAfter(0, enviarWebhookSQL, { pedidoId, ... })
//         → HTTP POST al endpoint SQL de TanStack Start
//           → INSERT en tabla tickets (SQL)
//           → HTTP POST de vuelta a Convex (confirmarSync)
//             → actualiza tickets_ref.sync_status = "synced"
// =============================================================================
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// MUTATION: marcarComoPagado
// Punto de entrada desde el frontend cuando el mesero cierra la cuenta.
// Aplica el Patrón State: solo "Listo" puede transitar a "Pagado".
// ---------------------------------------------------------------------------
export const marcarComoPagado = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    metodo_pago: v.union(
      v.literal("efectivo"),
      v.literal("tarjeta"),
      v.literal("transferencia"),
    ),
  },
  handler: async (ctx, { pedidoId, metodo_pago }) => {
    const identidad = await ctx.auth.getUserIdentity();
    if (!identidad) throw new Error("No autenticado");

    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) throw new Error("Pedido no encontrado");

    // --- PATRÓN STATE: Validación de transición ---
    if (pedido.estado !== "Listo") {
      throw new Error(
        `Solo se pueden pagar pedidos en estado "Listo". Estado actual: "${pedido.estado}"`,
      );
    }

    const ahora = Date.now();

    // 1. Actualizamos el estado en Convex (NoSQL — Plugin Cocina)
    await ctx.db.patch(pedidoId, {
      estado: "Pagado",
      actualizado_en: ahora,
    });

    // 2. Creamos la referencia del ticket con estado "pending"
    //    (pendiente de confirmación del SQL)
    await ctx.db.insert("tickets_ref", {
      pedidoId,
      ticket_sql_id: "",       // Se llenará cuando el SQL confirme
      total: pedido.total,
      id_mesero: pedido.id_mesero,
      fecha: ahora,
      sync_status: "pending",
    });

    // 3. Disparamos la Action asincrónica con delay 0 (no bloquea la mutation)
    //    Esto es el "disparo del evento" en la Arquitectura Dirigida por Eventos (EDA)
    await ctx.scheduler.runAfter(0, api.facturacion.enviarWebhookSQL, {
      pedidoId,
      numero_mesa: pedido.numero_mesa,
      total: pedido.total,
      id_mesero: pedido.id_mesero,
      metodo_pago,
      fecha: ahora,
    });

    return { exito: true, mensaje: "Pedido marcado como Pagado. Generando ticket..." };
  },
});

// ---------------------------------------------------------------------------
// ACTION: enviarWebhookSQL
// Corre fuera de la transacción de Convex, puede hacer llamadas HTTP.
// Envía los datos del pedido pagado al endpoint SQL del Plugin de Facturación.
// ---------------------------------------------------------------------------
export const enviarWebhookSQL = action({
  args: {
    pedidoId: v.id("pedidos"),
    numero_mesa: v.number(),
    total: v.number(),
    id_mesero: v.string(),
    metodo_pago: v.string(),
    fecha: v.number(),
  },
  handler: async (ctx, args) => {
    // URL del endpoint SQL — variable de entorno para no hardcodear
    const webhookUrl = process.env["SQL_WEBHOOK_URL"];
    if (!webhookUrl) {
      throw new Error("SQL_WEBHOOK_URL no configurada en variables de entorno de Convex");
    }

    const secreto = process.env["WEBHOOK_SECRET"];
    if (!secreto) {
      throw new Error("WEBHOOK_SECRET no configurada en variables de entorno de Convex");
    }

    const payload = {
      convex_pedido_id: args.pedidoId,
      numero_mesa: args.numero_mesa,
      subtotal: parseFloat((args.total / 1.16).toFixed(2)),   // Subtotal sin IVA
      iva: parseFloat((args.total - args.total / 1.16).toFixed(2)),
      total: args.total,
      id_mesero: args.id_mesero,
      metodo_pago: args.metodo_pago,
      fecha: new Date(args.fecha).toISOString(),
    };

    try {
      const respuesta = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Firma HMAC para verificar que la llamada viene de Convex
          "X-Webhook-Secret": secreto,
          "X-Source": "convex-facturacion",
        },
        body: JSON.stringify(payload),
      });

      if (!respuesta.ok) {
        const errorBody = await respuesta.text();
        throw new Error(`SQL endpoint respondió ${respuesta.status}: ${errorBody}`);
      }

      const { ticket_sql_id } = (await respuesta.json()) as { ticket_sql_id: string };

      // Confirmamos la sincronización exitosa en Convex
      await ctx.runMutation(api.facturacion.confirmarSync, {
        pedidoId: args.pedidoId,
        ticket_sql_id,
      });
    } catch (error) {
      // Marcamos el error para reintento manual o alertas
      await ctx.runMutation(api.facturacion.marcarErrorSync, {
        pedidoId: args.pedidoId,
        motivo: error instanceof Error ? error.message : String(error),
      });
      // Re-lanzamos el error para que Convex lo registre en los logs
      throw error;
    }
  },
});

// ---------------------------------------------------------------------------
// MUTATION: confirmarSync
// Recibe la confirmación del SQL y actualiza tickets_ref con el ID del ticket.
// ---------------------------------------------------------------------------
export const confirmarSync = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    ticket_sql_id: v.string(),
  },
  handler: async (ctx, { pedidoId, ticket_sql_id }) => {
    // Actualizamos la referencia del ticket en Convex
    const ref = await ctx.db
      .query("tickets_ref")
      .withIndex("by_pedido", (q) => q.eq("pedidoId", pedidoId))
      .first();

    if (ref) {
      await ctx.db.patch(ref._id, {
        ticket_sql_id,
        sync_status: "synced",
      });
    }

    // Guardamos el ticket_sql_id en el pedido para trazabilidad rápida
    await ctx.db.patch(pedidoId, { ticket_sql_id });

    return { exito: true, ticket_sql_id };
  },
});

// ---------------------------------------------------------------------------
// MUTATION: marcarErrorSync
// Registra el fallo del webhook para observabilidad y reintento.
// ---------------------------------------------------------------------------
export const marcarErrorSync = mutation({
  args: {
    pedidoId: v.id("pedidos"),
    motivo: v.string(),
  },
  handler: async (ctx, { pedidoId, motivo }) => {
    const ref = await ctx.db
      .query("tickets_ref")
      .withIndex("by_pedido", (q) => q.eq("pedidoId", pedidoId))
      .first();

    if (ref) {
      await ctx.db.patch(ref._id, { sync_status: "error" });
    }

    // Log del error — en producción se conectaría a Sentry o similar
    console.error(`[WebhookSQL] Error al sincronizar pedido ${pedidoId}: ${motivo}`);
  },
});

// ---------------------------------------------------------------------------
// QUERY: listarPedientesDeSincronizacion
// Para un panel de admin que permita reintentar webhooks fallidos.
// ---------------------------------------------------------------------------
export const listarPendientesDeSincronizacion = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("tickets_ref")
      .withIndex("by_sync_status", (q) => q.eq("sync_status", "error"))
      .collect();
  },
});

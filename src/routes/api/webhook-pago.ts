// src/routes/api/webhook-pago.ts — Endpoint receptor del webhook de Convex
// =============================================================================
// Este archivo es un Server Route de TanStack Start.
// Recibe el POST de Convex cuando un pedido cambia a "Pagado" y persiste
// el ticket en la base de datos SQL (Plugin Facturación — Microkernel).
//
// URL: POST /api/webhook-pago
// =============================================================================
import { createAPIFileRoute } from "@tanstack/start/api";

// ---------------------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------------------
interface PayloadWebhook {
  convex_pedido_id: string;
  numero_mesa: number;
  subtotal: number;
  iva: number;
  total: number;
  id_mesero: string;
  metodo_pago: "efectivo" | "tarjeta" | "transferencia";
  fecha: string;
}

// ---------------------------------------------------------------------------
// UTILIDAD: Verificación de firma HMAC
// Asegura que el webhook proviene genuinamente de Convex.
// ---------------------------------------------------------------------------
async function verificarFirmaWebhook(
  request: Request,
  secreto: string,
): Promise<boolean> {
  const firmaRecibida = request.headers.get("X-Webhook-Secret");
  if (!firmaRecibida) return false;

  // Comparación de tiempo constante para prevenir timing attacks
  const encoder = new TextEncoder();
  const firmaBytes = encoder.encode(firmaRecibida);
  const secretoBytes = encoder.encode(secreto);

  if (firmaBytes.length !== secretoBytes.length) return false;

  let diferencias = 0;
  for (let i = 0; i < firmaBytes.length; i++) {
    diferencias |= (firmaBytes[i] ?? 0) ^ (secretoBytes[i] ?? 0);
  }
  return diferencias === 0;
}

// ---------------------------------------------------------------------------
// UTILIDAD: Conexión a la base de datos SQL
// En producción, reemplazar con el cliente real de tu base de datos.
// Compatible con: node-postgres (pg), mysql2, better-sqlite3, Prisma, Drizzle.
// ---------------------------------------------------------------------------
async function insertarTicketSQL(payload: PayloadWebhook): Promise<string> {
  /**
   * IMPLEMENTACIÓN DE REFERENCIA — reemplazar con tu cliente SQL real.
   *
   * Ejemplo con node-postgres:
   * ─────────────────────────────────────────────────────────────────────────
   * import { Pool } from "pg";
   * const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   *
   * const { rows } = await pool.query(
   *   `INSERT INTO tickets
   *      (convex_pedido_id, numero_mesa, subtotal, iva, total, id_mesero, metodo_pago, fecha)
   *    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   *    RETURNING id`,
   *   [payload.convex_pedido_id, payload.numero_mesa, payload.subtotal,
   *    payload.iva, payload.total, payload.id_mesero, payload.metodo_pago, payload.fecha]
   * );
   * return String(rows[0].id);
   * ─────────────────────────────────────────────────────────────────────────
   *
   * Ejemplo con Drizzle ORM + PostgreSQL:
   * ─────────────────────────────────────────────────────────────────────────
   * import { db } from "~/infrastructure/sql/db";
   * import { tickets } from "~/infrastructure/sql/schema";
   *
   * const [nuevoTicket] = await db
   *   .insert(tickets)
   *   .values({ ...payload, fecha: new Date(payload.fecha) })
   *   .returning({ id: tickets.id });
   * return String(nuevoTicket.id);
   * ─────────────────────────────────────────────────────────────────────────
   */

  // STUB para development — simula la inserción SQL
  console.log("[WebhookSQL] Insertando ticket en SQL:", payload);
  const idSimulado = `TICKET-${Date.now()}-MESA${payload.numero_mesa}`;
  return idSimulado;
}

// ---------------------------------------------------------------------------
// HANDLER DEL ROUTE — POST /api/webhook-pago
// ---------------------------------------------------------------------------
export const Route = createAPIFileRoute("/api/webhook-pago")({
  POST: async ({ request }) => {
    // 1. Verificar que la fuente es Convex (seguridad)
    const secreto = process.env["WEBHOOK_SECRET"];
    if (!secreto) {
      return new Response(
        JSON.stringify({ error: "Configuración interna incompleta" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const firmaValida = await verificarFirmaWebhook(request, secreto);
    if (!firmaValida) {
      return new Response(
        JSON.stringify({ error: "Firma de webhook inválida" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    // 2. Parsear y validar el payload
    let payload: PayloadWebhook;
    try {
      payload = (await request.json()) as PayloadWebhook;
    } catch {
      return new Response(
        JSON.stringify({ error: "Payload JSON inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Validación mínima de campos requeridos
    if (!payload.convex_pedido_id || !payload.id_mesero || payload.total == null) {
      return new Response(
        JSON.stringify({ error: "Faltan campos requeridos en el payload" }),
        { status: 422, headers: { "Content-Type": "application/json" } },
      );
    }

    // 3. Persistir en la base de datos SQL (Plugin Facturación)
    try {
      const ticket_sql_id = await insertarTicketSQL(payload);

      // 4. Responder a Convex con el ID del ticket generado
      //    Convex usará este ID para confirmarSync() y actualizar tickets_ref
      return new Response(
        JSON.stringify({
          exito: true,
          ticket_sql_id,
          mensaje: `Ticket ${ticket_sql_id} generado correctamente`,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("[WebhookSQL] Error al insertar en SQL:", error);

      // Devolvemos 500 para que Convex registre el error y active marcarErrorSync()
      return new Response(
        JSON.stringify({
          error: "Error al persistir el ticket en la base de datos SQL",
          detalle: error instanceof Error ? error.message : String(error),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});

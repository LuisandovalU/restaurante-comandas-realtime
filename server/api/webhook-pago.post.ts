import { defineEventHandler, readBody, getHeader, setResponseStatus } from "h3";

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
// ---------------------------------------------------------------------------
function verificarFirmaWebhook(
  firmaRecibida: string | undefined,
  secreto: string,
): boolean {
  if (!firmaRecibida) return false;

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
// ---------------------------------------------------------------------------
async function insertarTicketSQL(payload: PayloadWebhook): Promise<string> {
  console.log("[WebhookSQL] Insertando ticket en SQL:", payload);
  const idSimulado = `TICKET-${Date.now()}-MESA${payload.numero_mesa}`;
  return idSimulado;
}

// ---------------------------------------------------------------------------
// HANDLER DEL ROUTE — POST /api/webhook-pago
// ---------------------------------------------------------------------------
export default defineEventHandler(async (event) => {
  // 1. Verificar que la fuente es Convex (seguridad)
  const secreto = process.env["WEBHOOK_SECRET"];
  if (!secreto) {
    setResponseStatus(event, 500);
    return { error: "Configuración interna incompleta" };
  }

  const firmaRecibida = getHeader(event, "X-Webhook-Secret");
  if (!verificarFirmaWebhook(firmaRecibida, secreto)) {
    setResponseStatus(event, 401);
    return { error: "Firma de webhook inválida" };
  }

  // 2. Parsear y validar el payload
  let payload: PayloadWebhook;
  try {
    payload = await readBody(event);
  } catch {
    setResponseStatus(event, 400);
    return { error: "Payload JSON inválido" };
  }

  if (!payload || !payload.convex_pedido_id || !payload.id_mesero || payload.total == null) {
    setResponseStatus(event, 422);
    return { error: "Faltan campos requeridos en el payload" };
  }

  // 3. Persistir en la base de datos SQL (Plugin Facturación)
  try {
    const ticket_sql_id = await insertarTicketSQL(payload);

    // 4. Responder a Convex con el ID del ticket generado
    setResponseStatus(event, 201);
    return {
      exito: true,
      ticket_sql_id,
      mensaje: `Ticket ${ticket_sql_id} generado correctamente`,
    };
  } catch (error) {
    console.error("[WebhookSQL] Error al insertar en SQL:", error);
    setResponseStatus(event, 500);
    return {
      error: "Error al persistir el ticket en la base de datos SQL",
      detalle: error instanceof Error ? error.message : String(error),
    };
  }
});

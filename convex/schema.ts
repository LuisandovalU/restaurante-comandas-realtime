// convex/schema.ts — Esquema de base de datos Convex
// Arquitectura Microkernel:
//   Plugin Cocina  → tabla `pedidos`  (NoSQL, tiempo real, Kanban)
//   Plugin Factura → tabla `tickets`  (referencia al registro SQL externo)
// =============================================================================
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================
  // PLUGIN COCINA — NoSQL Operativo
  // ============================================================

  /**
   * TABLA: pedidos
   * Entidad central del tablero Kanban.
   * Implementa el Patrón State: los estados se transitan de forma unidireccional.
   * Patrón Strategy: tiempo_preparacion y dificultad son consumidos por el priorizador.
   */
  pedidos: defineTable({
    /** Nombre del platillo solicitado */
    platillo: v.string(),

    /** Estación de cocina donde se prepara el platillo */
    estacion: v.union(
      v.literal("Postres"),
      v.literal("Calientes"),
      v.literal("Fríos"),
    ),

    /** Tiempo estimado de preparación en minutos */
    tiempo_preparacion: v.number(),

    /**
     * Nivel de dificultad técnica del platillo.
     * Escala: 1 (muy sencillo) → 5 (alta complejidad).
     * Consumido por EstrategiaOrdenarPorDificultad en el Core.
     */
    dificultad: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),

    /**
     * Estado del pedido en el tablero Kanban — Patrón State (RN-01).
     * Transiciones válidas:
     *   Pendiente → En Preparación → Listo → Pagado
     * "Pagado" es el disparador del webhook hacia la tabla SQL de tickets.
     */
    estado: v.union(
      v.literal("Pendiente"),
      v.literal("En Preparación"),
      v.literal("Listo"),
      v.literal("Entregado"),
      v.literal("En Proceso de Pago"),
      v.literal("Pagado"),   // Estado que activa el webhook de facturación
    ),

    /** Método de pago seleccionado al solicitar la cuenta */
    metodo_pago: v.optional(
      v.union(
        v.literal("Efectivo"),
        v.literal("Tarjeta"),
        v.literal("Dividido")
      )
    ),

    /** Mesa a la que pertenece el pedido */
    numero_mesa: v.number(),

    /** ID del mesero que tomó la orden */
    id_mesero: v.string(),

    /** Notas adicionales para cocina */
    notas: v.optional(v.string()),

    /** Precio total del pedido (calculado al crear) */
    total: v.number(),

    /** Timestamp de creación (ms desde epoch) */
    creado_en: v.number(),

    /** Timestamp del último cambio de estado */
    actualizado_en: v.number(),

    /**
     * ID del ticket SQL generado al marcar como Pagado.
     * Se almacena aquí para trazabilidad cruzada NoSQL ↔ SQL.
     */
    ticket_sql_id: v.optional(v.string()),
  })
    .index("by_estado", ["estado"])
    .index("by_mesa", ["numero_mesa"])
    .index("by_mesero", ["id_mesero"]),

  // ============================================================
  // PLUGIN FACTURACIÓN — Referencia al registro SQL externo
  // Almacena el eco del ticket para consultas rápidas desde Convex
  // sin tener que consultar la base SQL en cada render.
  // ============================================================

  /**
   * TABLA: tickets_ref
   * Referencia ligera al ticket SQL generado al finalizar el pago.
   * La fuente de verdad financiera vive en la tabla SQL `tickets`.
   */
  tickets_ref: defineTable({
    /** ID del pedido Convex al que corresponde este ticket */
    pedidoId: v.id("pedidos"),

    /** ID del registro en la base de datos SQL (folio) */
    ticket_sql_id: v.string(),

    /** Monto total cobrado (espejo del SQL) */
    total: v.number(),

    /** ID del mesero responsable */
    id_mesero: v.string(),

    /** Timestamp de generación del ticket */
    fecha: v.number(),

    /** Estado del webhook: pending | synced | error */
    sync_status: v.union(
      v.literal("pending"),
      v.literal("synced"),
      v.literal("error"),
    ),
  })
    .index("by_pedido", ["pedidoId"])
    .index("by_mesero", ["id_mesero"])
    .index("by_sync_status", ["sync_status"]),

  // ============================================================
  // CATÁLOGO (compartido entre ambos plugins)
  // ============================================================

  categorias: defineTable({
    nombre: v.string(),
    descripcion: v.optional(v.string()),
    orden: v.number(),
    activa: v.boolean(),
  }).index("by_nombre", ["nombre"]),

  productos: defineTable({
    nombre: v.string(),
    descripcion: v.optional(v.string()),
    precio: v.number(),
    tiempo_preparacion: v.number(),
    dificultad: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    estacion: v.union(
      v.literal("Postres"),
      v.literal("Calientes"),
      v.literal("Fríos"),
    ),
    categoriaId: v.id("categorias"),
    disponible: v.boolean(),
    imagen_url: v.optional(v.string()),
  })
    .index("by_categoria", ["categoriaId"])
    .index("by_disponible", ["disponible"]),
});

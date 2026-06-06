// src/infrastructure/convex/api.ts
// Re-exporta el API generado de Convex para que los componentes
// puedan importar desde el alias ~/ en lugar de rutas relativas.
// Convex genera este archivo automáticamente al correr `bunx convex dev`.
//
// IMPORTANTE: Este archivo existe como stub en desarrollo.
// Los tipos reales son generados por Convex CLI en convex/_generated/api.ts

// En desarrollo sin Convex inicializado, exportamos un proxy de strings
// que Convex acepta como referencia a funciones.
export const api = {
  pedidos: {
    listarPedidos: "pedidos:listarPedidos" as never,
    listarPedidosPorEstado: "pedidos:listarPedidosPorEstado" as never,
    crearPedido: "pedidos:crearPedido" as never,
    actualizarEstado: "pedidos:actualizarEstado" as never,
    archivarPedido: "pedidos:archivarPedido" as never,
  },
  productos: {
    listarProductos: "productos:listarProductos" as never,
    listarCategorias: "productos:listarCategorias" as never,
    crearProducto: "productos:crearProducto" as never,
    actualizarProducto: "productos:actualizarProducto" as never,
    eliminarProducto: "productos:eliminarProducto" as never,
  },
  facturacion: {
    marcarComoPagado: "facturacion:marcarComoPagado" as never,
    enviarWebhookSQL: "facturacion:enviarWebhookSQL" as never,
    confirmarSync: "facturacion:confirmarSync" as never,
    marcarErrorSync: "facturacion:marcarErrorSync" as never,
    listarPendientesDeSincronizacion:
      "facturacion:listarPendientesDeSincronizacion" as never,
  },
  menuPublico: {
    listarCategorias: "menuPublico:listarCategorias" as never,
    listarMenu: "menuPublico:listarMenu" as never,
    obtenerProducto: "menuPublico:obtenerProducto" as never,
  },
} as const;

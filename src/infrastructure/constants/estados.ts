// src/infrastructure/constants/estados.ts
// Constantes de dominio para los estados del tablero Kanban
// Consumidas por el Patrón State y los componentes de presentación

export const ESTADO_PEDIDO = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En Preparación",
  LISTO: "Listo",
  PAGADO: "Pagado",
} as const;

export type EstadoPedidoType =
  (typeof ESTADO_PEDIDO)[keyof typeof ESTADO_PEDIDO];

export const ESTADOS_KANBAN = [
  ESTADO_PEDIDO.PENDIENTE,
  ESTADO_PEDIDO.EN_PREPARACION,
  ESTADO_PEDIDO.LISTO,
] as const;

export const TRANSICIONES: Record<string, string> = {
  [ESTADO_PEDIDO.PENDIENTE]: ESTADO_PEDIDO.EN_PREPARACION,
  [ESTADO_PEDIDO.EN_PREPARACION]: ESTADO_PEDIDO.LISTO,
  [ESTADO_PEDIDO.LISTO]: ESTADO_PEDIDO.PAGADO,
};

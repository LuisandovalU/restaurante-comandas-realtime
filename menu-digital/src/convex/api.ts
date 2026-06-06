// menu-digital/src/convex/api.ts
// Proxy tipado que apunta a las funciones PÚBLICAS de Convex.
// Solo expone los módulos a los que el micrositio tiene acceso:
// exclusivamente `menuPublico` (solo lectura, sin autenticación).
//
// NOTA: Este archivo NO importa de "_generated/api" del proyecto principal.
// El micrositio es un cliente Convex independiente que referencia
// las funciones por su path string — Convex resuelve los tipos en runtime.
export const api = {
  menuPublico: {
    listarCategorias: "menuPublico:listarCategorias" as never,
    listarMenu: "menuPublico:listarMenu" as never,
    obtenerProducto: "menuPublico:obtenerProducto" as never,
  },
} as const;

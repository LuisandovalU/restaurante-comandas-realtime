// convex/menuPublico.ts — Query pública SIN autenticación
// =============================================================================
// Este archivo es el contrato de lectura que expone el Microkernel
// al Plugin "Menú Digital" (micrositio).
//
// SEGURIDAD: Las funciones aquí NO llaman a ctx.auth.getUserIdentity().
// Convex sirve estas queries a cualquier cliente anónimo (público).
// Son estrictamente de SOLO LECTURA — no hay mutations públicas.
//
// El micrositio se conecta a la misma Convex deployment con un
// CONVEX_URL de solo lectura (sin privilegios de escritura en el dashboard).
// =============================================================================
import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Lista todas las categorías activas del menú.
 * Pública — sin autenticación requerida.
 */
export const listarCategorias = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("categorias")
      .filter((q) => q.eq(q.field("activa"), true))
      .order("asc")
      .collect();
  },
});

/**
 * Lista todos los productos disponibles, opcionalmente filtrados por categoría.
 * Pública — sin autenticación requerida.
 */
export const listarMenu = query({
  args: {
    categoriaId: v.optional(v.id("categorias")),
  },
  handler: async (ctx, { categoriaId }) => {
    const productos = categoriaId
      ? await ctx.db
          .query("productos")
          .withIndex("by_categoria", (q) => q.eq("categoriaId", categoriaId))
          .collect()
      : await ctx.db.query("productos").collect();

    // Solo devolvemos los disponibles al público
    return productos.filter((p) => p.disponible);
  },
});

/**
 * Obtiene el detalle de un producto específico.
 * Pública — sin autenticación requerida.
 */
export const obtenerProducto = query({
  args: { productoId: v.id("productos") },
  handler: async (ctx, { productoId }) => {
    const producto = await ctx.db.get(productoId);
    if (!producto || !producto.disponible) return null;

    const categoria = await ctx.db.get(producto.categoriaId);
    return { ...producto, categoria };
  },
});

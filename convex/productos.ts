// convex/productos.ts — CRUD de productos del menú
// Implementa RF-02 (Gestión de Menú), HU-01 y CU-02
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// QUERIES
// ---------------------------------------------------------------------------

/**
 * Lista todos los productos disponibles con su categoría.
 * Usada tanto en el micrositio (menú público) como en el admin.
 */
export const listarProductos = query({
  args: {
    soloDisponibles: v.optional(v.boolean()),
    categoriaId: v.optional(v.id("categorias")),
  },
  handler: async (ctx, { soloDisponibles = false, categoriaId }) => {
    let queryBuilder = ctx.db.query("productos");

    if (categoriaId) {
      return queryBuilder
        .withIndex("by_categoria", (q) => q.eq("categoriaId", categoriaId))
        .collect();
    }

    const productos = await queryBuilder.collect();

    return soloDisponibles
      ? productos.filter((p) => p.disponible)
      : productos;
  },
});

/**
 * Obtiene un producto por su ID.
 */
export const obtenerProducto = query({
  args: { productoId: v.id("productos") },
  handler: async (ctx, { productoId }) => {
    return ctx.db.get(productoId);
  },
});

/**
 * Lista todas las categorías activas (para el selector del formulario).
 */
export const listarCategorias = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("categorias").order("asc").collect();
  },
});

// ---------------------------------------------------------------------------
// MUTATIONS — Solo accesibles por el Administrador
// ---------------------------------------------------------------------------

/**
 * Registra un nuevo plato en el menú (HU-01, CU-02).
 * El administrador provee: nombre, descripción, precio y tiempo de preparación.
 */
export const crearProducto = mutation({
  args: {
    nombre: v.string(),
    descripcion: v.optional(v.string()),
    precio: v.number(),
    tiempo_preparacion: v.number(),
    nivel_dificultad: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
    ),
    estacion: v.union(
      v.literal("frios"),
      v.literal("calientes"),
      v.literal("postres"),
      v.literal("bebidas"),
    ),
    categoriaId: v.id("categorias"),
    imagen_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identidad = await ctx.auth.getUserIdentity();
    if (!identidad) throw new Error("No autenticado");

    return ctx.db.insert("productos", {
      ...args,
      disponible: true,
    });
  },
});

/**
 * Actualiza los datos de un plato existente.
 */
export const actualizarProducto = mutation({
  args: {
    productoId: v.id("productos"),
    nombre: v.optional(v.string()),
    descripcion: v.optional(v.string()),
    precio: v.optional(v.number()),
    tiempo_preparacion: v.optional(v.number()),
    nivel_dificultad: v.optional(
      v.union(
        v.literal(1),
        v.literal(2),
        v.literal(3),
        v.literal(4),
        v.literal(5),
      ),
    ),
    disponible: v.optional(v.boolean()),
    imagen_url: v.optional(v.string()),
  },
  handler: async (ctx, { productoId, ...campos }) => {
    const identidad = await ctx.auth.getUserIdentity();
    if (!identidad) throw new Error("No autenticado");

    const producto = await ctx.db.get(productoId);
    if (!producto) throw new Error("Producto no encontrado");

    // Filtramos undefined para no sobreescribir campos no enviados
    const actualizaciones = Object.fromEntries(
      Object.entries(campos).filter(([, v]) => v !== undefined),
    );

    await ctx.db.patch(productoId, actualizaciones);
  },
});

/**
 * Elimina un producto del menú (solo si no tiene pedidos activos).
 */
export const eliminarProducto = mutation({
  args: { productoId: v.id("productos") },
  handler: async (ctx, { productoId }) => {
    const identidad = await ctx.auth.getUserIdentity();
    if (!identidad) throw new Error("No autenticado");

    await ctx.db.delete(productoId);
  },
});

/**
 * Crea una nueva categoría del menú.
 */
export const crearCategoria = mutation({
  args: {
    nombre: v.string(),
    descripcion: v.optional(v.string()),
    orden: v.number(),
  },
  handler: async (ctx, args) => {
    const identidad = await ctx.auth.getUserIdentity();
    if (!identidad) throw new Error("No autenticado");

    return ctx.db.insert("categorias", { ...args, activa: true });
  },
});

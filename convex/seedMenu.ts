import { mutation } from "./_generated/server";

export const injectMenuData = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Limpiar datos existentes
    const categoriasExistentes = await ctx.db.query("categorias").collect();
    for (const cat of categoriasExistentes) await ctx.db.delete(cat._id);
    
    const productosExistentes = await ctx.db.query("productos").collect();
    for (const prod of productosExistentes) await ctx.db.delete(prod._id);

    // 2. Insertar Categorías Reales
    const catDesayunos = await ctx.db.insert("categorias", { nombre: "Desayunos", descripcion: "Servidos hasta las 13:00 hrs", orden: 1, activa: true });
    const catEntradasSopas = await ctx.db.insert("categorias", { nombre: "Entradas y Sopas", descripcion: "Para comenzar", orden: 2, activa: true });
    const catPlatosFuertes = await ctx.db.insert("categorias", { nombre: "Platos Fuertes", descripcion: "Carnes, Aves y Tradición del Rincón", orden: 3, activa: true });
    const catVeganoEnsaladas = await ctx.db.insert("categorias", { nombre: "Vegano y Ensaladas", descripcion: "Opciones ligeras y saludables", orden: 4, activa: true });
    const catEmparedados = await ctx.db.insert("categorias", { nombre: "Emparedados", descripcion: "Sándwiches y hamburguesas", orden: 5, activa: true });
    const catBebidas = await ctx.db.insert("categorias", { nombre: "Bebidas", descripcion: "Café, jugos, cervezas y vinos", orden: 6, activa: true });
    const catPostres = await ctx.db.insert("categorias", { nombre: "Panadería y Postres", descripcion: "Servido todo el día", orden: 7, activa: true });

    // 3. Insertar Productos Reales
    const menuMock = [
      // DESAYUNOS
      { nombre: "Chilaquiles verdes o rojos c/ pollo o huevo", descripcion: "Tradicionales chilaquiles", precio: 128.00, tiempo_preparacion: 10, dificultad: 2 as const, estacion: "Calientes" as const, categoriaId: catDesayunos, disponible: true },
      { nombre: "Hot Cakes con huevo, jamón o tocino", descripcion: "Con nuez 3 PZA", precio: 120.00, tiempo_preparacion: 12, dificultad: 2 as const, estacion: "Calientes" as const, categoriaId: catDesayunos, disponible: true },
      { nombre: "Huevos Motuleños", descripcion: "Sobre sincronizada", precio: 124.00, tiempo_preparacion: 10, dificultad: 2 as const, estacion: "Calientes" as const, categoriaId: catDesayunos, disponible: true },
      
      // ENTRADAS Y SOPAS
      { nombre: "Queso fundido (200gr)", descripcion: "Queso derretido perfecto para compartir", precio: 54.00, tiempo_preparacion: 8, dificultad: 1 as const, estacion: "Calientes" as const, categoriaId: catEntradasSopas, disponible: true },
      { nombre: "Guacamole (200gr)", descripcion: "Acompañado de totopos", precio: 54.00, tiempo_preparacion: 5, dificultad: 1 as const, estacion: "Fríos" as const, categoriaId: catEntradasSopas, disponible: true },
      { nombre: "Caldo Tlalpeño de la casa (400ml)", descripcion: "Receta tradicional", precio: 72.00, tiempo_preparacion: 8, dificultad: 2 as const, estacion: "Calientes" as const, categoriaId: catEntradasSopas, disponible: true },
      { nombre: "Sopa de tortilla (250ml)", descripcion: "Con aguacate, crema y queso", precio: 45.00, tiempo_preparacion: 5, dificultad: 1 as const, estacion: "Calientes" as const, categoriaId: catEntradasSopas, disponible: true },

      // PLATOS FUERTES (Carnes, Aves, Tradición)
      { nombre: "Rib eye (400gr)", descripcion: "Corte premium a la parrilla", precio: 220.00, tiempo_preparacion: 20, dificultad: 3 as const, estacion: "Calientes" as const, categoriaId: catPlatosFuertes, disponible: true },
      { nombre: "Filete Mignón (200gr)", descripcion: "Suave medallón de res", precio: 149.00, tiempo_preparacion: 18, dificultad: 3 as const, estacion: "Calientes" as const, categoriaId: catPlatosFuertes, disponible: true },
      { nombre: "Salmón a la plancha (180gr)", descripcion: "Pescados & Mariscos", precio: 180.00, tiempo_preparacion: 15, dificultad: 2 as const, estacion: "Calientes" as const, categoriaId: catPlatosFuertes, disponible: true },
      { nombre: "Cochinita pibil (180gr)", descripcion: "Tradición del Rincón", precio: 134.00, tiempo_preparacion: 10, dificultad: 2 as const, estacion: "Calientes" as const, categoriaId: catPlatosFuertes, disponible: true },
      { nombre: "Pozole blanco, verde o rojo (350ml)", descripcion: "Plato muy mexicano", precio: 104.00, tiempo_preparacion: 8, dificultad: 2 as const, estacion: "Calientes" as const, categoriaId: catPlatosFuertes, disponible: true },

      // VEGANO Y ENSALADAS
      { nombre: "Lasaña de berenjena, tomate y tofu", descripcion: "Opción vegana principal", precio: 120.00, tiempo_preparacion: 20, dificultad: 3 as const, estacion: "Calientes" as const, categoriaId: catVeganoEnsaladas, disponible: true },
      { nombre: "Ensalada de quinoa con vegetales y frutos mixtos", descripcion: "Fresco y saludable", precio: 120.00, tiempo_preparacion: 10, dificultad: 1 as const, estacion: "Fríos" as const, categoriaId: catVeganoEnsaladas, disponible: true },

      // EMPAREDADOS
      { nombre: "Club Sandwich (300gr)", descripcion: "Clásico sandwich de tres pisos", precio: 99.00, tiempo_preparacion: 12, dificultad: 2 as const, estacion: "Calientes" as const, categoriaId: catEmparedados, disponible: true },
      { nombre: "Hamburguesa PRIME El Rincón (230gr)", descripcion: "Nuestra especialidad", precio: 119.00, tiempo_preparacion: 15, dificultad: 2 as const, estacion: "Calientes" as const, categoriaId: catEmparedados, disponible: true },

      // BEBIDAS
      { nombre: "Café americano", descripcion: "Con refill (3 tazas en desayuno)", precio: 28.00, tiempo_preparacion: 2, dificultad: 1 as const, estacion: "Fríos" as const, categoriaId: catBebidas, disponible: true },
      { nombre: "Jugo natural (350ml)", descripcion: "Naranja o verde", precio: 39.00, tiempo_preparacion: 3, dificultad: 1 as const, estacion: "Fríos" as const, categoriaId: catBebidas, disponible: true },
      { nombre: "Limonada o naranjada (350ml)", descripcion: "Agua fresca", precio: 33.00, tiempo_preparacion: 3, dificultad: 1 as const, estacion: "Fríos" as const, categoriaId: catBebidas, disponible: true },
      { nombre: "Cerveza artesanal (355ml)", descripcion: "Botella", precio: 59.00, tiempo_preparacion: 1, dificultad: 1 as const, estacion: "Fríos" as const, categoriaId: catBebidas, disponible: true },
      { nombre: "Vino de la casa (6oz)", descripcion: "Copa de vino tinto o blanco", precio: 69.00, tiempo_preparacion: 1, dificultad: 1 as const, estacion: "Fríos" as const, categoriaId: catBebidas, disponible: true },

      // POSTRES Y PANADERÍA
      { nombre: "Pan francés con panqué (3pz)", descripcion: "Esponjoso y dulce", precio: 49.00, tiempo_preparacion: 8, dificultad: 2 as const, estacion: "Postres" as const, categoriaId: catPostres, disponible: true },
      { nombre: "Crepas de cajeta (4pz)", descripcion: "Postre tradicional", precio: 56.00, tiempo_preparacion: 10, dificultad: 2 as const, estacion: "Postres" as const, categoriaId: catPostres, disponible: true },
      { nombre: "Pastel de la casa", descripcion: "Pregunte por la variedad del día", precio: 64.00, tiempo_preparacion: 2, dificultad: 1 as const, estacion: "Postres" as const, categoriaId: catPostres, disponible: true },
    ];

    for (const prod of menuMock) {
      await ctx.db.insert("productos", prod);
    }

    return "¡Menú Real inyectado correctamente!";
  },
});

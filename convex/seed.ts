import { mutation } from "./_generated/server";

export const injectTestData = mutation({
  args: {},
  handler: async (ctx) => {
    const ahora = Date.now();

    const mockPedidos = [
      {
        platillo: "Hamburguesa Clásica con Papas",
        estacion: "Calientes" as const,
        tiempo_preparacion: 15,
        dificultad: 2 as const,
        estado: "Pendiente" as const,
        numero_mesa: 4,
        id_mesero: "mesero_1",
        notas: "Sin cebolla, extra queso",
        total: 150.00,
        creado_en: ahora,
        actualizado_en: ahora,
      },
      {
        platillo: "Tarta de Manzana",
        estacion: "Postres" as const,
        tiempo_preparacion: 5,
        dificultad: 1 as const,
        estado: "Pendiente" as const,
        numero_mesa: 2,
        id_mesero: "mesero_2",
        notas: "Caliente por favor",
        total: 80.00,
        creado_en: ahora + 1000,
        actualizado_en: ahora + 1000,
      },
      {
        platillo: "Ensalada César",
        estacion: "Fríos" as const,
        tiempo_preparacion: 10,
        dificultad: 1 as const,
        estado: "En Preparación" as const,
        numero_mesa: 7,
        id_mesero: "mesero_1",
        notas: "Aderezo aparte",
        total: 120.00,
        creado_en: ahora - 600000,
        actualizado_en: ahora - 300000,
      }
    ];

    for (const p of mockPedidos) {
      await ctx.db.insert("pedidos", p);
    }

    return "¡Pedidos de prueba inyectados correctamente!";
  },
});

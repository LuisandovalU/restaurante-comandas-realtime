import { mutation } from "./_generated/server";

export const injectTickets = mutation({
  args: {},
  handler: async (ctx) => {
    const ahora = Date.now();

    const mockTickets = [
      {
        platillo: "Rib eye (400gr)",
        estacion: "Calientes" as const,
        tiempo_preparacion: 20,
        dificultad: 3 as const,
        estado: "Pagado" as const, // ESTADO PAGADO PARA QUE SALGA EN FACTURACIÓN
        numero_mesa: 5,
        id_mesero: "mesero_1",
        notas: "Término medio",
        total: 220.00,
        creado_en: ahora - 3600000, // Hace 1 hora
        actualizado_en: ahora - 1800000, // Pagado hace 30 min
      },
      {
        platillo: "Vino de la casa (6oz)",
        estacion: "Fríos" as const,
        tiempo_preparacion: 1,
        dificultad: 1 as const,
        estado: "Pagado" as const,
        numero_mesa: 5,
        id_mesero: "mesero_1",
        notas: "",
        total: 69.00,
        creado_en: ahora - 3600000,
        actualizado_en: ahora - 1800000,
      },
      {
        platillo: "Lasaña de berenjena, tomate y tofu",
        estacion: "Calientes" as const,
        tiempo_preparacion: 20,
        dificultad: 3 as const,
        estado: "Pagado" as const,
        numero_mesa: 2,
        id_mesero: "mesero_2",
        notas: "Bien caliente",
        total: 120.00,
        creado_en: ahora - 7200000, // Hace 2 horas
        actualizado_en: ahora - 3600000, // Pagado hace 1 hora
      }
    ];

    for (const ticket of mockTickets) {
      await ctx.db.insert("pedidos", ticket);
    }

    return "¡Tickets de prueba inyectados correctamente!";
  },
});

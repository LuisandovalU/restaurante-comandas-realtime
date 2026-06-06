// convex/auth.config.ts — Configuración de autenticación de Convex
// Documentación: https://docs.convex.dev/auth
// Usa la autenticación built-in de Convex (correo y contraseña — RF-01)
export default {
  providers: [
    {
      // Proveedor nativo de Convex: autenticación por correo y contraseña
      // No requiere servicios externos como Clerk o Auth0
      domain: process.env["CONVEX_SITE_URL"] as string,
      applicationID: "convex",
    },
  ],
};

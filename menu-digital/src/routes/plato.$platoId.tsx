// menu-digital/src/routes/plato.$platoId.tsx — Detalle de un platillo
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/plato/$platoId")({
  component: PaginaDetalle,
});

// Mismo mock que index.tsx — en producción ambos se alimentan de Convex
const PLATILLOS: Record<string, {
  nombre: string; descripcion: string; precio: number;
  tiempo_preparacion: number; estacion: string; dificultad: number; categoria: string;
}> = {
  p1: { nombre: "Sopa de Lima", descripcion: "Caldo de pollo con lima, tortilla crujiente y chile de árbol", precio: 85, tiempo_preparacion: 10, estacion: "Calientes", dificultad: 2, categoria: "Entradas" },
  p2: { nombre: "Guacamole Artesanal", descripcion: "Aguacate, cilantro, jitomate y chile serrano. Acompañado de totopos artesanales", precio: 75, tiempo_preparacion: 5, estacion: "Fríos", dificultad: 1, categoria: "Entradas" },
  p3: { nombre: "Tacos de Canasta", descripcion: "3 tacos surtidos con salsa verde tatemada y cebolla morada encurtida", precio: 95, tiempo_preparacion: 12, estacion: "Calientes", dificultad: 2, categoria: "Platos Fuertes" },
  p4: { nombre: "Enchiladas Verdes", descripcion: "Con pollo deshebrado, crema ácida y queso fresco desmoronado", precio: 120, tiempo_preparacion: 18, estacion: "Calientes", dificultad: 3, categoria: "Platos Fuertes" },
  p5: { nombre: "Chiles Rellenos", descripcion: "Chile poblano relleno de picadillo en caldillo de jitomate asado", precio: 145, tiempo_preparacion: 25, estacion: "Calientes", dificultad: 4, categoria: "Platos Fuertes" },
  p6: { nombre: "Flan Napolitano", descripcion: "Receta tradicional de la abuela, con cajeta de cabra y nuez tostada", precio: 65, tiempo_preparacion: 3, estacion: "Postres", dificultad: 2, categoria: "Postres" },
  p7: { nombre: "Arroz con Leche", descripcion: "Con canela en rama, piloncillo y ralladura de naranja", precio: 55, tiempo_preparacion: 3, estacion: "Postres", dificultad: 1, categoria: "Postres" },
  p8: { nombre: "Agua de Jamaica", descripcion: "Flor de Jamaica fresca. Natural, sin azúcar añadida", precio: 40, tiempo_preparacion: 1, estacion: "Fríos", dificultad: 1, categoria: "Bebidas" },
  p9: { nombre: "Horchata de Arroz", descripcion: "Con canela real, vainilla y leche entera", precio: 45, tiempo_preparacion: 1, estacion: "Fríos", dificultad: 1, categoria: "Bebidas" },
};

const EMOJI: Record<string, string> = {
  Fríos: "❄️", Calientes: "🔥", Postres: "🍮", Bebidas: "🥤",
};

const DIFICULTAD: Record<number, string> = {
  1: "Muy fácil", 2: "Fácil", 3: "Intermedio", 4: "Difícil", 5: "Especialidad del chef",
};

function PaginaDetalle() {
  const { platoId } = Route.useParams();
  const plato = PLATILLOS[platoId];

  if (!plato) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: 16, padding: 24 }}>
        <span style={{ fontSize: "3rem" }}>🍽️</span>
        <p style={{ color: "var(--color-texto-muted)", fontSize: "1rem" }}>Platillo no disponible</p>
        <Link to="/" className="btn-volver" style={{ position: "static" }}>← Ver todo el menú</Link>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <div className="detalle-hero">
        <Link to="/" className="btn-volver">← Menú</Link>
        <div className="detalle-imagen-placeholder">
          {EMOJI[plato.estacion] ?? "🍽️"}
        </div>
      </div>

      {/* Contenido */}
      <main className="detalle-contenido">
        <div className="detalle-categoria-badge" style={{ marginBottom: 12 }}>
          {plato.categoria}
        </div>

        <h1 className="detalle-nombre">{plato.nombre}</h1>
        <p className="detalle-descripcion">{plato.descripcion}</p>

        <div className="detalle-info-grid">
          <div className="info-chip">
            <span className="info-chip-label">Precio</span>
            <span className="info-chip-valor">${plato.precio.toFixed(2)} MXN</span>
          </div>
          <div className="info-chip">
            <span className="info-chip-label">Tiempo estimado</span>
            <span className="info-chip-valor">{plato.tiempo_preparacion} min</span>
          </div>
          <div className="info-chip">
            <span className="info-chip-label">Estación</span>
            <span className="info-chip-valor">{EMOJI[plato.estacion]} {plato.estacion}</span>
          </div>
          <div className="info-chip">
            <span className="info-chip-label">Dificultad</span>
            <span className="info-chip-valor">{DIFICULTAD[plato.dificultad]}</span>
          </div>
        </div>

        <Link
          to="/"
          style={{ display: "block", textAlign: "center", padding: "14px", background: "rgba(212,160,84,0.12)", border: "1.5px solid rgba(212,160,84,0.3)", borderRadius: "12px", color: "var(--color-dorado)", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}
        >
          ← Ver todo el menú
        </Link>
      </main>
    </>
  );
}

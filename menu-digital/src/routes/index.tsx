// menu-digital/src/routes/index.tsx — Página principal del menú
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: PaginaMenu,
});

// ── Datos de demostración ────────────────────────────────────────────────────
// Cuando integres Convex, reemplaza estos datos con:
//   const categorias = useQuery(api.menuPublico.listarCategorias);
//   const platillos  = useQuery(api.menuPublico.listarMenu, { ... });
const CATEGORIAS = [
  { _id: "cat1", nombre: "🥗 Entradas" },
  { _id: "cat2", nombre: "🍲 Platos Fuertes" },
  { _id: "cat3", nombre: "🍮 Postres" },
  { _id: "cat4", nombre: "🥤 Bebidas" },
];

const PLATILLOS = [
  { _id: "p1", nombre: "Sopa de Lima", descripcion: "Caldo de pollo con lima, tortilla crujiente y chile de árbol", precio: 85, tiempo_preparacion: 10, estacion: "Calientes", categoriaId: "cat1" },
  { _id: "p2", nombre: "Guacamole Artesanal", descripcion: "Aguacate, cilantro, jitomate y chile serrano. Acompañado de totopos", precio: 75, tiempo_preparacion: 5, estacion: "Fríos", categoriaId: "cat1" },
  { _id: "p3", nombre: "Tacos de Canasta", descripcion: "3 tacos surtidos con salsa verde tatemada y cebolla morada encurtida", precio: 95, tiempo_preparacion: 12, estacion: "Calientes", categoriaId: "cat2" },
  { _id: "p4", nombre: "Enchiladas Verdes", descripcion: "Con pollo deshebrado, crema ácida y queso fresco desmoronado", precio: 120, tiempo_preparacion: 18, estacion: "Calientes", categoriaId: "cat2" },
  { _id: "p5", nombre: "Chiles Rellenos", descripcion: "Chile poblano relleno de picadillo en caldillo de jitomate asado", precio: 145, tiempo_preparacion: 25, estacion: "Calientes", categoriaId: "cat2" },
  { _id: "p6", nombre: "Flan Napolitano", descripcion: "Receta tradicional de la abuela, con cajeta de cabra y nuez tostada", precio: 65, tiempo_preparacion: 3, estacion: "Postres", categoriaId: "cat3" },
  { _id: "p7", nombre: "Arroz con Leche", descripcion: "Con canela en rama, piloncillo y ralladura de naranja", precio: 55, tiempo_preparacion: 3, estacion: "Postres", categoriaId: "cat3" },
  { _id: "p8", nombre: "Agua de Jamaica", descripcion: "Flor de Jamaica fresca. Natural, sin azúcar añadida", precio: 40, tiempo_preparacion: 1, estacion: "Fríos", categoriaId: "cat4" },
  { _id: "p9", nombre: "Horchata de Arroz", descripcion: "Con canela real, vainilla y leche entera", precio: 45, tiempo_preparacion: 1, estacion: "Fríos", categoriaId: "cat4" },
];

const EMOJI: Record<string, string> = {
  Fríos: "❄️", Calientes: "🍳", Postres: "🍮", Bebidas: "🥤",
};

// ── Componente principal ─────────────────────────────────────────────────────
function PaginaMenu() {
  const [filtro, setFiltro] = useState<string | null>(null);

  const platillosFiltrados = filtro
    ? PLATILLOS.filter((p) => p.categoriaId === filtro)
    : PLATILLOS;

  return (
    <>
      {/* Hero */}
      <header className="hero">
        <div className="hero-logo">🍽️</div>
        <h1 className="hero-nombre">El Rincón del Parque</h1>
        <p className="hero-subtitulo">Menú Digital • Ciudad de México</p>
        <div className="hero-divider" />
      </header>

      {/* Filtro sticky de categorías */}
      <nav className="filtro-scroll" aria-label="Filtrar por categoría">
        <button
          className={`filtro-btn${filtro === null ? " activo" : ""}`}
          onClick={() => setFiltro(null)}
        >
          🍴 Todo
        </button>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat._id}
            className={`filtro-btn${filtro === cat._id ? " activo" : ""}`}
            onClick={() => setFiltro(filtro === cat._id ? null : cat._id)}
          >
            {cat.nombre}
          </button>
        ))}
      </nav>

      {/* Listado de platillos */}
      <main className="contenido">
        {filtro ? (
          <section className="seccion-categoria">
            {platillosFiltrados.map((p) => <TarjetaPlato key={p._id} plato={p} />)}
          </section>
        ) : (
          CATEGORIAS.map((cat) => {
            const items = PLATILLOS.filter((p) => p.categoriaId === cat._id);
            return (
              <section key={cat._id} className="seccion-categoria">
                <h2 className="seccion-titulo">{cat.nombre}</h2>
                {items.map((p) => <TarjetaPlato key={p._id} plato={p} />)}
              </section>
            );
          })
        )}
      </main>
    </>
  );
}

// ── Tarjeta de platillo ──────────────────────────────────────────────────────
function TarjetaPlato({ plato }: { plato: typeof PLATILLOS[0] }) {
  return (
    <Link
      to="/plato/$platoId"
      params={{ platoId: plato._id }}
      className="plato-card"
    >
      <div className="plato-imagen-placeholder" aria-hidden>
        {EMOJI[plato.estacion] ?? "🍽️"}
      </div>
      <div className="plato-info">
        <div className="plato-nombre">{plato.nombre}</div>
        <div className="plato-descripcion">{plato.descripcion}</div>
        <div className="plato-footer">
          <span className="plato-precio">${plato.precio.toFixed(2)} MXN</span>
          <span className="plato-tiempo">🕐 {plato.tiempo_preparacion} min</span>
        </div>
      </div>
    </Link>
  );
}

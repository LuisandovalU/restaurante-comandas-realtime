import { createFileRoute, Link } from '@tanstack/react-router'
import { usePos } from '../../application/usePos'
import { useState } from 'react'

export const Route = createFileRoute('/pos/')({
  component: PosPage,
})

function PosPage() {
  const { categorias, productos, mesa, setMesa, enviarPedido, entregarPedido, pedirCuenta, isSubmitting, cuentaMesa } = usePos();
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

  // Estado para el Modal de Notas
  const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);
  const [notasTemp, setNotasTemp] = useState("");

  // Estado para Método de Pago
  const [metodoPago, setMetodoPago] = useState<"Efectivo" | "Tarjeta" | "Dividido">("Tarjeta");

  // Filtrar productos por categoría seleccionada
  const productosFiltrados = categoriaActiva
    ? productos.filter(p => p.categoriaId === categoriaActiva)
    : productos;

  const handleAbrirModal = (prod: any) => {
    setProductoSeleccionado(prod);
    setNotasTemp("");
  };

  const handleConfirmarPedido = async () => {
    if (productoSeleccionado) {
      await enviarPedido(productoSeleccionado, notasTemp);
      setProductoSeleccionado(null);
    }
  };

  // Determinar si hay algo que cobrar (solo Entregados)
  const pedidosEntregados = cuentaMesa ? cuentaMesa.filter(p => p.estado === "Entregado") : [];
  const totalEntregados = pedidosEntregados.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="app-container">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', border: '1px solid var(--card-border)' }}>
            ← Volver al Inicio
          </Link>
          <h1>Punto de Venta (Menú)</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="mesa-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontWeight: 'bold' }}>Mesa:</span>
            <input 
              type="number" 
              min="1" 
              max="50" 
              value={mesa} 
              onChange={(e) => setMesa(Number(e.target.value))}
              style={{ width: '60px', background: 'transparent', border: '1px solid var(--card-border)', color: 'white', padding: '0.25rem', borderRadius: '4px', textAlign: 'center' }}
            />
          </div>
        </div>
      </header>

      <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Categorías */}
        <aside style={{ width: '250px', borderRight: '1px solid var(--kanban-column-border)', background: 'var(--bg-color)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Categorías</h2>
          <button 
            onClick={() => setCategoriaActiva(null)}
            className={`category-btn ${categoriaActiva === null ? 'active' : ''}`}
            style={{ 
              padding: '1rem', 
              textAlign: 'left', 
              background: categoriaActiva === null ? 'var(--accent-primary)' : 'var(--card-bg)', 
              border: '1px solid var(--card-border)', 
              borderRadius: 'var(--radius-md)', 
              color: 'white', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Ver Todo
          </button>
          {categorias.map(cat => (
            <button 
              key={cat._id}
              onClick={() => setCategoriaActiva(cat._id)}
              className={`category-btn ${categoriaActiva === cat._id ? 'active' : ''}`}
              style={{ 
                padding: '1rem', 
                textAlign: 'left', 
                background: categoriaActiva === cat._id ? 'var(--accent-primary)' : 'var(--card-bg)', 
                border: '1px solid var(--card-border)', 
                borderRadius: 'var(--radius-md)', 
                color: 'white', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat.nombre}
            </button>
          ))}
        </aside>

        {/* Grid de Productos */}
        <section style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {productosFiltrados.map(prod => (
              <div key={prod._id} className="pedido-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{prod.nombre}</h3>
                    <span style={{ background: 'var(--status-listo)', color: '#0f172a', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
                      ${prod.precio.toFixed(2)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {prod.descripcion}
                  </p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge-estacion" style={{ background: 'var(--kanban-column-bg)' }}>{prod.estacion}</span>
                  <button 
                    onClick={() => handleAbrirModal(prod)}
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: 'var(--accent-primary)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: 'var(--radius-sm)', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'transform 0.1s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            ))}
            
            {productosFiltrados.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                No hay productos en esta categoría.
              </div>
            )}
          </div>
        </section>

        {/* Sidebar Cuenta de la Mesa */}
        <aside style={{ width: '330px', borderLeft: '1px solid var(--kanban-column-border)', background: 'var(--bg-color)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Cuenta: Mesa {mesa}</h2>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cuentaMesa && cuentaMesa.length > 0 ? (
              cuentaMesa.map((pedido: any) => (
                <div key={pedido._id} style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{pedido.platillo}</span>
                    <span style={{ color: 'var(--status-listo)' }}>${pedido.total.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {pedido.estado === "Pendiente" && "⏳ Pendiente"}
                      {pedido.estado === "En Preparación" && "🔥 Preparando"}
                      {pedido.estado === "Listo" && "✅ Listo (En Cocina)"}
                      {pedido.estado === "Entregado" && "🍽️ Entregado"}
                      {pedido.estado === "En Proceso de Pago" && "🧾 Pagando"}
                    </span>

                    {/* Botón de Entregar si está Listo */}
                    {pedido.estado === "Listo" && (
                      <button 
                        onClick={() => entregarPedido(pedido._id)}
                        style={{ padding: '0.3rem 0.5rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Entregar
                      </button>
                    )}
                  </div>
                  {pedido.notas && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-primary)', fontStyle: 'italic' }}>
                      Nota: {pedido.notas}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🍽️</div>
                <p>La mesa {mesa} no tiene pedidos activos.</p>
              </div>
            )}
          </div>

          {/* Checkout (Pedir Cuenta) */}
          {pedidosEntregados.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                <span>Subtotal (Entregado):</span>
                <span style={{ color: 'var(--status-listo)' }}>
                  ${totalEntregados.toFixed(2)}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Método de Pago:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(["Efectivo", "Tarjeta", "Dividido"] as const).map(metodo => (
                    <button
                      key={metodo}
                      onClick={() => setMetodoPago(metodo)}
                      style={{ 
                        flex: 1, padding: '0.5rem', 
                        background: metodoPago === metodo ? 'var(--accent-primary)' : 'var(--card-bg)', 
                        border: '1px solid var(--card-border)', color: 'white', 
                        borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' 
                      }}
                    >
                      {metodo}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => pedirCuenta(metodoPago)}
                disabled={isSubmitting}
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', background: 'var(--accent-gradient)', border: 'none', color: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
              >
                {isSubmitting ? 'Procesando...' : 'Pedir Cuenta'}
              </button>
            </div>
          )}
        </aside>
      </main>

      {/* Modal de Notas (Glassmorphism) */}
      {productoSeleccionado && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div className="glass-panel" style={{ 
            background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-xl)', 
            width: '100%', maxWidth: '500px', border: '1px solid var(--card-border)' 
          }}>
            <h2 style={{ marginBottom: '0.5rem' }}>{productoSeleccionado.nombre}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Mesa {mesa}</p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Notas o instrucciones especiales:</label>
              <textarea 
                value={notasTemp}
                onChange={(e) => setNotasTemp(e.target.value)}
                placeholder="Ej. Sin cebolla, extra queso, para llevar..."
                style={{ 
                  width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', 
                  background: 'var(--bg-color)', border: '1px solid var(--card-border)', 
                  color: 'white', minHeight: '100px', resize: 'vertical' 
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setProductoSeleccionado(null)}
                disabled={isSubmitting}
                style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: 'white', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarPedido}
                disabled={isSubmitting}
                style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar y Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

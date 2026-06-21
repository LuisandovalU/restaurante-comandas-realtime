import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'

export const Route = createFileRoute('/tickets/')({
  component: TicketsPage,
})

function TicketsPage() {
  const ticketsPagados = useQuery(api.tickets.obtenerTicketsPagados);
  const mesasPorCobrar = useQuery(api.pedidos.getMesasPorCobrar);
  const cobrarMesaMutation = useMutation(api.pedidos.cobrarMesa);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCobrarMesa = async (numero_mesa: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await cobrarMesaMutation({ numero_mesa });
    } catch (error) {
      console.error("Error al cobrar la mesa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', border: '1px solid var(--card-border)' }}>
            ← Volver al Inicio
          </Link>
          <h1>Caja y Facturación</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button style={{ padding: '0.5rem 1rem', background: 'var(--status-listo)', color: '#0f172a', borderRadius: 'var(--radius-md)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Sincronizar SQL
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        
        {/* SECCIÓN 1: CAJA (Mesas pendientes de pago) */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🔔 Mesas por Cobrar
          </h2>
          
          {mesasPorCobrar === undefined ? (
            <div style={{ color: 'var(--text-secondary)' }}>Buscando mesas...</div>
          ) : mesasPorCobrar.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No hay mesas esperando la cuenta.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {mesasPorCobrar.map((mesa) => (
                <div key={mesa.mesa} className="glass-panel" style={{ padding: '1.5rem', border: '2px solid var(--accent-primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Mesa {mesa.mesa}</h3>
                    <span className="badge-estacion" style={{ background: 'var(--accent-primary)' }}>{mesa.metodo_pago}</span>
                  </div>

                  <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-sm)', maxHeight: '150px', overflowY: 'auto' }}>
                    {mesa.pedidos.map((p: any) => (
                      <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        <span>{p.platillo}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>${p.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--status-listo)' }}>
                      ${mesa.total.toFixed(2)}
                    </div>
                    <button 
                      onClick={() => handleCobrarMesa(mesa.mesa)}
                      disabled={isSubmitting}
                      style={{ padding: '0.75rem 1.5rem', background: 'var(--status-listo)', color: '#0f172a', border: 'none', borderRadius: 'var(--radius-md)', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                    >
                      Confirmar Pago
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)' }} />

        {/* SECCIÓN 2: HISTORIAL DE TICKETS (Ya cobrados) */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            🧾 Historial de Tickets Facturados
          </h2>

          {ticketsPagados === undefined ? (
            <div style={{ color: 'var(--text-secondary)' }}>Cargando historial...</div>
          ) : ticketsPagados.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧾</div>
              <p>Los pedidos que cobres aparecerán aquí.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {ticketsPagados.map((ticket) => (
                <div key={ticket._id} className="pedido-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--card-border)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(ticket.actualizado_en).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="badge-estacion" style={{ background: 'var(--status-listo)', color: '#0f172a' }}>Pagado</span>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Mesa {ticket.numero_mesa}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{ticket.platillo}</p>
                    {ticket.metodo_pago && (
                      <p style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Pago: {ticket.metodo_pago}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Mesero: {ticket.id_mesero.split('_')[1] ?? '1'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      ${ticket.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { KanbanBoard } from '../../presentation/components/KanbanBoard'

export const Route = createFileRoute('/tablero/')({
  component: TableroPage,
})

function TableroPage() {
  return (
    <div className="app-container">
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'var(--card-bg)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', border: '1px solid var(--card-border)' }}>
            ← Volver al Inicio
          </Link>
          <h1>Cocina: El Rincón del Parque</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-listo)', boxShadow: '0 0 10px var(--status-listo)' }}></span>
            Sincronización Activa
          </div>
        </div>
      </header>
      
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <KanbanBoard />
      </main>
    </div>
  )
}

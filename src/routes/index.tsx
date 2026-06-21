import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

type Role = 'MESERO' | 'COCINA' | 'ADMIN' | null;

function LandingPage() {
  const [role, setRole] = useState<Role>(null);
  const navigate = useNavigate();

  // Simular persistencia simple
  useEffect(() => {
    const saved = localStorage.getItem('app_role') as Role;
    if (saved) setRole(saved);
  }, []);

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    if (selectedRole) {
      localStorage.setItem('app_role', selectedRole);
    } else {
      localStorage.removeItem('app_role');
    }
  };

  if (!role) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Iniciar Sesión
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.2rem' }}>
            Selecciona tu perfil para ingresar al sistema
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={() => handleLogin('MESERO')} className="btn-primary" style={{ padding: '1rem', fontSize: '1.2rem', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              👨‍🍳 Entrar como Mesero
            </button>
            <button onClick={() => handleLogin('COCINA')} className="btn-primary" style={{ padding: '1rem', fontSize: '1.2rem', background: 'var(--status-pendiente)', border: 'none', color: 'black', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              🍳 Entrar como Cocinero
            </button>
            <button onClick={() => handleLogin('ADMIN')} className="btn-primary" style={{ padding: '1rem', fontSize: '1.2rem', background: 'var(--status-listo)', border: 'none', color: 'black', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              🧾 Entrar como Administrador
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, color: 'white' }}>
            Hola, {role}
          </h1>
          <button onClick={() => handleLogin(null)} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.2rem' }}>
          Selecciona el módulo al que deseas ingresar
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          
          {(role === 'MESERO' || role === 'ADMIN') && (
            <Link to="/pos" className="pedido-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
              <div style={{ fontSize: '3rem' }}>📋</div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>Punto de Venta</h2>
              <span className="badge-estacion" style={{ background: 'var(--accent-primary)' }}>Meseros</span>
            </Link>
          )}

          {(role === 'COCINA' || role === 'ADMIN') && (
            <Link to="/tablero" className="pedido-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
              <div style={{ fontSize: '3rem' }}>🍳</div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>Cocina</h2>
              <span className="badge-estacion" style={{ background: 'var(--status-pendiente)' }}>Cocineros</span>
            </Link>
          )}

          {role === 'ADMIN' && (
            <Link to="/tickets" className="pedido-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
              <div style={{ fontSize: '3rem' }}>🧾</div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem' }}>Facturación</h2>
              <span className="badge-estacion" style={{ background: 'var(--status-listo)' }}>Caja / Admin</span>
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}

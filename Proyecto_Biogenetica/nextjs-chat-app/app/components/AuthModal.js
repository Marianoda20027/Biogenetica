import { FcGoogle } from "react-icons/fc";

export default function AuthModal({ onSignIn }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Bienvenido al Chat</h1>
        <p style={{ marginBottom: '1.5rem' }}>Inicia sesión para continuar</p>
        <button
          onClick={onSignIn}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '0.5rem 1.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151', hover: { backgroundColor: '#f9fafb' } }}
        >
          <FcGoogle style={{ marginRight: '0.5rem' }} />
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
}
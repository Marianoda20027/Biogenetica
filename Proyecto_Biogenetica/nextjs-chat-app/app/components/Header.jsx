export default function Header({ onCreateGroup }) {
    return (
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#333' }}>Chat de Biogenetica</h2>
        <button
          onClick={onCreateGroup}
          style={{
            padding: '10px 1rem',
            backgroundColor: '#25D366',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#128C7E')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#25D366')}
        >
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span> Crear Grupo
        </button>
      </div>
    );
  }
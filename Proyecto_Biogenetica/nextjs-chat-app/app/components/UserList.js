export default function UserList({ users, onSelectUser }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => {
            console.log("Usuario seleccionado:", user.id, user.displayName); // Depuración
            onSelectUser(user.id, user.displayName);
          }}
          style={{
            padding: '0.75rem',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'background-color 0.2s',
            fontWeight: '500',
            fontSize: '1rem',
            color: '#333',
            backgroundColor: '#fff',
            marginBottom: '0.5rem',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
        >
          <span>{user.displayName}</span>
        </div>
      ))}
    </div>
  );
}
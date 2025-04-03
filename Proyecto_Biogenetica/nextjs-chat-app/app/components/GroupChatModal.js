'use client';
import { useState } from 'react';
import Swal from 'sweetalert2'; // Importar SweetAlert2

export default function GroupChatModal({ users = [], currentUserId, onCreateGroup, onClose }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");

  // Filtrar usuarios para excluir al usuario actual
  const filteredUsers = users.filter(user => user.id !== currentUserId);

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    // Validar que el grupo tenga un nombre y al menos 2 miembros
    if (groupName.trim() === "") {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El grupo debe tener un nombre.',
      });
      return;
    }

    if (selectedUsers.length < 2) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El grupo debe tener al menos 2 miembros.',
      });
      return;
    }

    // Si todo está bien, crear el grupo
    onCreateGroup(groupName, selectedUsers);
    onClose(); // Cerrar el modal
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
        width: '350px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-in-out'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.5rem' }}>Crear Grupo</h2>
        
        {/* Input para el nombre del grupo */}
        <input
          type="text"
          placeholder="Nombre del Grupo"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '1rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />

        {/* Lista de usuarios filtrados */}
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          textAlign: 'left'
        }}>
          {filteredUsers.map(user => (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center',
              gap: '0.5rem', padding: '5px 0'
            }}>
              <input
                type="checkbox"
                id={`user-${user.id}`}
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleUserSelection(user.id)}
              />
              <label htmlFor={`user-${user.id}`} style={{ fontSize: '1rem', color: '#333' }}>
                {user.displayName}
              </label>
            </div>
          ))}
        </div>

        {/* Botones de acción */}
        <button onClick={handleCreateGroup} style={{
          marginTop: '1rem',
          padding: '10px',
          width: '100%',
          backgroundColor: '#28a745',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: '0.3s',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
        >
          ✅ Crear Grupo
        </button>

        <button onClick={onClose} style={{
          marginTop: '0.5rem',
          padding: '10px',
          width: '100%',
          backgroundColor: '#dc3545',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: '0.3s',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  );
}
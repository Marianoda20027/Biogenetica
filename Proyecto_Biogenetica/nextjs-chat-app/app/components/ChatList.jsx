import { FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
export default function ChatList({ chats, user, onSelectChat, onDeleteChat }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
      {chats.map((chat) => {
        const chatName = chat.isGroup
          ? chat.groupName
          : chat.userNames.find((name) => name !== user.displayName);

        const unreadCount = chat.unreadCounts?.[user.uid] || 0;
        console.log(`Chat ID: ${chat.id}, Unread Count: ${unreadCount}, User UID: ${user.uid}`);

        return (
          <div
            key={chat.id}
            style={{
              padding: '0.75rem',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: '500',
              fontSize: '1rem',
              color: '#333',
              backgroundColor: '#fff',
              transition: 'background-color 0.2s',
              boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
              marginBottom: '0.5rem',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
          >
            <div
              onClick={() => onSelectChat(chat.id)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {chat.isGroup ? (
                <span style={{ color: '#6D28D9', fontWeight: 'bold', marginRight: '0.5rem' }}>👥</span>
              ) : (
                <span style={{ color: '#4B5563', fontWeight: 'bold', marginRight: '0.5rem' }}>💬</span>
              )}
              <span>{chatName}</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: '#25D366',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                Swal.fire({
                  title: '¿Eliminar este chat?',
                  text: 'Esta acción no se puede deshacer.',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Sí, eliminar',
                  cancelButtonText: 'Cancelar',
                  confirmButtonColor: '#dc3545',
                  cancelButtonColor: '#6c757d',
                }).then((result) => {
                  if (result.isConfirmed) {
                    onDeleteChat(chat.id);
                  }
                });
              }}
              style={{
                cursor: 'pointer',
                color: '#dc3545',
                padding: '0.5rem',
                transition: '0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#b02a37')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#dc3545')}
            >
              <FaTrash />
            </div>
          </div>
        );
      })}
    </div>
  );
}
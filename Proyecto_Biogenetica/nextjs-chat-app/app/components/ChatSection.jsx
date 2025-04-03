import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatSection({ isMobile, selectedChat, messages, users, user, newMessage, setNewMessage, onSendMessage, onFileSelect, onBackToChats, groupName, chatusers, groupId,chatsUsersID}) {
  return (
    <div style={{ width: isMobile ? '100%' : '75%', backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {selectedChat ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
          {isMobile && (
            <button
              onClick={onBackToChats}
              style={{
                padding: '0.5rem',
                backgroundColor: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                margin: '0.5rem',
              }}
            >
              Volver a Chats
            </button>
          )}
          <MessageList messages={messages} users={users} currentUserId={user?.uid} groupName={groupName} chatusers={chatusers} groupId={groupId} chatsUsersID={chatsUsersID} selectedChat = {selectedChat} />
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={onSendMessage}
            onFileSelect={onFileSelect}
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ marginBottom: '1rem' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Selecciona un chat para empezar
          </h2>
          <p style={{ fontSize: '1rem', color: '#9ca3af' }}>
            Comienza una conversación seleccionando un chat de la lista o crea un nuevo grupo.
          </p>
        </div>
      )}
    </div>
  );
}
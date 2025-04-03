'use client';
import { useState } from 'react';

export default function MessageInput({ newMessage, setNewMessage, onSendMessage, onFileSelect }) {
  const [filePreview, setFilePreview] = useState(null);


  const handleSendMessage = () => {
    onSendMessage();
    setFilePreview(null);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {filePreview && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
          {typeof filePreview === 'string' && filePreview.startsWith('data:image/') ? (
            <img src={filePreview} alt="Vista previa" style={{ maxWidth: '50px', borderRadius: '0.25rem' }} />
          ) : (
            <p style={{ margin: 0 }}>{filePreview}</p>
          )}
          <button
            onClick={() => {
              setFile(null);
              setFilePreview(null);
            }}
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
          >
            ✖
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}
          placeholder="Escribe un mensaje..."
        />
        <button
          onClick={handleSendMessage}
          style={{ backgroundColor: '#25D366', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

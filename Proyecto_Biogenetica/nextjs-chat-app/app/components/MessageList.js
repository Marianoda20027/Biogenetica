
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Timestamp, doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "/lib/firebase"; // Asegúrate de importar `db` desde tu configuración de Firebase

export default function MessageList({
  messages,
  users,
  currentUserId,
  groupName,
  chatusers, // Arreglo de nombres
  chatsUsersID, // Arreglo de IDs
  groupId,
  selectedChat,
}) {
  const [headerName, setHeaderName] = useState("Cargando...");
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);

  useEffect(() => {
    if (groupName) {
      // Si es un grupo, usar el nombre del grupo
      setHeaderName(groupName);
    } else if (chatusers && chatusers.length > 0 && chatsUsersID && chatsUsersID.length > 0) {
      // Si no es un grupo, obtener el nombre del otro usuario
      const otherUserIndex = chatsUsersID.findIndex((id) => id !== currentUserId);
      if (otherUserIndex !== -1) {
        const otherUserName = chatusers[otherUserIndex];
        setHeaderName(otherUserName);
      } else {
        setHeaderName("Chat privado");
      }
    }
  }, [messages, users, groupId, currentUserId, chatusers, chatsUsersID, groupName]);

  // 🔹 Formatear fecha para el separador
  const formatDate = (timestamp) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === yesterday.toDateString()) return "Ayer";

    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // 🔹 Función para eliminar un miembro del grupo
  const handleRemoveMember = async (userName) => {
    try {
      // Verificar si `chatUsersID` está definido
      if (!chatsUsersID || !Array.isArray(chatsUsersID)) {
        Swal.fire("Error", "La lista de IDs de usuarios no está disponible.", "error");
        return;
      }

      // Obtener el índice del nombre en `chatusers`
      const userIndex = chatusers.indexOf(userName);

      if (userIndex === -1) {
        Swal.fire("Error", "No se encontró el usuario.", "error");
        return;
      }

      // Obtener el ID correspondiente al nombre
      const userIdToRemove = chatsUsersID[userIndex];

      // Verificar si el ID es válido
      if (!userIdToRemove) {
        Swal.fire("Error", "No se encontró el ID del usuario.", "error");
        return;
      }

      // Referencia al documento del chat
      const chatRef = doc(db, "chats", groupId);

      // Eliminar el nombre y el ID correspondiente
      await updateDoc(chatRef, {
        users: arrayRemove(userIdToRemove), // Eliminar el ID
        userNames: arrayRemove(userName), // Eliminar el nombre
      });

      // Si el usuario que se está eliminando es el usuario actual, cerrar el chat
      if (userIdToRemove === currentUserId) {
        selectedChat = null;
        setShowMembers(false); // Cerrar el modal de miembros
      }

      Swal.fire("Éxito", "Usuario eliminado del grupo.", "success");
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
    }
  };

  // 🔹 Función para añadir un miembro al grupo
  const handleAddMember = async (userId, userName) => {
    try {
      // Referencia al documento del chat
      const chatRef = doc(db, "chats", groupId);

      // Añadir el ID y el nombre del usuario al grupo
      await updateDoc(chatRef, {
        users: arrayUnion(userId), // Añadir el ID
        userNames: arrayUnion(userName), // Añadir el nombre
      });

      Swal.fire("Éxito", "Usuario añadido al grupo.", "success");
    } catch (error) {
      console.error("Error al añadir el usuario:", error);
      Swal.fire("Error", "No se pudo añadir el usuario.", "error");
    }
  };

  // 🔹 Obtener usuarios que no están en el grupo
  const getUsersNotInGroup = () => {
    return users.filter(
      (user) => !chatsUsersID.includes(user.id) // Excluir usuarios que ya están en el grupo
    );
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header del Chat */}
      <div
        style={{
          padding: "26px",
          borderBottom: "1px solid #ddd",
          backgroundColor: "#f8f8f8",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "1.2rem",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flex: 1, overflow: "hidden" }}>
          {/* Nombre del grupo o chat */}
          <div
            style={{
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: "0 15px",
            }}
          >
            {headerName}
          </div>

          {/* Botón "Ver Miembros" (solo para grupos) */}
          {groupName && (
            <button
              style={{
                padding: "0px 10px",
                borderRadius: "8px",
                border: "none",
                background: "#5ac85a",
                color: "white",
                fontWeight: "300",
                cursor: "pointer",
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                flexShrink: 0,
              }}
              onClick={() => setShowMembers(true)}
            >
              + Ver Miembros
            </button>
          )}
        </div>
      </div>

      {/* Mensajes con separador de fechas */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column" }}>
        {messages.reduce((acc, msg, index) => {
          const isCurrentUser = msg.user === currentUserId;
          const userName = users.find((u) => u.id === msg.user)?.displayName || msg.user;
          const messageTime = msg.timestamp
            ? new Date(msg.timestamp instanceof Timestamp ? msg.timestamp.toDate() : msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Fecha inválida";
          const currentDate = formatDate(msg.timestamp);

          // 🔹 Agregar separador de fecha si cambia
          if (index === 0 || formatDate(messages[index - 1].timestamp) !== currentDate) {
            acc.push(
              <div
                key={`date-${currentDate}`}
                style={{
                  textAlign: "center",
                  backgroundColor: "#e0e0e0",
                  padding: "5px 10px",
                  borderRadius: "15px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  color: "#333",
                  margin: "10px auto",
                  display: "inline-block",
                  marginLeft: "500px",
                }}
              >
                {currentDate}
              </div>
            );
          }

          // 🔹 Agregar mensaje en el formato correcto
          acc.push(
            <div
              key={msg.id}
              style={{
                alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                maxWidth: "70%",
                padding: "0.5rem 1rem",
                borderRadius: "1rem",
                backgroundColor: isCurrentUser ? "#dcf8c6" : "#f5f5f5",
                color: "#333",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                marginBottom: "5px",
              }}
            >
              {!isCurrentUser && <strong>{userName}</strong>}
              {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#666",
                  textAlign: isCurrentUser ? "right" : "left",
                  margin: 0,
                }}
              >
                {messageTime}
              </p>
            </div>
          );

          return acc;
        }, [])}
      </div>

      {/* Modal de Miembros */}
      {showMembers && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "10px",
              width: "350px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
              textAlign: "center",
              position: "relative",
            }}
          >
            <h2 style={{ marginBottom: "1rem", color: "#333" }}>Miembros del Grupo</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {chatusers.map((userName, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    background: "#f5f5f5",
                    borderRadius: "5px",
                    marginBottom: "0.5rem",
                    color: "#333",
                  }}
                >
                  {userName}
                  <button
                    style={{
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      padding: "5px",
                    }}
                    onClick={() => handleRemoveMember(userName)}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>

            {/* Botón para añadir miembros */}
            <button
              style={{
                marginTop: "1rem",
                padding: "8px 15px",
                border: "none",
                background: "#28a745",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => setShowAddMembers(true)}
            >
              + Añadir Miembros
            </button>

            {/* Botón para cerrar el modal */}
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "#333",
              }}
              onClick={() => setShowMembers(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Modal para añadir miembros */}
      {showAddMembers && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "10px",
              width: "350px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
              textAlign: "center",
              position: "relative",
            }}
          >
            <h2 style={{ marginBottom: "1rem", color: "#333" }}>Añadir Miembros</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {getUsersNotInGroup().map((user) => (
                <li
                  key={user.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    background: "#f5f5f5",
                    borderRadius: "5px",
                    marginBottom: "0.5rem",
                    color: "#333",
                  }}
                >
                  {user.displayName}
                  <button
                    style={{
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      padding: "5px 10px",
                    }}
                    onClick={() => handleAddMember(user.id, user.displayName)}
                  >
                    Añadir
                  </button>
                </li>
              ))}
            </ul>

            {/* Botón para cerrar el modal */}
            <button
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "#333",
              }}
              onClick={() => setShowAddMembers(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';
import { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, setDoc, where, addDoc, deleteDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, googleProvider } from '/lib/firebase';
import Header from './components/Header';
import UserList from './components/UserList';
import ChatList from './components/ChatList';
import ChatSection from './components/ChatSection';
import AuthModal from './components/AuthModal';
import GroupChatModal from './components/GroupChatModal';

export default function ChatApp() {
  const [error, setError] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [groupName, setGroupName] = useState(null);
  const [chatsUsersID, setChatsUsersID] = useState(null);
  const [user, setUser] = useState(null);
  const [chatsUsers, setChatsUsers] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef(null);

  // Detectar si el dispositivo es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Manejar el estado de autenticación del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { uid: user.uid, displayName: user.displayName, email: user.email }, { merge: true });
        setUser(user);
        loadChats(user.uid);
        loadUsers();
      } else {
        setUser(null);
        setChats([]);
        setMessages([]);
        setSelectedChat(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Cargar los chats del usuario
  const loadChats = (userId) => {
    if (!userId) return;

    const q = query(
      collection(db, 'chats'),
      where('users', 'array-contains', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        unreadCounts: doc.data().unreadCounts || {}
      }));

      setChats(loadedChats);
    });

    return unsubscribe;
  };

  // Cargar usuarios
  const loadUsers = async () => {
    const q = query(collection(db, 'users'));
    onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  };

  // Crear un chat
  const createChat = async (userId1, userId2, userName1, userName2) => {
    try {
      const chatRef = await addDoc(collection(db, 'chats'), {
        users: [userId1, userId2],
        userNames: [userName1, userName2],
        timestamp: new Date(),
        lastMessage: '',
        unreadCounts: { [userId1]: 0, [userId2]: 0 },
      });
      return chatRef.id; // Retorna el ID del chat creado
    } catch (error) {
      setError('Error al crear el chat: ' + error.message);
      return null;
    }
  };

  // Seleccionar o crear un chat
  const selectOrCreateChat = async (otherUserId, otherUserName) => {
    if (!user || !otherUserId || !otherUserName) {
      setError('Datos incompletos para crear o seleccionar un chat.');
      return;
    }

    const existingChat = chats.find((chat) =>
      chat.users.includes(user.uid) && chat.users.includes(otherUserId)
    );

    if (existingChat) {
      selectChat(existingChat.id);
      return;
    }

    const newChatId = await createChat(user.uid, otherUserId, user.displayName, otherUserName);

    if (newChatId) {

      selectChat(newChatId);
    } else {
      setError('No se pudo crear el chat.');
    }
  };

  // Seleccionar un chat
  const selectChat = async (chatId) => {
    if (!chatId) {
      setError('No se proporcionó un ID de chat válido.');
      return;
    }

    setSelectedChat(chatId);
    resetUnreadCount(chatId);

    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      const chatData = chatSnap.data();
      setGroupName(chatData.groupName || null);
      setChatsUsers(chatData.userNames || null);
      setChatsUsersID(chatData.users || null);

      if (chatData.isGroup) {
        setCurrentGroupId(chatId);
      }
    } else {
      setError('El chat no existe en Firestore.');
    }
  };
  
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]); // Si no hay un chat seleccionado, limpia los mensajes
      return;
    }
  
    const messagesRef = collection(db, "chats", selectedChat, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc")); 
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const loadedMessages = [];
      querySnapshot.forEach((doc) => {
        loadedMessages.push({ id: doc.id, ...doc.data() });
      });
      setMessages(loadedMessages); 
    });
  
    return () => unsubscribe(); 
  }, [selectedChat]);

  const resetUnreadCount = async (chatId) => {
    if (!user) return;
    if (!chatId) return setError("No se proporcionó el id correcto");

    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      setError(`⚠ El chat con ID ${chatId} no existe en Firestore.`);
      return;
    }

    const chatData = chatDoc.data();
    const unreadCounts = { ...chatData.unreadCounts };

    if (unreadCounts[user.uid] > 0) {
      unreadCounts[user.uid] = 0;

      await setDoc(chatRef, { unreadCounts }, { merge: true });

      // Actualizar el estado local
      setChats((prevChats) =>
        prevChats.map((prevChat) =>
          prevChat.id === chatId
            ? { ...prevChat, unreadCounts: { ...prevChat.unreadCounts, [user.uid]: 0 } }
            : prevChat
        )
      );
    }
  };

  // Subir un archivo
  const uploadFile = async (file) => {
    if (!file) return null;
    const fileRef = ref(storage, `files/${file.name}`);
    try {
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);
      return fileURL;
    } catch (error) {
      setError('Error uploading file:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "" && !selectedFile) return;
    try {
      let fileURL = null;
      if (selectedFile) {
        fileURL = await uploadFile(selectedFile);
        if (!fileURL) throw new Error("Error al subir el archivo");
      }
  
      const messageData = {
        user: user.uid, // Usuario que envía el mensaje
        timestamp: new Date(),
      };
      if (fileURL) messageData.fileURL = fileURL;
      if (newMessage.trim() !== "") messageData.text = newMessage;
  
      await addDoc(collection(db, "chats", selectedChat, "messages"), messageData);
  
      // Obtener datos actualizados directamente de Firestore
      const chatRef = doc(db, "chats", selectedChat);
      const chatDoc = await getDoc(chatRef);
  
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        // Encontrar el destinatario (el que NO es el usuario actual)
        const recipientId = chatData.users.find((uid) => uid !== user.uid);
  
        if (recipientId) {
          // Crear un objeto con los contadores de mensajes no leídos por usuario
          const unreadCounts = chatData.unreadCounts || {};
  
          // Incrementar el contador solo para el destinatario
          unreadCounts[recipientId] = (unreadCounts[recipientId] || 0) + 1;
  
          // Actualizar solo el contador del destinatario
          await setDoc(chatRef, { unreadCounts }, { merge: true });
  
          // Actualizar estado local
          setChats((prevChats) =>
            prevChats.map((prevChat) =>
              prevChat.id === selectedChat
                ? { ...prevChat, unreadCounts }
                : prevChat
            )
          );
        }
      }
  
      setNewMessage("");
      setSelectedFile(null);
      scrollToBottom();
    } catch (error) {
      console.error("Error al enviar el mensaje o archivo:", error);
    }
  };
  

  // Crear un grupo
  const createGroupChat = async (groupName, selectedUsers) => {
    if (!user) return;
    if (selectedUsers.length < 2) {
      alert('Selecciona al menos dos usuarios para crear un grupo');
      return;
    }

    try {
      const chatRef = await addDoc(collection(db, 'chats'), {
        users: [...selectedUsers, user.uid],
        userNames: [
          ...selectedUsers.map((uid) => users.find((u) => u.id === uid)?.displayName).filter(Boolean),
          user.displayName,
        ],
        isGroup: true,
        groupName,
        timestamp: new Date(),
        lastMessage: '',
        unreadCounts: {},
      });

      setShowGroupModal(false);
      setCurrentGroupId(chatRef.id);
    } catch (error) {
      setError('Error al crear el grupo:', error);
    }
  };

  // Eliminar un chat
  const deleteChat = async (chatId) => {
    if (!chatId) return;

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        setError(`El chat con ID ${chatId} no existe.`);
        return;
      }

      await deleteDoc(chatRef);
    } catch (error) {
      setError('Error al eliminar el chat:', error);
    }
  };

  // Scroll automático al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      {(showChatList || !isMobile) && (
        <div
          style={{
            width: isMobile ? '100%' : '25%',
            backgroundColor: 'white',
            borderRight: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          }}
        >
          <Header onCreateGroup={() => setShowGroupModal(true)} />
          <h3 style={{ padding: '1rem', margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>
            Chats
          </h3>
          <ChatList chats={chats} user={user} onSelectChat={selectChat} onDeleteChat={deleteChat} />
          <h3 style={{ padding: '1rem', margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>
            Contactos
          </h3>
          <UserList users={users} onSelectUser={selectOrCreateChat} />
        </div>
      )}

      {(!showChatList || !isMobile) && (
        <ChatSection
          isMobile={isMobile}
          selectedChat={selectedChat}
          messages={messages}
          users={users}
          chatusers={chatsUsers}
          user={user}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={sendMessage}
          onFileSelect={setSelectedFile}
          onBackToChats={() => setShowChatList(true)}
          groupName={groupName}
          groupId={currentGroupId}
          chatsUsersID={chatsUsersID}
          messagesEndRef={messagesEndRef}
        />
      )}

      {showGroupModal && (
        <GroupChatModal
          users={users}
          currentUserId={user?.uid}
          onCreateGroup={createGroupChat}
          onClose={() => setShowGroupModal(false)}
        />
      )}

      {!user && <AuthModal onSignIn={() => signInWithPopup(auth, googleProvider)} />}
    </div>
  );
}
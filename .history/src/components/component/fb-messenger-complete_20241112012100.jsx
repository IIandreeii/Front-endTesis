import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatComponent = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const socket = io('http://localhost:3001'); // Conecta con el backend

  useEffect(() => {
    // Obtener chats desde la API
    const fetchChats = async () => {
      const response = await fetch('http://localhost:3001/chats?userId=USER_ID');  // Reemplaza con tu ID
      const data = await response.json();
      setChats(data);
    };

    fetchChats();

    // Escuchar mensajes en tiempo real
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage'); // Limpiar el evento cuando el componente se desmonte
    };
  }, []);

  const handleChatSelect = async (chatId) => {
    // Obtener mensajes del chat seleccionado
    const response = await fetch(`http://localhost:3001/messages?senderId=USER_ID&receiverId=${chatId}`);
    const data = await response.json();
    setMessages(data);
    setActiveChat(chatId);
  };

  const handleSendMessage = () => {
    if (newMessage && activeChat) {
      socket.emit('sendMessage', {
        senderId: 'USER_ID', // Reemplaza con el ID del usuario actual
        receiverId: activeChat,
        message: newMessage,
      });
      setNewMessage('');
    }
  };

  return (
    <div>
      <div>
        <h1>Chats</h1>
        <div>
          {chats.map(chat => (
            <div key={chat.id} onClick={() => handleChatSelect(chat.id)}>
              <p>{chat.name}</p>
              <p>{chat.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {activeChat && (
        <div>
          <h2>Chat with {activeChat}</h2>
          <div>
            {messages.map((msg, index) => (
              <div key={index}>{msg.text}</div>
            ))}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje"
          />
          <button onClick={handleSendMessage}>Enviar</button>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;

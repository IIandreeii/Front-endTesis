'use client';  // Marcar como un componente del cliente

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatComponent = () => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const socket = io('http://localhost:3001'); // Conecta con el backend

  const userId = 'USER_ID'; // Reemplaza esto con el ID real del usuario

  useEffect(() => {
    // Obtener chats desde la API
    const fetchChats = async () => {
      const response = await fetch(`http://localhost:3001/chats?userId=${userId}`);  // Reemplaza con tu ID
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
    const chat = chats.find(c => c.id === chatId);
    const receiverId = chat.participants.find(p => p._id !== userId)._id;

    const response = await fetch(`http://localhost:3001/messages?senderId=${userId}&receiverId=${receiverId}`);
    const data = await response.json();
    setMessages(data);
    setActiveChat(chatId);
  };

  const handleSendMessage = () => {
    if (newMessage && activeChat) {
      const chat = chats.find(c => c.id === activeChat);
      const receiverId = chat.participants.find(p => p._id !== userId)._id;

      socket.emit('sendMessage', {
        senderId: userId, // Reemplaza con el ID del usuario actual
        receiverId: receiverId,
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
              <img src={chat.avatar} alt={chat.name} />
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

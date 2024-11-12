'use client';  // Marcar como un componente del cliente

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatComponent = () => {
  const [chats, setChats] = useState([]); // Asegúrate de que sea un array vacío al principio
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const socket = io('http://localhost:3001'); // Conecta con el backend

  const userId = '670447d138c6cbf0d6bc255e'; // Reemplaza esto con el ID real del usuario

  useEffect(() => {
    // Obtener chats desde la API
    const fetchChats = async () => {
      try {
        const response = await fetch(`http://localhost:3001/chats?userId=${userId}`);
        const data = await response.json();

        // Asegurarte de que data sea un arreglo
        if (Array.isArray(data)) {
          setChats(data);
        } else {
          console.error("La respuesta de la API no es un arreglo");
        }
      } catch (error) {
        console.error("Error al obtener los chats:", error);
      }
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
          {Array.isArray(chats) && chats.length > 0 ? (
            chats.map(chat => (
              <div key={chat.id} onClick={() => handleChatSelect(chat.id)}>
                <img src={chat.avatar} alt={chat.name} />
                <p>{chat.name}</p>
                <p>{chat.lastMessage}</p>
              </div>
            ))
          ) : (
            <p>No hay chats disponibles</p>
          )}
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

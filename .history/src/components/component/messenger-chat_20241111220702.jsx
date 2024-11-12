// FILE: MessengerChat.js
'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Send } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const MessengerChat = ({ receiverId, user, onCancel }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Unirse a la sala específica del usuario
    socket.emit('joinRoom', user.id);

    // Escuchar mensajes recibidos
    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    socket.on('receiveMessage', handleReceiveMessage);

    // Limpiar el evento cuando el componente se desmonta
    return () => {
      socket.emit('leaveRoom', user.id);
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [receiverId, user.id]);

  useEffect(() => {
    // Fetch initial messages from the server
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3001/messages?receiverId=${receiverId}&senderId=${user.id}`);
        if (!res.ok) {
          throw new Error(`Error fetching messages: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchMessages();
  }, [receiverId, user.id]);

  const handleSend = () => {
    if (newMessage.trim()) {
      const message = {
        senderId: user.id, // Asegúrate de que user.id esté definido
        receiverId,
        text: newMessage,
      };
      console.log('Enviando mensaje:', message); // Muestra los datos en la consola
      socket.emit('sendMessage', message);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-full md:max-w-md mx-auto bg-[#D8C7A9]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[70%] p-3 rounded-lg ${
              message.senderId === user.id
                ? 'ml-auto bg-[#ECE3D4]'
                : 'bg-[#E1DDBF]'
            }`}
          >
            <p className="text-[#042637]">{message.text}</p>
          </div>
        ))}
      </div>
      <div className="p-4 bg-[#D8C7A9]">
        <div className="flex items-center bg-white rounded-full shadow-md">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 p-2 bg-transparent outline-none text-[#042637]"
          />
          <button
            onClick={handleSend}
            className="p-2 text-[#042637] hover:text-[#E1DDBF] transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      <button onClick={onCancel} className="p-2 text-[#042637] hover:text-[#E1DDBF] transition-colors">
        Cancelar
      </button>
    </div>
  );
};

MessengerChat.propTypes = {
  receiverId: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default MessengerChat;
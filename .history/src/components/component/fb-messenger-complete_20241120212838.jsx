'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPaperPlane, faSearch } from '@fortawesome/free-solid-svg-icons';

const FbMessengerSimple = ({ receiverId }) => {
  const [user, setUser] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatPreviews, setChatPreviews] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [currentReceiverId, setCurrentReceiverId] = useState(receiverId);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3001/profile?secret_token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        if (!res.ok) {
          throw new Error(`Error fetching profile: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        if (data.user) {
          setUser({ ...data.user, type: 'user' });
          setIsAuthenticated(true);
        } else if (data.charity) {
          setUser({ ...data.charity, type: 'charity' });
          setIsAuthenticated(true);
        } else {
          throw new Error('Profile not found');
        }
      } catch (error) {
        console.error('Error:', error);
        setIsAuthenticated(false);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (!user) return;

    const fetchChatPreviews = async () => {
      try {
        const res = await fetch(`http://localhost:3001/chats?userId=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        if (!res.ok) {
          throw new Error(`Error fetching chats: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setChatPreviews(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchChatPreviews();
  }, [user, token]);

  useEffect(() => {
    if (!user || !activeChat) return;

    socket.current = io('http://localhost:3001', {
      auth: {
        token: localStorage.getItem('authToken')
      }
    });

    socket.current.emit('joinRoom', activeChat.id);

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3001/messages?chatId=${activeChat.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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

    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    socket.current.on('receiveMessage', handleReceiveMessage);

    const handleTyping = () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    };
    socket.current.on('typing', handleTyping);

    return () => {
      socket.current.emit('leaveRoom', activeChat.id);
      socket.current.off('receiveMessage', handleReceiveMessage);
      socket.current.off('typing', handleTyping);
    };
  }, [activeChat, user, token]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!activeChat) {
      console.error('No active chat selected');
      return;
    }

    if (message.trim()) {
      const newMessage = {
        senderId: user.id,
        receiverId: currentReceiverId,
        content: message,
        chatId: activeChat.id,
        timestamp: new Date().toLocaleTimeString()
      };
      socket.current.emit('sendMessage', newMessage);
      setMessage('');
    }
  };

  const handleChatClick = (chat) => {
    setActiveChat(chat);
    const recipient = chat.participants.find(participant => participant.id !== user.id);
    if (recipient) {
      setRecipientName(recipient.name);
      setCurrentReceiverId(recipient.id);
    }
    setMessages([]); // Clear messages when a new chat is selected
  };

  if (!isAuthenticated) {
    return <div className="flex h-screen items-center justify-center bg-[#ECE3D4]"><p className="text-2xl text-[#042637]">Es obligatorio iniciar sesión para acceder a esta vista.</p></div>;
  }

  return (
    <div className="flex h-[90vh] bg-[#ECE3D4]">
      <div className="w-full md:w-[320px] lg:w-[360px] border-r border-[#D8C7A9] flex flex-col">
        <div className="p-4 bg-[#D8C7A9] flex items-center">
          <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-[#042637] mr-2" />
          <input
            type="text"
            placeholder="Buscar chats..."
            className="w-full p-2 rounded-lg bg-white text-[#042637] border-none focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatPreviews.length === 0 ? (
            <p className="text-center text-[#042637]">No chats available.</p>
          ) : (
            chatPreviews.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center p-3 cursor-pointer transition-colors ${activeChat && activeChat.id === chat.id ? 'bg-[#D8C7A9]' : 'hover:bg-[#E1DDBF]'}`}
                onClick={() => handleChatClick(chat)}
              >
                <div className="relative mr-3">
                  <FontAwesomeIcon icon={faUser} className="w-12 h-12 text-[#042637]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-[#042637] truncate">{chat.participants.find(participant => participant.id !== user.id)?.name || 'Desconocido'}</h2>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-[#D8C7A9] flex justify-between items-center border-b border-[#E1DDBF]" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          {activeChat ? (
            <div>
              <h2 className="font-semibold text-[#042637]">{recipientName}</h2>
              <p className="text-sm text-[#042637]">Última conexión: hace 5 minutos</p>
            </div>
          ) : (
            <h2 className="font-semibold text-[#042637]">Selecciona un chat</h2>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeChat ? (
            messages.length === 0 ? (
              <p className="text-center text-[#042637]">No hay mensajes aún.</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-center max-w-xs ${msg.senderId === user.id ? 'bg-[#A8E6CF] text-white' : 'bg-[#E1DDBF]'} p-3 rounded-lg`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs ml-2">{msg.timestamp}</span>
                  </div>
                </div>
              ))
            )
          ) : (
            <p className="text-center text-[#042637]">Selecciona un chat para empezar a chatear.</p>
          )}
          {isTyping && <p className="text-center text-[#042637]">El usuario está escribiendo...</p>}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-[#E1DDBF]">
          <div className="flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full p-3 rounded-lg bg-white text-[#042637] border-none focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="ml-3 text-white p-3 rounded-full bg-[#042637] hover:bg-[#D8C7A9] transition-colors"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(FbMessengerSimple), { ssr: false });
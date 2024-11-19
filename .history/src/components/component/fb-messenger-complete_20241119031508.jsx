'use client';

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';

const ChatPage = ({ chatId }) => {
  const [user, setUser] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        router.push('/logind');
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
        } else if (data.charity) {
          setUser({ ...data.charity, type: 'charity' });
        } else {
          throw new Error('Profile not found');
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/logind');
      }
    };

    fetchProfile();
  }, [token, router]);

  useEffect(() => {
    if (!user) return;

    const fetchChat = async () => {
      try {
        const res = await fetch(`http://localhost:3001/chats/${chatId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        if (!res.ok) {
          throw new Error(`Error fetching chat: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setActiveChat(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchChat();
  }, [user, chatId, token]);

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

    return () => {
      socket.current.emit('leaveRoom', activeChat.id);
      socket.current.off('receiveMessage', handleReceiveMessage);
    };
  }, [activeChat, user, token]);

  const handleSend = () => {
    if (!activeChat) {
      console.error('No active chat selected');
      return;
    }

    if (message.trim()) {
      const newMessage = {
        senderId: user.id,
        receiverId: activeChat.participants.find(participant => participant.id !== user.id).id,
        content: message,
        chatId: activeChat.id,
      };
      socket.current.emit('sendMessage', newMessage);
      setMessage('');
    }
  };

  if (!user) {
    return <div className="flex h-screen items-center justify-center bg-[#ECE3D4]"><p className="text-2xl text-[#042637]">Es obligatorio iniciar sesión para acceder a esta vista.</p></div>;
  }

  return (
    <div className="flex h-screen bg-[#ECE3D4]">
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-[#D8C7A9] flex justify-between items-center border-b border-[#E1DDBF]">
          {activeChat && <h2 className="font-semibold text-[#042637]">{activeChat.participants.find(participant => participant.id !== user.id).name}</h2>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-center max-w-xs ${msg.senderId === user.id ? 'bg-[#A8E6CF] text-white' : 'bg-[#E1DDBF]'} p-3 rounded-lg`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
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
              className="ml-3 bg-[#042637] text-white p-3 rounded-full hover:bg-[#D8C7A9] transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
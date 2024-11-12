import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatComponent = ({ userId }) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [socket, setSocket] = useState(null);

  // Conectar al socket y limpiar al desmontar
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Obtener chats desde la API y configurar escucha de mensajes
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`http://localhost:3001/chats?userId=${userId}`);
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();

    if (socket) {
      socket.on('receiveMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [socket, userId]);

  // Manejar selección de chat
  const handleChatSelect = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:3001/messages?senderId=${userId}&receiverId=${chatId}`);
      const data = await response.json();
      setMessages(data);
      setActiveChat(chatId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Enviar mensaje al chat activo
  const handleSendMessage = () => {
    if (newMessage && activeChat && socket) {
      const messageData = {
        senderId: userId,
        receiverId: activeChat,
        message: newMessage,
      };

      socket.emit('sendMessage', messageData, (error) => {
        if (error) {
          console.error('Error sending message:', error);
        } else {
          setNewMessage('');
        }
      });
    }
  };

  return (
    <div>
      <div>
        <h1>Chats</h1>
        <div>
          {chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} onSelect={() => handleChatSelect(chat.id)} />
          ))}
        </div>
      </div>

      {activeChat && (
        <div>
          <h2>Chat with {activeChat}</h2>
          <div>
            {messages.map((msg, index) => (
              <MessageItem key={index} message={msg} />
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

const ChatItem = ({ chat, onSelect }) => (
  <div onClick={onSelect}>
    <p>{chat.name}</p>
    <p>{chat.lastMessage}</p>
  </div>
);

const MessageItem = ({ message }) => (
  <div>{message.text}</div>
);

export default ChatComponent;

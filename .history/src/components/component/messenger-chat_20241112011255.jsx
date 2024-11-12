import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const FbMessengerComplete = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();
  const user = { id: '670447d138c6cbf0d6bc255e' }; // Simula un usuario para pruebas

  // Fetch chats from the API
  useEffect(() => {
    async function fetchChats() {
      const response = await fetch(`http://localhost:3001/chats?userId=${user.id}`);
      const data = await response.json();
      setChats(data);
    }

    fetchChats();
  }, []);

  // Handle sending messages
  const handleSend = () => {
    if (message) {
      // Aquí enviarías el mensaje a la API, solo se muestra el cambio de estado para la demostración.
      setMessage('');
    }
  };

  // Handle selecting an active chat
  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setShowSidebar(true);
  };

  return (
    <div className="flex">
      {/* Barra lateral de chats */}
      <div className="w-[300px] bg-[#ECE3D4] p-4 border-r border-[#E1DDBF]">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        <div className="space-y-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between p-3 bg-[#D8C7A9] rounded-lg cursor-pointer hover:bg-[#BFB1A5] transition-colors"
              onClick={() => handleSelectChat(chat)}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-[#042637] text-white p-2 rounded-full">
                  {chat.name.charAt(0).toUpperCase()} {/* Muestra la inicial del nombre */}
                </div>
                <div>
                  <p className="font-semibold text-[#042637]">{chat.name}</p>
                  <p className="text-sm text-[#042637]">{chat.lastMessage || 'No hay mensajes aún'}</p>
                </div>
              </div>
              <span className="text-sm text-[#042637]">{new Date(chat.time).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vista de chat activo */}
      <div className="flex-1 p-4 bg-white">
        {activeChat ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{activeChat.name}</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-[#042637] hover:text-[#042637]/70"
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Aquí mostrarías los mensajes del chat */}
              {activeChat.messages?.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs p-2 rounded-lg text-sm ${
                      msg.senderId === user.id ? 'bg-[#D8C7A9]' : 'bg-[#ECE3D4]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-[#ECE3D4] border-t border-[#E1DDBF]">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 pl-10 bg-[#D8C7A9] rounded-full text-[#042637] placeholder-[#042637]/50 focus:outline-none"
                  placeholder="Escribe un mensaje..."
                />
                <button
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#042637] hover:text-[#042637]/70"
                >
                  Enviar
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-[#042637]">Selecciona un chat para comenzar.</div>
        )}
      </div>

      {/* Barra lateral de información */}
      <div
        className={`w-[320px] p-4 bg-[#D8C7A9] ${showSidebar ? 'block' : 'hidden'} border-l border-[#E1DDBF]`}
      >
        <div className="flex flex-col space-y-4">
          <div className="text-[#042637]">
            <h2 className="font-semibold">Información</h2>
            <p className="text-sm">Aquí puedes agregar detalles o información relevante del chat o usuario.</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {/* Agregar más detalles aquí si lo deseas */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FbMessengerComplete;

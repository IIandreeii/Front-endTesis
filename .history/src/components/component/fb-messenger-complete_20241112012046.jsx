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
      try {
        const response = await fetch(`http://localhost:3001/chats?userId=${user.id}`);

        if (!response.ok) {
          console.error('Error al obtener los chats:', response.statusText);
          return;
        }

        const data = await response.json();

        // Mostrar los datos por consola
        console.log("Datos de la API:", data); // Esto mostrará lo que recibes de la API en la consola

        setChats(data);
      } catch (error) {
        console.error('Error en la solicitud de chats:', error);
      }
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
    console.log("Chat seleccionado:", chat); // Muestra el chat seleccionado
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
                  <p className="text-sm text-[#042637]">{chat.lastMessage}</p>
                </div>
              </div>
              <span className="text-sm text-[#042637]">{new Date(chat.time).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Área de chat activo */}
      {showSidebar && activeChat && (
        <div className="flex-1 p-4 bg-white">
          <h2 className="text-xl font-semibold">{activeChat.name}</h2>
          <div className="mt-4">
            <p>{activeChat.lastMessage}</p>
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="w-full p-2 border rounded-lg mt-4"
          />
          <button onClick={handleSend} className="bg-[#042637] text-white p-2 rounded-lg mt-2">Enviar</button>
        </div>
      )}
    </div>
  );
};

export default FbMessengerComplete;

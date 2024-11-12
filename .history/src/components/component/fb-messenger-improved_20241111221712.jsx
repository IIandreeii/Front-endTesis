'use client'

import React, { useState } from 'react'
import { Search, MoreHorizontal, Edit, Settings, Phone, Video, ThumbsUp, Smile, Paperclip, Image, Send, ArrowLeft } from 'lucide-react'

interface ChatPreview {
  id: number
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  isActive: boolean
}

const chatPreviews: ChatPreview[] = [
  { id: 1, name: "Ana García", avatar: "/placeholder.svg?height=50&width=50", lastMessage: "¿Nos vemos mañana?", time: "10:30", unread: 2, isActive: true },
  { id: 2, name: "Carlos López", avatar: "/placeholder.svg?height=50&width=50", lastMessage: "Gracias por la información", time: "Ayer", unread: 0, isActive: false },
  { id: 3, name: "María Rodríguez", avatar: "/placeholder.svg?height=50&width=50", lastMessage: "¡Feliz cumpleaños!", time: "Lun", unread: 1, isActive: true },
  { id: 4, name: "Javier Martínez", avatar: "/placeholder.svg?height=50&width=50", lastMessage: "¿Cómo va el proyecto?", time: "Dom", unread: 0, isActive: false },
  { id: 5, name: "Laura Sánchez", avatar: "/placeholder.svg?height=50&width=50", lastMessage: "Nos vemos en la reunión", time: "Vie", unread: 0, isActive: true },
]

export function FbMessengerImproved() {
  const [activeChat, setActiveChat] = useState(chatPreviews[0])
  const [message, setMessage] = useState('')
  const [showChatList, setShowChatList] = useState(true)

  const toggleChatList = () => {
    setShowChatList(!showChatList)
  }

  return (
    <div className="flex h-screen bg-[#ECE3D4]">
      {/* Lista de chats */}
      <div className={`w-full md:w-[320px] lg:w-[360px] border-r border-[#D8C7A9] flex flex-col ${showChatList ? 'block' : 'hidden md:block'}`}>
        <div className="p-4 bg-[#D8C7A9]">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-[#042637]">Chats</h1>
            <div className="flex space-x-2">
              <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
                <MoreHorizontal size={20} />
                <span className="sr-only">Más opciones</span>
              </button>
              <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
                <Edit size={20} />
                <span className="sr-only">Nuevo mensaje</span>
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar en Messenger"
              className="w-full p-2 pl-8 bg-[#E1DDBF] rounded-full text-[#042637] placeholder-[#042637]/50 focus:outline-none"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#042637]/50" size={18} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatPreviews.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-3 cursor-pointer transition-colors ${
                activeChat.id === chat.id ? 'bg-[#D8C7A9]' : 'hover:bg-[#E1DDBF]'
              }`}
              onClick={() => {
                setActiveChat(chat)
                if (window.innerWidth < 768) {
                  setShowChatList(false)
                }
              }}
            >
              <div className="relative mr-3">
                <img src={chat.avatar} alt="" className="w-12 h-12 rounded-full" />
                {chat.isActive && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#ECE3D4]"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h2 className="font-semibold text-[#042637] truncate">{chat.name}</h2>
                  <span className="text-xs text-[#042637]/70 ml-2 flex-shrink-0">{chat.time}</span>
                </div>
                <p className="text-sm text-[#042637]/70 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="bg-[#042637] text-[#ECE3D4] rounded-full w-5 h-5 flex items-center justify-center text-xs ml-2 flex-shrink-0">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ventana de chat activa */}
      <div className={`flex-1 flex flex-col ${!showChatList ? 'block' : 'hidden md:block'}`}>
        <div className="p-4 bg-[#D8C7A9] flex justify-between items-center border-b border-[#E1DDBF]">
          <div className="flex items-center">
            <button className="md:hidden mr-2 text-[#042637]" onClick={toggleChatList}>
              <ArrowLeft size={20} />
              <span className="sr-only">Volver a la lista de chats</span>
            </button>
            <img src={activeChat.avatar} alt="" className="w-10 h-10 rounded-full mr-3" />
            <div>
              <h2 className="font-semibold text-[#042637]">{activeChat.name}</h2>
              <p className="text-xs text-[#042637]/70">Activo ahora</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
              <Phone size={20} />
              <span className="sr-only">Llamada de voz</span>
            </button>
            <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
              <Video size={20} />
              <span className="sr-only">Videollamada</span>
            </button>
            <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
              <Settings size={20} />
              <span className="sr-only">Configuración</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-[#ECE3D4]">
          {/* Aquí irían los mensajes del chat */}
          <div className="text-center text-[#042637]/50 mb-4">Inicio de la conversación</div>
        </div>
        <div className="p-4 bg-[#D8C7A9] border-t border-[#E1DDBF]">
          <div className="flex items-center bg-[#E1DDBF] rounded-full">
            <button className="text-[#042637] p-2 rounded-full hover:bg-[#ECE3D4] transition-colors">
              <Smile size={20} />
              <span className="sr-only">Emojis</span>
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Aa"
              className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-[#042637]"
            />
            <div className="flex space-x-2 mr-2">
              <button className="text-[#042637] p-2 rounded-full hover:bg-[#ECE3D4] transition-colors">
                <Paperclip size={20} />
                <span className="sr-only">Adjuntar archivo</span>
              </button>
              <button className="text-[#042637] p-2 rounded-full hover:bg-[#ECE3D4] transition-colors">
                <Image size={20} />
                <span className="sr-only">Adjuntar imagen</span>
              </button>
              <button className="text-[#042637] p-2 rounded-full hover:bg-[#ECE3D4] transition-colors">
                <ThumbsUp size={20} />
                <span className="sr-only">Me gusta</span>
              </button>
            </div>
            <button
              className={`p-2 rounded-full transition-colors ${
                message.trim() ? 'bg-[#042637] text-[#ECE3D4] hover:bg-[#042637]/80' : 'text-[#042637]/50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (message.trim()) {
                  // Aquí iría la lógica para enviar el mensaje
                  setMessage('')
                }
              }}
              disabled={!message.trim()}
            >
              <Send size={20} />
              <span className="sr-only">Enviar mensaje</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, MoreHorizontal, Edit, Settings, Phone, Video, ThumbsUp, Smile, Paperclip, Image, Send, ArrowLeft, Info } from 'lucide-react'
import io from 'socket.io-client'

const socket = io('http://localhost:3001')

const FbMessengerComplete = ({ user, receiverId }) => {
  const [activeChat, setActiveChat] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [chatPreviews, setChatPreviews] = useState([])
  const [showChatList, setShowChatList] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    if (!user) return

    // Fetch initial chat previews
    const fetchChatPreviews = async () => {
      try {
        const res = await fetch(`http://localhost:3001/chats?userId=${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (!res.ok) {
          throw new Error(`Error fetching chats: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        console.log('Chat previews:', data) // Log the chat previews
        setChatPreviews(data)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchChatPreviews()
  }, [user])

  useEffect(() => {
    if (!user || !receiverId) return

    // Crear un nuevo chat si se proporciona un receiverId
    const createChat = async () => {
      try {
        const res = await fetch('http://localhost:3001/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user.id, receiverId })
        })
        if (!res.ok) {
          throw new Error(`Error creating chat: ${res.status} ${res.statusText}`)
        }
        const newChat = await res.json()
        console.log('New chat created:', newChat) // Log the new chat
        setActiveChat(newChat)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    createChat()
  }, [receiverId, user])

  useEffect(() => {
    if (!user || !activeChat) return

    // Unirse a la sala específica del usuario
    socket.emit('joinRoom', activeChat._id)

    // Fetch initial messages for the active chat
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3001/messages?receiverId=${activeChat._id}&senderId=${user.id}`)
        if (!res.ok) {
          throw new Error(`Error fetching messages: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        console.log('Messages:', data) // Log the messages
        setMessages(data)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchMessages()

    // Escuchar mensajes recibidos
    const handleReceiveMessage = (message) => {
      console.log('Received message:', message) // Log the received message
      setMessages((prevMessages) => [...prevMessages, message])
    }
    socket.on('receiveMessage', handleReceiveMessage)

    // Limpiar el evento cuando el componente se desmonta
    return () => {
      socket.emit('leaveRoom', activeChat._id)
      socket.off('receiveMessage', handleReceiveMessage)
    }
  }, [activeChat, user])

  const handleSend = () => {
    if (!activeChat) {
      console.error('No active chat selected')
      return
    }

    if (message.trim()) {
      const newMessage = {
        senderId: user.id,
        receiverId: activeChat._id,
        text: message,
      }
      console.log('Sending message:', newMessage) // Log the message being sent
      socket.emit('sendMessage', newMessage)
      setMessages([...messages, newMessage])
      setMessage('')
    }
  }

  const toggleChatList = () => {
    setShowChatList(!showChatList)
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
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
                activeChat && activeChat.id === chat.id ? 'bg-[#D8C7A9]' : 'hover:bg-[#E1DDBF]'
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
            {activeChat && <img src={activeChat.avatar} alt="" className="w-10 h-10 rounded-full mr-3" />}
            <div>
              {activeChat && <h2 className="font-semibold text-[#042637]">{activeChat.name}</h2>}
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
            <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors" onClick={toggleSidebar}>
              <Info size={20} />
              <span className="sr-only">Información del chat</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-[#ECE3D4]">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-[#D8C7A9]' : 'bg-[#E1DDBF]'}`}>
                <p className="text-[#042637]">{msg.content}</p>
                <p className="text-xs text-[#042637]/70 mt-1">{msg.timestamp}</p>
              </div>
            </div>
          ))}
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
              onClick={handleSend}
              disabled={!message.trim()}
            >
              <Send size={20} />
              <span className="sr-only">Enviar mensaje</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra lateral de información */}
      <div className={`w-64 bg-[#ECE3D4] border-l border-[#D8C7A9] ${showSidebar ? 'block' : 'hidden'}`}>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-[#042637] mb-4">Información del chat</h2>
          {activeChat && (
            <>
              <img src={activeChat.avatar} alt="" className="w-20 h-20 rounded-full mx-auto mb-4" />
              <h3 className="text-center font-semibold text-[#042637] mb-2">{activeChat.name}</h3>
              <p className="text-center text-sm text-[#042637]/70 mb-4">Activo hace 5 minutos</p>
            </>
          )}
          <div className="space-y-2">
            <button className="w-full text-left text-[#042637] hover:bg-[#D8C7A9] p-2 rounded transition-colors">
              Ver archivos compartidos
            </button>
            <button className="w-full text-left text-[#042637] hover:bg-[#D8C7A9] p-2 rounded transition-colors">
              Ver fotos compartidas
            </button>
            <button className="w-full text-left text-[#042637] hover:bg-[#D8C7A9] p-2 rounded transition-colors">
              Buscar en la conversación
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(FbMessengerComplete), { ssr: false });
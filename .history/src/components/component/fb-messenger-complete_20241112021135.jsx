'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, MoreHorizontal, ArrowLeft } from 'lucide-react'
import io from 'socket.io-client'

const socket = io('http://localhost:3001')

const FbMessengerComplete = ({ user, receiverId }) => {
  const [activeChat, setActiveChat] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [chatPreviews, setChatPreviews] = useState([])
  const [showChatList, setShowChatList] = useState(true)

  useEffect(() => {
    if (!user) return

    // Fetch initial chat previews
    const fetchChatPreviews = async () => {
      try {
        console.log('Fetching chat previews for user:', user.id)
        const res = await fetch('http://localhost:3001/chats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'userId': user.id
          },
        })
        if (!res.ok) {
          throw new Error(`Error fetching chats: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        console.log('Chat previews:', data)
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
        console.log('Creating chat with userId:', user.id, 'and receiverId:', receiverId)
        const res = await fetch('http://localhost:3001/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id, receiverId }),
        })
        if (!res.ok) {
          throw new Error(`Error creating chat: ${res.status} ${res.statusText}`)
        }
        const newChat = await res.json()
        console.log('New chat created:', newChat)
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
    console.log('Joining room for chat:', activeChat._id)
    socket.emit('joinRoom', activeChat._id)

    // Fetch initial messages for the active chat
    const fetchMessages = async () => {
      try {
        console.log('Fetching messages for chat:', activeChat._id)
        const res = await fetch(`http://localhost:3001/messages?chatId=${activeChat._id}`)
        if (!res.ok) {
          throw new Error(`Error fetching messages: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        console.log('Messages for active chat:', data)
        setMessages(data)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchMessages()

    // Escuchar mensajes recibidos
    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
      console.log('Received message:', message)
    }
    socket.on('receiveMessage', handleReceiveMessage)

    // Limpiar el evento cuando el componente se desmonta
    return () => {
      console.log('Leaving room for chat:', activeChat._id)
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
      socket.emit('sendMessage', newMessage)
      setMessages([...messages, newMessage])
      console.log('Sent message:', newMessage)
      setMessage('')
    }
  }

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
          {chatPreviews.length === 0 ? (
            <p className="text-center text-[#042637]">No chats available.</p>
          ) : (
            chatPreviews.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center p-3 cursor-pointer transition-colors ${activeChat && activeChat.id === chat.id ? 'bg-[#D8C7A9]' : 'hover:bg-[#E1DDBF]'}`}
                onClick={() => {
                  setActiveChat(chat)
                  if (window.innerWidth < 768) {
                    setShowChatList(false)
                  }
                  console.log('Selected chat:', chat)
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
            ))
          )}
        </div>
      </div>

      {/* Ventana de chat activa */}
      <div className={`flex-1 flex flex-col ${!showChatList ? 'block' : 'hidden md:block'}`}>
        <div className="p-4 bg-[#D8C7A9] flex justify-between items-center border-b border-[#E1DDBF]">
          <div className="flex items-center">
            <button className="md:hidden mr-2 text-[#042637]" onClick={toggleChatList}>
              <ArrowLeft size={20} />
            </button>
            {activeChat && <img src={activeChat.avatar} alt="" className="w-10 h-10 rounded-full mr-3" />}
            <div>
              {activeChat && <h2 className="font-semibold text-[#042637]">{activeChat.name}</h2>}
              <p className="text-xs text-[#042637]/70">Activo ahora</p>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-center max-w-xs ${msg.senderId === user.id ? 'bg-[#042637]' : 'bg-[#E1DDBF]'} p-3 rounded-lg text-white`}>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Caja de mensaje */}
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
  )
}

export default dynamic(() => Promise.resolve(FbMessengerComplete), { ssr: false });
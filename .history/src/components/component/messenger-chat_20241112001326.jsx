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

  // Fetch chat previews for the user
  useEffect(() => {
    if (!user) return

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
        setChatPreviews(data)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchChatPreviews()
  }, [user])

  // Handle chat creation if a receiverId is provided
  useEffect(() => {
    if (!user || !receiverId || activeChat) return

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
        setActiveChat(newChat)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    createChat()
  }, [receiverId, user, activeChat]) // Dependencia activa en activeChat para evitar múltiples creaciones

  // Fetch messages and handle socket connection for active chat
  useEffect(() => {
    if (!user || !activeChat) return

    socket.emit('joinRoom', activeChat._id)

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3001/messages?receiverId=${activeChat._id}&senderId=${user.id}`)
        if (!res.ok) {
          throw new Error(`Error fetching messages: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        setMessages(data)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchMessages()

    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
    }
    socket.on('receiveMessage', handleReceiveMessage)

    // Cleanup function to leave the room when the component is unmounted or activeChat changes
    return () => {
      socket.emit('leaveRoom', activeChat._id)
      socket.off('receiveMessage', handleReceiveMessage)
    }
  }, [activeChat, user]) // Dependencia en activeChat y user

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        senderId: user.id,
        receiverId: activeChat._id,
        text: message,
      }
      socket.emit('sendMessage', newMessage)
      setMessages((prevMessages) => [...prevMessages, newMessage]) // Mejor uso de setState
      setMessage('')
    }
  }

  const toggleChatList = () => {
    setShowChatList(!showChatList)
  }

  return (
    <div className="flex h-screen bg-[#ECE3D4]">
      {/* Chat List */}
      <div className={`w-full md:w-[320px] lg:w-[360px] border-r border-[#D8C7A9] flex flex-col ${showChatList ? 'block' : 'hidden md:block'}`}>
        <div className="p-4 bg-[#D8C7A9]">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-[#042637]">Chats</h1>
            <div className="flex space-x-2">
              <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
                <MoreHorizontal size={20} />
              </button>
              <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
                <Edit size={20} />
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
              className={`flex items-center p-3 cursor-pointer transition-colors ${activeChat && activeChat.id === chat.id ? 'bg-[#D8C7A9]' : 'hover:bg-[#E1DDBF]'}`}
              onClick={() => {
                setActiveChat(chat)
                if (window.innerWidth < 768) {
                  setShowChatList(false)
                }
              }}
            >
              <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full mr-3" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#042637]">{chat.name}</span>
                  <span className="text-sm text-[#042637]/50">{chat.time}</span>
                </div>
                <span className="text-sm text-[#042637]/50">{chat.lastMessage}</span>
              </div>
              {chat.unread > 0 && <span className="text-xs bg-[#B87F57] text-white rounded-full py-1 px-2">{chat.unread}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between bg-[#D8C7A9] p-4">
          <div className="flex items-center space-x-4">
            <button onClick={toggleChatList} className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors md:hidden">
              <ArrowLeft size={20} />
            </button>
            <img src={activeChat?.avatar} alt={activeChat?.name} className="w-12 h-12 rounded-full" />
            <span className="font-bold text-[#042637]">{activeChat?.name}</span>
          </div>
          <div className="flex space-x-2">
            <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
              <Phone size={20} />
            </button>
            <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
              <Video size={20} />
            </button>
            <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-xs p-3 rounded-xl ${msg.senderId === user.id ? 'bg-[#B87F57]' : 'bg-[#042637]'} text-white`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#D8C7A9] p-4 flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 p-2 bg-[#E1DDBF] rounded-full text-[#042637] placeholder-[#042637]/50 focus:outline-none"
          />
          <button onClick={handleSend} className="ml-3 text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`w-[300px] bg-[#D8C7A9] p-4 ${showSidebar ? 'block' : 'hidden'}`}>
        <div className="flex items-center mb-4">
          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full mr-3" />
          <div>
            <h3 className="font-bold text-[#042637]">{user.name}</h3>
            <span className="text-[#042637]/50 text-sm">{user.status}</span>
          </div>
        </div>

        <div className="flex justify-between mb-4">
          <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
            <ThumbsUp size={20} />
          </button>
          <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
            <Smile size={20} />
          </button>
          <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
            <Paperclip size={20} />
          </button>
          <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
            <Image size={20} />
          </button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <button className="text-[#042637] hover:bg-[#E1DDBF] p-2 rounded-full transition-colors">
            <Info size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(FbMessengerComplete), { ssr: false })

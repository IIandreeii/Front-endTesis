'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import io from 'socket.io-client'

const socket = io('http://localhost:3001')

const SimpleMessenger = ({ user }) => {
  const [activeChat, setActiveChat] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [chatPreviews, setChatPreviews] = useState([])

  useEffect(() => {
    if (!user) return

    const fetchChatPreviews = async () => {
      try {
        const res = await fetch(`http://localhost:3001/chats?userId=${user.id}`)
        const data = await res.json()
        setChatPreviews(data)
      } catch (error) {
        console.error('Error fetching chats:', error)
      }
    }
    fetchChatPreviews()
  }, [user])

  useEffect(() => {
    if (!user || !activeChat) return

    socket.emit('joinRoom', activeChat._id)

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:3001/messages?chatId=${activeChat._id}`)
        const data = await res.json()
        setMessages(data)
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }
    fetchMessages()

    socket.on('receiveMessage', (msg) => setMessages((prev) => [...prev, msg]))

    return () => {
      socket.emit('leaveRoom', activeChat._id)
      socket.off('receiveMessage')
    }
  }, [activeChat, user])

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        senderId: user.id,
        text: message,
        chatId: activeChat._id,
      }
      socket.emit('sendMessage', newMessage)
      setMessages([...messages, newMessage])
      setMessage('')
    }
  }

  return (
    <div className="h-screen flex">
      <div className="w-1/3 bg-gray-100 p-2">
        {chatPreviews.map((chat) => (
          <div key={chat.id} onClick={() => setActiveChat(chat)} className="p-2 cursor-pointer">
            <p>{chat.name}</p>
          </div>
        ))}
      </div>
      <div className="w-2/3 flex flex-col">
        <div className="flex-1 p-2 overflow-y-auto">
          {messages.map((msg, idx) => (
            <p key={idx} className={msg.senderId === user.id ? 'text-right' : 'text-left'}>
              {msg.text}
            </p>
          ))}
        </div>
        <div className="p-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-2 border rounded"
          />
          <button onClick={handleSend} className="p-2 bg-blue-500 text-white rounded mt-2">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(SimpleMessenger), { ssr: false })

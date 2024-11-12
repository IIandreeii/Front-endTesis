'use client'

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Send } from 'lucide-react'
import io 

const MessengerChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hola, ¿cómo estás?", sender: 'other' },
    { id: 2, text: "¡Hola! Estoy bien, gracias. ¿Y tú?", sender: 'user' },
    { id: 3, text: "Muy bien también, gracias por preguntar.", sender: 'other' },
  ])
  const [newMessage, setNewMessage] = useState('')

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, text: newMessage, sender: 'user' }])
      setNewMessage('')
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-full md:max-w-md mx-auto bg-[#D8C7A9]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[70%] p-3 rounded-lg ${
              message.sender === 'user'
                ? 'ml-auto bg-[#ECE3D4]'
                : 'bg-[#E1DDBF]'
            }`}
          >
            <p className="text-[#042637]">{message.text}</p>
          </div>
        ))}
      </div>
      <div className="p-4 bg-[#D8C7A9]">
        <div className="flex items-center bg-white rounded-full shadow-md">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 p-2 bg-transparent outline-none text-[#042637]"
          />
          <button
            onClick={handleSend}
            className="p-2 text-[#042637] hover:text-[#E1DDBF] transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

MessengerChat.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      sender: PropTypes.oneOf(['user', 'other']).isRequired,
    })
  ),
  newMessage: PropTypes.string,
  handleSend: PropTypes.func,
}

export default MessengerChat
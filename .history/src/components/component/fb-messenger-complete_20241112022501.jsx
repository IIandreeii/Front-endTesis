'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ChatList = ({ user }) => {
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

  return (
    <div className="h-screen flex flex-col items-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Lista de Chats</h1>
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-4">
        {chatPreviews.length === 0 ? (
          <p className="text-center text-gray-500">No hay chats disponibles</p>
        ) : (
          chatPreviews.map((chat) => (
            <div
              key={chat.id}
              className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
            >
              <p className="font-semibold">{chat.name}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default dynamic(() => Promise.resolve(ChatList), { ssr: false })

'use client'

import { useState } from 'react'
import { Heart, Calendar, Clock, MapPin, MessageCircle, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Comment {
  id: number
  user: string
  text: string
}

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  image: string
  likes: number
  organization: {
    name: string
    avatar: string
  }
  comments: Comment[]
}

const events: Event[] = [
  {
    id: 1,
    title: "Festival de Música en el Parque",
    description: "Disfruta de una tarde llena de música en vivo con artistas locales.",
    date: "15 Jul 2023",
    time: "16:00",
    location: "Parque Central",
    image: "/placeholder.svg?height=200&width=400",
    likes: 124,
    organization: {
      name: "Asociación Cultural Armonia",
      avatar: "/placeholder.svg?height=40&width=40"
    },
    comments: [
      { id: 1, user: "María", text: "¡Suena genial! No puedo esperar." },
      { id: 2, user: "Carlos", text: "¿Alguien sabe si habrá puestos de comida?" }
    ]
  },
  {
    id: 2,
    title: "Maratón por la Caridad",
    description: "Corre por una buena causa en nuestro maratón anual de 10km.",
    date: "05 Ago 2023",
    time: "08:00",
    location: "Plaza Mayor",
    image: "/placeholder.svg?height=200&width=400",
    likes: 89,
    organization: {
      name: "Fundación Pasos Solidarios",
      avatar: "/placeholder.svg?height=40&width=40"
    },
    comments: [
      { id: 1, user: "Ana", text: "Ya estoy entrenando para este evento." },
      { id: 2, user: "Pedro", text: "¿Cuál es la cuota de inscripción?" }
    ]
  },
  {
    id: 3,
    title: "Exposición de Arte Moderno",
    description: "Explora las últimas tendencias en arte contemporáneo en nuestra galería.",
    date: "22 Jul 2023",
    time: "10:00",
    location: "Galería de Arte Municipal",
    image: "/placeholder.svg?height=200&width=400",
    likes: 56,
    organization: {
      name: "Colectivo Artístico Vanguardia",
      avatar: "/placeholder.svg?height=40&width=40"
    },
    comments: [
      { id: 1, user: "Laura", text: "¿Habrá visitas guiadas?" },
      { id: 2, user: "Miguel", text: "Me encanta el arte moderno, allí estaré." }
    ]
  }
]

export function EventViewComponent() {
  const [likedEvents, setLikedEvents] = useState<number[]>([])
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({})
  const [newComments, setNewComments] = useState<{ [key: number]: string }>({})

  const handleLike = (eventId: number) => {
    setLikedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleCommentChange = (eventId: number, text: string) => {
    setNewComments(prev => ({ ...prev, [eventId]: text }))
  }

  const handleCommentSubmit = (eventId: number) => {
    if (newComments[eventId]?.trim()) {
      const newComment = {
        id: Date.now(),
        user: "Usuario",
        text: newComments[eventId].trim()
      }
      setComments(prev => ({
        ...prev,
        [eventId]: [...(prev[eventId] || []), newComment]
      }))
      setNewComments(prev => ({ ...prev, [eventId]: '' }))
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-[#D8C7A9] to-[#ECE3D4]">
      <h1 className="text-5xl font-bold mb-12 text-center text-[#042637] drop-shadow-lg">
        Eventos de la Comunidad
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {events.map(event => (
          <div key={event.id} className="rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105" style={{ backgroundColor: '#E1DDBF' }}>
            <div className="p-4 flex items-center space-x-2 bg-[#042637]">
              <Avatar className="h-8 w-8">
                <AvatarImage src={event.organization.avatar} alt={event.organization.name} />
                <AvatarFallback>{event.organization.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-white">{event.organization.name}</span>
            </div>
            <div className="relative">
              <img src={event.image} alt={event.title} className="w-full h-56 object-cover" />
              <div className="absolute top-0 right-0 bg-[#042637] text-white px-3 py-1 m-2 rounded-full text-sm font-semibold">
                Nuevo
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-3 text-[#042637]">{event.title}</h2>
              <p className="text-sm mb-4 text-[#042637] opacity-80">{event.description}</p>
              <div className="flex items-center mb-2 text-[#042637]">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">{event.date}</span>
              </div>
              <div className="flex items-center mb-2 text-[#042637]">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">{event.time}</span>
              </div>
              <div className="flex items-center mb-4 text-[#042637]">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{event.location}</span>
              </div>
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => handleLike(event.id)}
                  className="flex items-center space-x-1 focus:outline-none transition duration-300 ease-in-out transform hover:scale-110 w-full"
                  aria-label={`Me gusta (${event.likes + (likedEvents.includes(event.id) ? 1 : 0)})`}
                >
                  <Heart 
                    className={`h-6 w-6 ${likedEvents.includes(event.id) ? 'fill-current text-red-500' : 'text-[#042637]'}`} 
                  />
                  <span className="text-[#042637] font-medium">
                    {event.likes + (likedEvents.includes(event.id) ? 1 : 0)}
                  </span>
                </button>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-[#042637]">Comentarios</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
                  {[...(event.comments || []), ...(comments[event.id] || [])].map((comment) => (
                    <div key={comment.id} className="bg-white p-2 rounded-lg">
                      <span className="font-semibold text-[#042637]">{comment.user}: </span>
                      <span className="text-[#042637]">{comment.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center mt-2">
                  <Input
                    type="text"
                    placeholder="Añade un comentario..."
                    value={newComments[event.id] || ''}
                    onChange={(e) => handleCommentChange(event.id, e.target.value)}
                    className="flex-grow mr-2"
                  />
                  <Button
                    onClick={() => handleCommentSubmit(event.id)}
                    size="icon"
                    aria-label="Enviar comentario"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
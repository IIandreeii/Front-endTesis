import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Heart, Calendar, Clock, MapPin, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EventViewComponent = ({ events }) => {
  const [likedEvents, setLikedEvents] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});

  const handleLike = (eventId) => {
    setLikedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleCommentChange = (eventId, text) => {
    setNewComments(prev => ({ ...prev, [eventId]: text }));
  };

  const handleCommentSubmit = (eventId) => {
    if (newComments[eventId]?.trim()) {
      const newComment = {
        id: Date.now(),
        user: "Usuario",
        text: newComments[eventId].trim()
      };
      setComments(prev => ({
        ...prev,
        [eventId]: [...(prev[eventId] || []), newComment]
      }));
      setNewComments(prev => ({ ...prev, [eventId]: '' }));
    }
  };

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
  );
};

EventViewComponent.propTypes = {
  events: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    organization: PropTypes.shape({
      avatar: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    comments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      user: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
};

export default EventViewComponent;
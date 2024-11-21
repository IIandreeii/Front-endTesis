"use client";

import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, Clock, MapPin, Send, Edit, Trash, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventForm from '@/components/component/event-form'; // Importación correcta

const socket = io('http://localhost:3001');

const EventViewComponent = () => {
    const [publications, setPublications] = useState([]);
    const [likedEvents, setLikedEvents] = useState([]);
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [editingPublication, setEditingPublication] = useState(null);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const commentsEndRef = useRef(null);

    const isAuthenticated = () => {
        return localStorage.getItem('authToken');
    };

    const getUserFromToken = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return null;
        try {
            const res = await fetch(`http://localhost:3001/profile?secret_token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!res.ok) {
                throw new Error(`Error fetching profile: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            setUser(data.user || data.charity);
            return data.user || data.charity; // Asegúrate de que la respuesta tiene los campos del usuario o de la organización
        } catch (error) {
            console.error('Error obteniendo el usuario:', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchUserAndPublications = async () => {
            const user = await getUserFromToken();
            if (user) {
                setUser(user);
                console.log('Usuario obtenido:', user);
            }

            try {
                const res = await fetch('http://localhost:3001');
                const data = await res.json();
                setPublications(data);
                console.log('Publicaciones obtenidas:', data);

                // Cargar comentarios para cada publicación
                data.forEach(async (publication) => {
                    const commentsRes = await fetch(`http://localhost:3001/comments/${publication._id}`);
                    const commentsData = await commentsRes.json();
                    setComments(prev => ({ ...prev, [publication._id]: commentsData }));
                });
            } catch (error) {
                console.error('Error fetching publications:', error);
            }
        };

        fetchUserAndPublications();

        socket.on('newPublication', (publication) => {
            setPublications((prevPublications) => [publication, ...prevPublications]);
        });

        socket.on('updatePublication', (updatedPublication) => {
            setPublications((prevPublications) =>
                prevPublications.map((publication) =>
                    publication._id === updatedPublication._id ? { ...publication, ...updatedPublication, charity: publication.charity } : publication
                )
            );
        });

        socket.on('deletePublication', (publicationId) => {
            setPublications((prevPublications) =>
                prevPublications.filter((publication) => publication._id !== publicationId)
            );
        });

        socket.on('newComment', (newComment) => {
            setComments((prevComments) => ({
                ...prevComments,
                [newComment.publication]: [...(prevComments[newComment.publication] || []), newComment]
            }));
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        return () => {
            socket.off('newPublication');
            socket.off('updatePublication');
            socket.off('deletePublication');
            socket.off('newComment');
        };
    }, []);

    const handleLike = async (eventId) => {
        if (!isAuthenticated()) {
            router.push('/logind'); // Redirige al login si no está autenticado
            return;
        }

        const user = await getUserFromToken();
        if (!user) return;

        socket.emit('likePublication', { publicationId: eventId, userId: user._id, charityId: user.charityId });
    };

    const handleCommentChange = (eventId, text) => {
        setNewComments(prev => ({ ...prev, [eventId]: text }));
    };

    const handleCommentSubmit = async (eventId) => {
        if (!isAuthenticated()) {
            router.push('/logind'); // Redirige al login si no está autenticado
            return;
        }

        const user = await getUserFromToken();
        if (!user) return;

        if (newComments[eventId]?.trim()) {
            const newComment = {
                userId: user.id,
                charityId: user.charity_Id,
                nombre: user.nombre,
                apellido: user.apellido,
                comment: newComments[eventId].trim(),
                publicationId: eventId
            };
            socket.emit('addComment', newComment);
            setNewComments(prev => ({ ...prev, [eventId]: '' }));
        }
    };

    const handleEditClick = (publication) => {
        setEditingPublication(publication);
    };

    const handleDeleteClick = async (publicationId) => {
        const user = await getUserFromToken();
        console.log(user);
        if (!user) return;
    
        const dataToSend = { publicationId, charityId: user.id };
        console.log('Datos enviados al backend para eliminar publicación:', dataToSend);
    
        socket.emit('deletePublication', dataToSend, (response) => {
            if (response.success) {
                console.log('Publicación eliminada con éxito');
            } else {
                console.error('Error al eliminar la publicación:', response.message);
            }
        });
    };

    const handleEditSubmit = async (formData) => {
        const user = await getUserFromToken();
        if (!user) return;

        if (editingPublication._id) {
            // Editar publicación existente
            socket.emit('editPublication', { publicationId: editingPublication._id, formData }, (response) => {
                if (response.success) {
                    setEditingPublication(null);
                    console.log('Publicación editada con éxito');
                } else {
                    console.error('Error al editar la publicación:', response.message);
                }
            });
        } else {
            // Crear nueva publicación
            socket.emit('createPublication', { formData, charityId: user.id }, (response) => {
                if (response.success) {
                    setEditingPublication(null);
                    console.log('Publicación creada con éxito');
                } else {
                    console.error('Error al crear la publicación:', response.message);
                }
            });
        }
    };

    const handleCreateClick = () => {
        setEditingPublication({});
    };

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    return (
        <div className="min-h-full p-4 bg-gradient-to-br from-[#D8C7A9] to-[#ECE3D4]">
            <h1 className="text-5xl font-bold mb-12 text-center text-[#042637] drop-shadow-lg">
                Eventos de la Comunidad
            </h1>
            <div className="flex justify-end mb-4">
                <Button onClick={handleCreateClick} className="bg-[#D8C7A9] hover:bg-[#042637]/90 text-white flex items-center">
                    <Plus className="mr-2" />
                    Crear Publicación
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {publications.map(event => (
                    <div key={event._id} className="rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105" style={{ backgroundColor: '#E1DDBF' }}>
                        <div className="p-4 flex items-center space-x-2 bg-[#042637]">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={event.charity?.avatar || 'https://via.placeholder.com/150'} alt={event.charity?.nombre || 'Organización'} />
                                <AvatarFallback>{event.charity?.nombre?.charAt(0) || 'O'}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-[#D8C7A9]">{event.charity?.nombre || 'Organización'}</span>
                        </div>
                        <div className="relative">
                            <img src={`http://localhost:3001${event.imageUrl}`} alt={event.title} className="w-full h-56 object-cover" />
                            <div className="absolute top-0 right-0 bg-[#D8C7A9] text-white px-3 py-1 m-2 rounded-full text-sm font-semibold">
                                Nuevo
                            </div>
                        </div>
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold mb-3 text-[#042637]">{event.title}</h2>
                            <p className="text-sm mb-4 text-[#042637] opacity-80">{event.description}</p>
                            <div className="flex items-center mb-2 text-[#042637]">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center mb-2 text-[#042637]">
                                <Clock className="h-4 w-4 mr-2" />
                                <span className="text-sm">{new Date(event.date).toLocaleTimeString()}</span>
                            </div>
                            <div className="flex items-center mb-4 text-[#042637]">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="text-sm">{event.location}</span>
                            </div>
                            <div className="flex items-center mb-4">
                                <button
                                    onClick={() => handleLike(event._id)}
                                    className="flex items-center space-x-1 focus:outline-none transition duration-300 ease-in-out transform hover:scale-110 w-full"
                                    aria-label={`Me gusta (${event.likes ? event.likes.length : 0})`}
                                >
                                    <Heart
                                        className={`h-6 w-6 ${likedEvents.includes(event._id) ? 'fill-current text-red-500' : 'text-[#042637]'}`}
                                    />
                                    <span className="text-[#042637] font-medium">
                                        {event.likes ? event.likes.length : 0}
                                    </span>
                                </button>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2 text-[#042637]">Comentarios</h3>
                                <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
                                    {(comments[event._id] || []).map((comment) => (
                                        <div key={comment._id} className="bg-white p-2 rounded-lg">
                                            <span className="font-semibold text-[#042637]">{comment.user?.nombre || comment.charity?.nombre}: </span>
                                            <span className="text-[#042637]">{comment.comment}</span>
                                        </div>
                                    ))}
                                    <div ref={commentsEndRef} />
                                </div>
                                <div className="flex items-center mt-2">
                                    <Input
                                        type="text"
                                        placeholder="Añade un comentario..."
                                        value={newComments[event._id] || ''}
                                        onChange={(e) => handleCommentChange(event._id, e.target.value)}
                                        className="flex-grow mr-2"
                                    />
                                    <Button
                                        onClick={() => handleCommentSubmit(event._id)}
                                        size="icon"
                                        aria-label="Enviar comentario"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            {user && user.userType === 'charity' && event.charity._id === user.id && (
                                <div className="flex items-center mt-4 space-x-2">
                                    <Button onClick={() => handleEditClick(event)} size="icon" aria-label="Editar publicación">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={() => handleDeleteClick(event._id)} size="icon" aria-label="Eliminar publicación">
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {editingPublication && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <EventForm initialData={editingPublication} onSubmit={handleEditSubmit} onCancel={() => setEditingPublication(null)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventViewComponent;
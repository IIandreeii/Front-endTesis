// FILE: Organizaciones.js
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DonationForm from './donationsform';

export default function Organizaciones() {
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const res = await fetch('http://localhost:3001/charities', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          throw new Error(`Error fetching charities: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        if (data) {
          setCharities(data);
        } else {
          setCharities([]);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Error fetching charities');
      }
    };

    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const res = await fetch(`http://localhost:3001/profile?secret_token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          throw new Error(`Error fetching profile: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console
        if (data.user) {
          setUser(data.user);
          setIsLoggedIn(true);
        } else if (data.charity) {
          setUser(data.charity);
          setIsLoggedIn(true);
        } else {
          throw new Error('Error fetching profile');
        }

      } catch (error) {
        console.error('Error:', error);
        setError('Por favor, para esta parte necesita logeo.');
        router.push('/logind');
      }
    };

    fetchCharities();
    fetchProfile();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (charities.length === 0) return <p>Loading...</p>;

  const handleDonateClick = (charity) => {
    if (!isLoggedIn) {
      toast.error('Debes iniciar sesión para poder donar.');
    } else {
      setSelectedCharity(charity);
    }
  };

  const handleSendMessageClick = async (charityId) => {
    if (!isLoggedIn) {
      toast.error('Debes iniciar sesión para enviar un mensaje.');
    } else {
      try {
        const body = JSON.stringify({
          userId: user.id,
          receiverId: charityId,
          userType: user.type, // Usar userType del perfil del usuario
          receiverType: 'charity' // Asumimos que el receptor siempre es una organización
        });
        console.log('Sending request with body:', body); // Debugging line

        const res = await fetch('http://localhost:3001/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: body
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error creating or fetching chat: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const chat = await res.json();
        console.log('Chat:', chat); // Log the chat
        router.push(`/mensajes?chatId=${chat._id}`);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error creating or fetching chat');
      }
    }
  };

  const handleCancel = () => {
    setSelectedCharity(null);
  };

  return (
    <div className="container mx-auto p-4">
      {selectedCharity ? (
        <DonationForm charity={selectedCharity} user={user} onCancel={handleCancel} />
      ) : (
        <div className="flex flex-wrap gap-4 mt-10">
          {charities.map((charity) => (
            <Card key={charity._id} className="w-full max-w-md flex-shrink-0 mx-2">
              <CardHeader className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder-charity.jpg" />
                    <AvatarFallback>{charity.nombre[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-[#e1ddbf] grid gap-1">
                    <h2 className="text-2xl font-bold">{charity.nombre}</h2>
                    <p className="text-[#4c7d78] text-muted-foreground">{charity.email}</p>
                    <p className="text-[#4c7d78] text-muted-foreground">{charity.telefono}</p>
                    <p className="text-[#4c7d78] text-muted-foreground">{charity.direccion}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="bg-[#e1ddbf] p-6">
                <div className="bg-[#e1ddbf] grid gap-4">
                  <h3 className="text-lg font-semibold text-[#042637]">Descripción</h3>
                  <p className="text-[#4c7d78] text-muted-foreground">
                    {charity.descripcion || "No hay descripción disponible."}
                  </p>
                  <Separator className="my-6" />
                  <p className={`text-sm ${charity.accessToken ? 'text-green-500' : 'text-red-500'}`}>
                    {charity.accessToken ? 'Se puede donar a esta organización.' : 'No se puede donar a esta organización.'}
                  </p>
                  <Button
                    className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    disabled={!charity.accessToken}
                    onClick={() => handleDonateClick(charity)}
                  >
                    Donar
                  </Button>
                  <Button
                    className="mt-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                    onClick={() => handleSendMessageClick(charity._id)}
                  >
                    Enviar mensaje
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
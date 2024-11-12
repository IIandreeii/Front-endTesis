"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import UpdateCharity from './UpdateCharity';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('PAGINA PROTEGIDA TIENES QUE INICIAR SESION');
        return;
      }

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

        if (data.user) {
          setProfile({ type: 'user', data: data.user });
        } else if (data.charity) {
          setProfile({ type: 'charity', data: data.charity });
        } else {
          throw new Error('Error fetching profile');
        }

      } catch (error) {
        console.error('Error:', error);
        setError('Error fetching profile');
      }
    };

    fetchProfile();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!profile) return <p>Loading...</p>;

  const { type, data } = profile;

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleMercadoPagoAuth = () => {
    router.push(`http://localhost:3001/mercadopago/auth/${data.id}`);
  };

  const handleViewDonations = () => {
    router.push(`/nations?charityId=${data.id}`);
  };

  if (isEditing) {
    return <UpdateCharity charityData={data} onUpdateSuccess={handleCancelEdit} onCancel={handleCancelEdit} />;
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full max-w-md">
          <CardHeader className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="text-[#e1ddbf] grid gap-1">
                <h2 className="text-2xl font-bold">{data.nombre} {data.apellido}</h2>
                <p className="text-[#4c7d78] text-muted-foreground">{data.id} </p>
                <p className="text-[#4c7d78] text-muted-foreground">{data.dni}</p>
                <p className="text-[#4c7d78] text-muted-foreground">{data.email}</p>
                <p className="text-[#4c7d78] text-muted-foreground">{data.role}</p>
                <p className="text-[#4c7d78] text-muted-foreground">{data.telefono}</p>
                <p className="text-[#4c7d78] text-muted-foreground">{data.direccion}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-[#e1ddbf] p-6">
            <div className="bg-[#e1ddbf] grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#042637]">About</h3>
                <Button variant="ghost" size="sm" onClick={handleEditClick}>
                  <FilePenIcon className="w-4 h-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </div>
              <p className="text-[#4c7d78] text-muted-foreground">
                {data.descripcion ? data.descripcion : 
                "Coordinador de donaciones que ayuda a conectar a las personas con organizaciones benéficas. Él tiene una pasión por tener un impacto positivo en la comunidad y disfruta facilitando donaciones a organizaciones que proporcionan servicios vitales a quienes los necesitan."}
              </p>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#042637]">Supported Causes</h3>
                <Button variant="ghost" size="sm" onClick={handleEditClick}>
                  <FilePenIcon className="w-4 h-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Poverty Alleviation</Badge>
                <Badge>Education</Badge>
                <Badge>Healthcare</Badge>
                <Badge>Environmental Conservation</Badge>
                <Badge>Animal Welfare</Badge>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#042637]">Donate Now</h3>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="text-[#4c7d78]">Donate to Charity</Button>
                <p className="text-[#4c7d78] text-muted-foreground text-sm">
                  Your donation will make a difference in the lives of those in need.
                </p>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#042637]">Ver Donaciones</h3>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="text-[#4c7d78]" onClick={handleViewDonations}>Ver Donaciones</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {type === 'charity' && (
          <div className="bg-[#e1ddbf] p-2 border rounded-lg shadow-lg inline-block text-center max-w-xs">
            <h3 className="text-lg font-semibold text-[#042637]">Importante</h3>
            {data.accessToken ? (
              <p className="text-[#4c7d78] text-muted-foreground mt-1">
                Cuenta verificada para donaciones.
              </p>
            ) : (
              <>
                <p className="text-[#4c7d78] text-muted-foreground mt-1">
                  Por favor, para poder recibir donaciones desde nuestra plataforma tienen que crear una cuenta en Mercado Pago, es gratis y aceptar el acceso que se les pedirá a través de este botón.
                </p>
                <Button className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" onClick={handleMercadoPagoAuth}>
                  Autorizar Mercado Pago
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilePenIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
    </svg>
  );
}
// Profile.js

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatList from './ChatList';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
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

  const { data } = profile;

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <h1 className="text-2xl font-bold mb-4">Perfil del Usuario</h1>
      {/* Renderizar la información del usuario */}
      <div>
        <p>ID: {data.id}</p>
        <p>Nombre: {data.nombre}</p>
        <p>Email: {data.email}</p>
      </div

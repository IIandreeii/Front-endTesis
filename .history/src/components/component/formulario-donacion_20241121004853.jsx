'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/router';

export default function FormularioDonacion({ initialData, onSave }) {
  const [donorName, setDonorName] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
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

        if (data.charity) {
          setIsOrganization(true);
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const donationData = {
      donorName,
      donationAmount,
      donationMessage
    };

    try {
      const res = await fetch('http://localhost:3001/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(donationData)
      });

      if (!res.ok) {
        throw new Error(`Error al enviar la donación: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      alert(data.message);
      if (data.success) {
        onSave(); // Cerrar el formulario
      }
    } catch (error) {
      alert(`Error al enviar la donación: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated || !isOrganization) {
    return <div>No tienes permiso para realizar donaciones.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE3D4]">
      <form className="w-full max-w-md bg-[#ECE3D4] p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-[#042637] text-center">Formulario de Donación</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre" className="text-[#042637]">Nombre del Donante</Label>
            <Input
              id="nombre"
              className="border-[#042637] text-[#042637]"
              required
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cantidad" className="text-[#042637]">Cantidad de la Donación</Label>
            <Input
              id="cantidad"
              type="number"
              className="border-[#042637] text-[#042637]"
              required
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="mensaje" className="text-[#042637]">Mensaje</Label>
            <Textarea
              id="mensaje"
              className="border-[#042637] text-[#042637]"
              value={donationMessage}
              onChange={(e) => setDonationMessage(e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <Button type="submit" className="bg-[#042637] hover:bg-[#042637]/90 text-white">
              Enviar Donación
            </Button>
            <Button type="button" onClick={onSave} className="bg-red-500 hover:bg-red-600 text-white">
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
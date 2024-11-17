'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function PostComponent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizationName: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos del formulario
    console.log('Datos del formulario:', {
      ...formData,
      image: formData.image ? formData.image.name : null
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-[#D8C7A9] to-[#ECE3D4]">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-[#042637] drop-shadow-lg">
          Crear Nuevo Evento
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-[#E1DDBF] p-6 rounded-xl shadow-lg">
          <div>
            <Label htmlFor="title" className="text-[#042637]">Título del Evento</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-[#042637]">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-[#042637]">Fecha</Label>
              <div className="relative">
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#042637]" size={20} />
              </div>
            </div>
            <div>
              <Label htmlFor="time" className="text-[#042637]">Hora</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location" className="text-[#042637]">Ubicación</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="image" className="text-[#042637]">Imagen del Evento</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setFormData(prev => ({ ...prev, image: file }));
              }}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="organizationName" className="text-[#042637]">Nombre de la Organización</Label>
            <Input
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full bg-[#042637] hover:bg-[#042637]/90 text-white">
            Crear Evento
          </Button>
        </form>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function DonationForm({ charity, onCancel, user }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (user && user.nombre) {
      setName(user.nombre);
      
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const donationData = {
      amount: parseFloat(amount),
      donorName: name
    };

    try {
      const response = await fetch(` https://helped-suitable-elk.ngrok-free.app /mercadopago/donate/${charity._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(donationData)
      });

      if (!response.ok) {
        throw new Error(`Error en la donación: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      const initPointUrl = result.init_point;
      if (initPointUrl && initPointUrl.startsWith('https://www.mercadopago.com.pe/checkout/v1/redirect')) {
        window.open(initPointUrl, '_blank');
      } else {
        alert('No se pudo obtener la URL de pago válida. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error en la donación:', error);
      alert('Hubo un error al realizar la donación. Por favor, inténtalo de nuevo.');
    }

    onCancel(); // Llama a la función onCancel para cerrar el formulario
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <h2 className="text-2xl font-bold mb-4">Donar a {charity.nombre}</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Nombre completo del donante
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
            Cantidad (S/.)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex justify-between">
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Donar
          </Button>
          <Button type="button" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
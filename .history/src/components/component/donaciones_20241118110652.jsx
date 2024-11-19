'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Asegúrate de tener un componente Button

// Función para formatear fechas
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para formatear montos
const formatAmount = (amount, currency) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency }).format(amount);
};

export default function TablaDonaciones() {
  const [donaciones, setDonaciones] = useState([]);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const charityId = searchParams.get('charityId');

  useEffect(() => {
    const fetchDonaciones = async () => {
      try {
        const res = await fetch(`http://localhost:3001/mercadopago/donations/${charityId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          throw new Error(`Error fetching donations: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setDonaciones(data);
      } catch (error) {
        console.error('Error:', error);
        setError('Error fetching donations');
      }
    };

    if (charityId) {
      fetchDonaciones();
    }
  }, [charityId]);

  const handleGenerateReport = async (period) => {
    try {
      const res = await fetch(`http://localhost:3001/mercadopago/report/${period}/${charityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!res.ok) {
        throw new Error(`Error generating report: ${res.status} ${res.statusText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${period}_${charityId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error:', error);
      setError('Error generating report');
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (donaciones.length === 0) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECE3D4] to-[#E1DDBF] p-8">
      <Card className="max-w-6xl mx-auto" style={{ backgroundColor: '#D8C7A9' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold  bg-[#042637]">Registro de Donaciones</CardTitle>
          <CardDescription className=" bg-[#042637]/70">
            Tabla con todas las donaciones recibidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end space-x-2">
            <Button onClick={() => handleGenerateReport('weekly')}>Reporte Semanal</Button>
            <Button onClick={() => handleGenerateReport('monthly')}>Reporte Mensual</Button>
            <Button onClick={() => handleGenerateReport('annual')}>Reporte Anual</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#042637]">Donante</TableHead>
                  <TableHead className="text-[#042637]">Monto</TableHead>
                  <TableHead className="text-[#042637]">Estado</TableHead>
                  <TableHead className="text-[#042637]">Método de Pago</TableHead>
                  <TableHead className="text-[#042637]">Fecha de Pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donaciones.map((donacion, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-[#042637]">{donacion.donorName}</TableCell>
                    <TableCell className="text-[#042637]">{formatAmount(donacion.amount, donacion.currency)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${donacion.paymentStatus === 'approved' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                          ${donacion.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                        `}
                      >
                        {donacion.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#042637]">{donacion.paymentMethod}</TableCell>
                    <TableCell className="text-[#042637]">{formatDate(donacion.paymentDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
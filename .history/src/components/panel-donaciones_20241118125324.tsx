'use client'

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Donacion = {
  id: number
  nombreDonante: string
  tipoProducto: string
  cantidad: number
  unidad: 'unidad' | 'kg'
  valorPorUnidad: number
}

export function PanelDonacionesComponent() {
  const [donaciones] = useState<Donacion[]>([
    { id: 1, nombreDonante: "Juan Pérez", tipoProducto: "Arroz", cantidad: 50, unidad: "kg", valorPorUnidad: 2.5 },
    { id: 2, nombreDonante: "María García", tipoProducto: "Frijoles", cantidad: 30, unidad: "kg", valorPorUnidad: 3 },
    { id: 3, nombreDonante: "Carlos Rodríguez", tipoProducto: "Aceite", cantidad: 20, unidad: "unidad", valorPorUnidad: 5 },
    { id: 4, nombreDonante: "Ana Martínez", tipoProducto: "Leche", cantidad: 40, unidad: "unidad", valorPorUnidad: 1.8 },
    { id: 5, nombreDonante: "Juan Pérez", tipoProducto: "Pasta", cantidad: 25, unidad: "kg", valorPorUnidad: 1.5 },
  ])

  const totalDonaciones = donaciones.reduce((acc, donacion) => acc + donacion.cantidad * donacion.valorPorUnidad, 0)
  const totalProductos = donaciones.reduce((acc, donacion) => acc + donacion.cantidad, 0)

  const mayorDonante = useMemo(() => {
    const donantesAgrupados = donaciones.reduce((acc, donacion) => {
      if (!acc[donacion.nombreDonante]) {
        acc[donacion.nombreDonante] = 0
      }
      acc[donacion.nombreDonante] += donacion.cantidad * donacion.valorPorUnidad
      return acc
    }, {} as Record<string, number>)

    return Object.entries(donantesAgrupados).reduce((a, b) => a[1] > b[1] ? a : b)
  }, [donaciones])

  return (
    <div className="min-h-screen bg-[#ECE3D4] p-8">
      <h1 className="text-3xl font-bold mb-6 text-[#042637] text-center">Panel de Donaciones</h1>
      
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <Card className="bg-[#E1DDBF] border-[#042637]">
          <CardHeader>
            <CardTitle className="text-[#042637]">Total Donaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#042637]">${totalDonaciones.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#E1DDBF] border-[#042637]">
          <CardHeader>
            <CardTitle className="text-[#042637]">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#042637]">{totalProductos}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#E1DDBF] border-[#042637]">
          <CardHeader>
            <CardTitle className="text-[#042637]">Mayor Donante</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-[#042637]">{mayorDonante[0]}</p>
            <p className="text-lg text-[#042637]">${mayorDonante[1].toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-[#E1DDBF] border-[#042637]">
        <CardHeader>
          <CardTitle className="text-[#042637]">Lista de Donaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#042637]">Donante</TableHead>
                <TableHead className="text-[#042637]">Producto</TableHead>
                <TableHead className="text-[#042637]">Cantidad</TableHead>
                <TableHead className="text-[#042637]">Unidad</TableHead>
                <TableHead className="text-[#042637]">Valor por Unidad</TableHead>
                <TableHead className="text-[#042637]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donaciones.map((donacion) => (
                <TableRow key={donacion.id}>
                  <TableCell className="text-[#042637]">{donacion.nombreDonante}</TableCell>
                  <TableCell className="text-[#042637]">{donacion.tipoProducto}</TableCell>
                  <TableCell className="text-[#042637]">{donacion.cantidad}</TableCell>
                  <TableCell className="text-[#042637]">{donacion.unidad}</TableCell>
                  <TableCell className="text-[#042637]">${donacion.valorPorUnidad.toFixed(2)}</TableCell>
                  <TableCell className="text-[#042637]">${(donacion.cantidad * donacion.valorPorUnidad).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
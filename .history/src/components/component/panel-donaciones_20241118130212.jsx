'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PanelDonacionesComponent() {
  const [donaciones, setDonaciones] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOrganization, setIsOrganization] = useState(false)
  const [charityId, setCharityId] = useState("")
  const [totalValue, setTotalValue] = useState(0)
  const router = useRouter()

  const checkAuthentication = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/logind')
      return
    }

    try {
      const res = await fetch(`http://localhost:3001/profile?secret_token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      if (!res.ok) {
        throw new Error(`Error fetching profile: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      if (data.charity && data.charity.userType === 'charity') {
        setIsAuthenticated(true)
        setIsOrganization(true)
        setCharityId(data.charity.id) // Guardar charityId en el estado
      } else {
        router.push('/logind')
      }
    } catch (error) {
      console.error('Error obteniendo el usuario:', error)
      router.push('/logind')
    }
  }

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    const fetchDonaciones = async () => {
      if (!charityId) return

      try {
        const res = await fetch(`http://localhost:3001/mercadopago/report/in-kind/${charityId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })

        if (!res.ok) {
          throw new Error(`Error fetching donations: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        setDonaciones(data.report)
        setTotalValue(data.totalValue)
      } catch (error) {
        console.error('Error fetching donations:', error)
      }
    }

    if (isAuthenticated && isOrganization) {
      fetchDonaciones()
    }
  }, [charityId, isAuthenticated, isOrganization])

  const totalProductos = donaciones.reduce((acc, donacion) => acc + donacion.quantity, 0)

  const mayorDonante = useMemo(() => {
    const donantesAgrupados = donaciones.reduce((acc, donacion) => {
      if (!acc[donacion.donorName]) {
        acc[donacion.donorName] = 0
      }
      acc[donacion.donorName] += donacion.totalValue
      return acc
    }, {})

    return Object.entries(donantesAgrupados).reduce((a, b) => a[1] > b[1] ? a : b)
  }, [donaciones])

  if (!isAuthenticated || !isOrganization) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-[#ECE3D4] p-8">
      <h1 className="text-3xl font-bold mb-6 text-[#042637] text-center">Panel de Donaciones</h1>
      
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        <Card className="bg-[#E1DDBF] border-[#042637]">
          <CardHeader>
            <CardTitle className="text-[#042637]">Total Donaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#042637]">${totalValue.toFixed(2)}</p>
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
              {donaciones.map((donacion, index) => (
                <TableRow key={index}>
                  <TableCell className="text-[#042637]">{donacion.donorName}</TableCell>
                  <TableCell className="text-[#042637]">{donacion.itemType}</TableCell>
                  <TableCell className="text-[#042637]">{donacion.quantity}</TableCell>
                  <TableCell className="text-[#042637]">{donacion.unit}</TableCell>
                  <TableCell className="text-[#042637]">${donacion.valuePerUnit.toFixed(2)}</TableCell>
                  <TableCell className="text-[#042637]">${donacion.totalValue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
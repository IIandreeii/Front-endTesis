'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormularioDonacionComponent } from "@/components/component/formulario-donacion"

export function PanelDonacionesComponent() {
  const [donaciones, setDonaciones] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOrganization, setIsOrganization] = useState(false)
  const [charityId, setCharityId] = useState("")
  const [totalValue, setTotalValue] = useState(0)
  const [editingDonation, setEditingDonation] = useState(null)
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
    if (isAuthenticated && isOrganization && charityId) {
      fetchDonaciones()
    }
  }, [isAuthenticated, isOrganization, charityId])

  const fetchDonaciones = async () => {
    try {
      const res = await fetch(`http://localhost:3001/mercadopago/report/in-kind?charityId=${charityId}`)
      if (!res.ok) {
        throw new Error(`Error al obtener las donaciones: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      setDonaciones(data.donations)
      const total = data.donations.reduce((sum, donacion) => sum + (donacion.valuePerUnit * donacion.quantity), 0)
      setTotalValue(total)
    } catch (error) {
      console.error('Error al obtener las donaciones:', error)
    }
  }

  const handleEditar = (donacion) => {
    setEditingDonation(donacion)
  }

  const handleCerrarFormulario = () => {
    setEditingDonation(null)
  }

  const handleGuardar = () => {
    setEditingDonation(null)
    fetchDonaciones()
  }

  const columns = useMemo(() => [
    { label: 'Nombre', accessor: 'donorName' },
    { label: 'Producto', accessor: 'itemType' },
    { label: 'Cantidad', accessor: 'quantity' },
    { label: 'Unidad', accessor: 'unit' },
    { label: 'Valor por Unidad', accessor: 'valuePerUnit' },
    { label: 'Total', accessor: 'total' }
  ], [])

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#ECE3D4]">
      <h1 className="text-3xl font-bold text-[#042637] mt-8">Panel de Donaciones</h1>
      <Card className="w-full max-w-4xl mt-6">
        <CardHeader>
          <CardTitle>Donaciones In-kind</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableCell key={column.accessor}>{column.label}</TableCell>
                ))}
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donaciones.map((donacion) => (
                <TableRow key={donacion.donationId}>
                  {columns.map((column) => (
                    <TableCell key={column.accessor}>{donacion[column.accessor]}</TableCell>
                  ))}
                  <TableCell>
                    <Button onClick={() => handleEditar(donacion)}>Editar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <h2>Total Donado: S/{totalValue}</h2>
          </div>
        </CardContent>
      </Card>
      {editingDonation && (
        <FormularioDonacionComponent
          initialData={editingDonation}
          onClose={handleCerrarFormulario}
          onSave={handleGuardar}
        />
      )}
    </div>
  )
}

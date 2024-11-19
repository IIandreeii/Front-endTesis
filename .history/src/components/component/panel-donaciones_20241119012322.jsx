'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FormularioDonacionComponent } from "@/components/component/formulario-donacion"
import Modal from "@/components/ui/modal" // Supuesto componente Modal

export function PanelDonacionesComponent() {
  const [donaciones, setDonaciones] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOrganization, setIsOrganization] = useState(false)
  const [charityId, setCharityId] = useState("")
  const [totalValue, setTotalValue] = useState(0)
  const [editingDonation, setEditingDonation] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  // Verifica la autenticación
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
        throw new Error('Error al obtener perfil')
      }

      const data = await res.json()
      if (data.charity && data.charity.userType === 'charity') {
        setIsAuthenticated(true)
        setIsOrganization(true)
        setCharityId(data.charity.id)
      } else {
        router.push('/logind')
      }
    } catch (error) {
      console.error(error)
      router.push('/logind')
    }
  }

  // Obtiene donaciones
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
        throw new Error('Error al obtener donaciones')
      }

      const data = await res.json()
      setDonaciones(data.report)
      setTotalValue(data.totalValue)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (isAuthenticated && isOrganization) {
      fetchDonaciones()
    }
  }, [charityId, isAuthenticated, isOrganization])

  // Calcula datos para estadísticas
  const totalProductos = donaciones.reduce((acc, donacion) => acc + donacion.quantity, 0)

  const mayorDonante = useMemo(() => {
    if (donaciones.length === 0) return ["N/A", 0]

    const donantesAgrupados = donaciones.reduce((acc, donacion) => {
      acc[donacion.donorName] = (acc[donacion.donorName] || 0) + donacion.totalValue
      return acc
    }, {})

    return Object.entries(donantesAgrupados).reduce((a, b) => a[1] > b[1] ? a : b, ["N/A", 0])
  }, [donaciones])

  const handleEditDonation = (donation) => {
    setEditingDonation(donation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingDonation(null)
    setIsModalOpen(false)
  }

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
            <p className="text-3xl font-bold">S/{totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#E1DDBF] border-[#042637]">
          <CardHeader>
            <CardTitle className="text-[#042637]">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProductos}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#E1DDBF] border-[#042637]">
          <CardHeader>
            <CardTitle className="text-[#042637]">Mayor Donante</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl">{mayorDonante[0]}</p>
            <p className="text-lg">S/{mayorDonante[1].toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex justify-end">
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#042637] text-[#ECE3D4]">
          Crear Donación
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donaciones.map((donacion) => (
            <TableRow key={donacion.donationId}>
              <TableCell>{donacion.donorName}</TableCell>
              <TableCell>{donacion.itemType}</TableCell>
              <TableCell>{donacion.quantity}</TableCell>
              <TableCell>
                <Button onClick={() => handleEditDonation(donacion)}>Editar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <FormularioDonacionComponent
            initialData={editingDonation}
            onClose={handleCloseModal}
            onSave={fetchDonaciones}
          />
        </Modal>
      )}
    </div>
  )
}

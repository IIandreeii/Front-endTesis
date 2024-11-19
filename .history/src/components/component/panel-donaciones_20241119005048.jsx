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
        console.log('Donaciones:', data)
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
    if (donaciones.length === 0) return ["N/A", 0]

    const donantesAgrupados = donaciones.reduce((acc, donacion) => {
      if (!acc[donacion.donorName]) {
        acc[donacion.donorName] = 0
      }
      acc[donacion.donorName] += donacion.totalValue
      return acc
    }, {})

    return Object.entries(donantesAgrupados).reduce((a, b) => a[1] > b[1] ? a : b, ["N/A", 0])
  }, [donaciones])

  const handleGenerateReport = async (period) => {
    try {
      const res = await fetch(`http://localhost:3001/mercadopago/report/in-kind/excel/${period}/${charityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (!res.ok) {
        throw new Error(`Error generating report: ${res.status} ${res.statusText}`)
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte_${period}_${charityId}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const handleEditDonation = (donation) => {
    setEditingDonation(donation)
  }

  const handleDeleteDonation = async (donationId) => {
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch(`http://localhost:3001/mercadopago/report/in-kind/${donationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: charityId, reason: 'Deleted by user', donationId })
      })

      if (!res.ok) {
        throw new Error(`Error deleting donation: ${res.status} ${res.statusText}`)
      }

      setDonaciones(donaciones.filter(donacion => donacion.donationId !== donationId))
    } catch (error) {
      console.error('Error deleting donation:', error)
    }
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
            <CardTitle className="text-[#ECE3D4]">Total Donaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#042637]">S/{totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#E1DDBF] border-[#042637]">
          <CardHeader>
            <CardTitle className="text-[#ECE3D4]">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#042637]">{totalProductos}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#E1DDBF] border-[#042637]">
          <CardHeader>
            <CardTitle className="text-[#ECE3D4]">Mayor Donante</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-[#042637]">{mayorDonante[0]}</p>
            <p className="text-lg text-[#042637]">S/{mayorDonante[1].toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-4 flex flex-wrap justify-end space-x-2">
        <Button onClick={() => handleGenerateReport('weekly')} className="bg-[#042637] text-[#ECE3D4]">
          Reporte Semanal
        </Button>
        <Button onClick={() => handleGenerateReport('monthly')} className="bg-[#042637] text-[#ECE3D4]">
          Reporte Mensual
        </Button>
        <Button onClick={() => handleGenerateReport('annual')} className="bg-[#042637] text-[#ECE3D4]">
          Reporte Anual
        </Button>
      </div>

      <Card className="bg-[#E1DDBF] border-[#042637]">
        <CardHeader>
          <CardTitle className="text-[#ECE3D4]">Lista de Donaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#ECE3D4]">ID</TableHead>
                <TableHead className="text-[#ECE3D4]">Donante</TableHead>
                <TableHead className="text-[#ECE3D4]">Producto</TableHead>
                <TableHead className="text-[#ECE3D4]">Cantidad</TableHead>
                <TableHead className="text-[#ECE3D4]">Unidad</TableHead>
                <TableHead className="text-[#ECE3D4]">Valor por Unidad</TableHead>
                <TableHead className="text-[#ECE3D4]">Total</TableHead>
                <TableHead className="text-[#ECE3D4]">Fecha y Hora</TableHead>
                <TableHead className="text-[#ECE3D4]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donaciones.map((donacion, index) => (
                <TableRow key={index}>
                  <TableCell className="text-[#042637]">{donacion.donationId}</TableCell>
                  <TableCell className="text-[#042637]">{donacion.donorName}</TableCell>
                  <TableCell className="text-[#042637]">{donacion.itemType}</TableCell>
                  <TableCell className="text-[#042637]">{donacion.quantity}</TableCell>
                  <TableCell className="text-[#042637]">{donacion.unit}</TableCell>
                  <TableCell className="text-[#042637]">S/{donacion.valuePerUnit.toFixed(2)}</TableCell>
                  <TableCell className="text-[#042637]">S/{donacion.totalValue.toFixed(2)}</TableCell>
                  <TableCell className="text-[#042637]">{new Date(donacion.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-[#042637]">
                    <Button onClick={() => handleEditDonation(donacion)} className="bg-[#042637] text-[#ECE3D4] mr-2">Modificar</Button>
                    <Button onClick={() => handleDeleteDonation(donacion.donationId)} className="bg-red-600 text-[#ECE3D4]">Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingDonation && (
        <FormularioDonacionComponent
          initialData={editingDonation}
          onClose={() => setEditingDonation(null)}
          onSave={() => {
            setEditingDonation(null)
            fetchDonaciones()
          }}
        />
      )}
    </div>
  )
}
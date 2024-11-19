'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, Download, Loader2 } from 'lucide-react'

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAmount = (amount, currency) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency }).format(amount)
}

export default function TablaDonaciones() {
  const [donaciones, setDonaciones] = useState([])
  const [filteredDonaciones, setFilteredDonaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const itemsPerPage = 10
  const searchParams = useSearchParams()
  const charityId = searchParams.get('charityId')

  useEffect(() => {
    const fetchDonaciones = async () => {
      try {
        setLoading(true)
        const res = await fetch(`http://localhost:3001/mercadopago/donations/${charityId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) {
          throw new Error(`Error fetching donations: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        setDonaciones(data)
        setFilteredDonaciones(data)
      } catch (error) {
        console.error('Error:', error)
        setError('N se encontro ninguna donación asegurece de tener donaciones')
      } finally {
        setLoading(false)
      }
    }

    if (charityId) {
      fetchDonaciones()
    }
  }, [charityId])

  useEffect(() => {
    let result = donaciones
    if (searchTerm) {
      result = result.filter(donacion => 
        donacion.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donacion.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter(donacion => donacion.paymentStatus === statusFilter)
    }
    setFilteredDonaciones(result)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, donaciones])

  const handleSort = (key) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
    setFilteredDonaciones(filteredDonaciones.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1
      return 0
    }))
  }

  const handleGenerateReport = async (period) => {
    try {
      setLoading(true)
      const res = await fetch(`http://localhost:3001/mercadopago/report/${period}/${charityId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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
      console.error('Error:', error)
      setError('Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const pageCount = Math.ceil(filteredDonaciones.length / itemsPerPage)
  const paginatedDonaciones = filteredDonaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (error) {
    return (
      <Card className="max-w-lg mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Intentar de nuevo</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECE3D4] to-[#E1DDBF] p-8">
      <Card className="max-w-6xl mx-auto" style={{ backgroundColor: '#D8C7A9' }}>
        <CardHeader className="bg-[#042637] text-white">
          <CardTitle className="text-2xl font-bold">Registro de Donaciones</CardTitle>
          <CardDescription className="text-gray-200">
            Tabla con todas las donaciones recibidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                placeholder="Buscar por donante o método de pago"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4 flex flex-wrap justify-end space-x-2">
            <Button onClick={() => handleGenerateReport('weekly')} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Reporte Semanal
            </Button>
            <Button onClick={() => handleGenerateReport('monthly')} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Reporte Mensual
            </Button>
            <Button onClick={() => handleGenerateReport('annual')} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Reporte Anual
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#042637]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[#042637] cursor-pointer" onClick={() => handleSort('donorName')}>
                        Donante <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      </TableHead>
                      <TableHead className="text-[#042637] cursor-pointer" onClick={() => handleSort('amount')}>
                        Monto <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      </TableHead>
                      <TableHead className="text-[#042637] cursor-pointer" onClick={() => handleSort('paymentStatus')}>
                        Estado <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      </TableHead>
                      <TableHead className="text-[#042637] cursor-pointer" onClick={() => handleSort('paymentMethod')}>
                        Método de Pago <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      </TableHead>
                      <TableHead className="text-[#042637] cursor-pointer" onClick={() => handleSort('paymentDate')}>
                        Fecha de Pago <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDonaciones.map((donacion, index) => (
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
                            {donacion.paymentStatus === 'approved' ? 'Aprobado' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#042637]">{donacion.paymentMethod}</TableCell>
                        <TableCell className="text-[#042637]">{formatDate(donacion.paymentDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Mostrando {Math.min(filteredDonaciones.length, currentPage * itemsPerPage)} de {filteredDonaciones.length} donaciones
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                    disabled={currentPage === pageCount}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
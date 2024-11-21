'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FormularioDonacionComponent({ initialData, onClose, onSave }) {
  const [unidad, setUnidad] = useState(initialData?.unit || "")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOrganization, setIsOrganization] = useState(false)
  const [donorName, setDonorName] = useState(initialData?.donorName || "")
  const [itemType, setItemType] = useState(initialData?.itemType || "")
  const [quantity, setQuantity] = useState(initialData?.quantity || "")
  const [valuePerUnit, setValuePerUnit] = useState(initialData?.valuePerUnit || "")
  const [charityId, setCharityId] = useState("")
  const router = useRouter()

  const checkAuthentication = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/logind')
      return
    }

    try {
      const res = await fetch(`https://rwggxws5-3001.brs.devtunnels.ms/profile?secret_token=${token}`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('authToken')

    const donationData = {
      charityId,
      donorName,
      itemType,
      quantity: parseFloat(quantity), // Asegurarse de que quantity sea un número
      unit: unidad,
      valuePerUnit: parseFloat(valuePerUnit) // Asegurarse de que valuePerUnit sea un número
    }


    try {
      let url, method

      if (initialData && initialData.donationId) {
        // Actualizar donación existente
        url = `https://rwggxws5-3001.brs.devtunnels.ms/mercadopago/report/in-kind/${initialData.donationId}`
        method = 'PUT'
        donationData.donationId = initialData.donationId // Incluir donationId en el cuerpo de la solicitud
      } else {
        // Crear nueva donación
        url = 'https://rwggxws5-3001.brs.devtunnels.ms/mercadopago/donations/in-kind'
        method = 'POST'
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(donationData)
      })

      if (!res.ok) {
        throw new Error(`Error al enviar la donación: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      alert(data.message)
      if (initialData) {
        onSave()
      } else {
        router.push('/panelcomida')
      }
    } catch (error) {
      alert(`Error al enviar la donación: ${error.message}`)
    }
  }

  if (!isAuthenticated || !isOrganization) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE3D4]">
      <form className="w-full max-w-md bg-[#ECE3D4] p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-[#042637] text-center">Formulario de Donación</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre" className="text-[#042637]">Nombre del Donante</Label>
            <Input id="nombre" className="border-[#042637] text-[#042637]" required value={donorName} onChange={(e) => setDonorName(e.target.value)} />
          </div>
          
          <div>
            <Label htmlFor="producto" className="text-[#042637]">Tipo de Producto</Label>
            <Input id="producto" className="border-[#042637] text-[#042637]" required value={itemType} onChange={(e) => setItemType(e.target.value)} />
          </div>
          
          <div>
            <Label htmlFor="cantidad" className="text-[#042637]">Cantidad</Label>
            <Input id="cantidad" type="number" min="0" step="0.01" className="border-[#042637] text-[#042637]" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          
          <div>
            <Label htmlFor="unidad" className="text-[#042637]">Unidad</Label>
            <Select onValueChange={setUnidad} value={unidad} required>
              <SelectTrigger className="border-[#042637] text-[#042637]">
                <SelectValue placeholder="Seleccione la unidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unidad">Unidad</SelectItem>
                <SelectItem value="kg">Kg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="valor" className="text-[#042637]">Valor por {unidad || 'unidad'}</Label>
            <Input id="valor" type="number" min="0" step="0.01" className="border-[#042637] text-[#042637]" required value={valuePerUnit} onChange={(e) => setValuePerUnit(e.target.value)} />
          </div>
        </div>
        
        <Button type="submit" className="w-full mt-6 bg-[#E1DDBF] text-[#042637] hover:bg-[#ECE3D4] hover:text-[#042637] border border-[#042637]">
          {initialData ? 'Actualizar Donación' : 'Enviar Donación'}
        </Button>
        <Button type="button" onClick={onClose} className="w-full mt-2 bg-[#E1DDBF] text-[#042637] hover:bg-[#ECE3D4] hover:text-[#042637] border border-[#042637]">
          Cancelar
        </Button>
      </form>
    </div>
  )
}
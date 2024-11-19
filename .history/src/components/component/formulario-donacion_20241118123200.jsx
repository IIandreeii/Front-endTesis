'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FormularioDonacionComponent() {
  const [unidad, setUnidad] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOrganization, setIsOrganization] = useState(false)
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

  if (!isAuthenticated || !isOrganization) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE3D4]">
      <form className="w-full max-w-md bg-[#ECE3D4] p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-[#042637] text-center">Formulario de Donación</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre" className="text-[#042637]">Nombre del Donante</Label>
            <Input id="nombre" className="border-[#042637] text-[#042637]" required />
          </div>
          
          <div>
            <Label htmlFor="producto" className="text-[#042637]">Tipo de Producto</Label>
            <Input id="producto" className="border-[#042637] text-[#042637]" required />
          </div>
          
          <div>
            <Label htmlFor="cantidad" className="text-[#042637]">Cantidad</Label>
            <Input id="cantidad" type="number" min="0" step="0.01" className="border-[#042637] text-[#042637]" required />
          </div>
          
          <div>
            <Label htmlFor="unidad" className="text-[#042637]">Unidad</Label>
            <Select onValueChange={setUnidad} required>
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
            <Input id="valor" type="number" min="0" step="0.01" className="border-[#042637] text-[#042637]" required />
          </div>
        </div>
        
        <Button type="submit" className="w-full mt-6 bg-[#E1DDBF] text-[#042637] hover:bg-[#ECE3D4] hover:text-[#042637] border border-[#042637]">
          Enviar Donación
        </Button>
      </form>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export default function VistaAgradecimiento() {
  const [animate, setAnimate] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setAnimate(true)
  }, [])

  const handleBackToHome = () => {
    router.push('/organizaciones')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ECE3D4] to-[#E1DDBF]">
      <Card className={`w-full max-w-md text-center transition-all duration-1000 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          style={{ backgroundColor: '#D8C7A9' }}>
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-[#042637]">¡Gracias por tu donación!</CardTitle>
          <CardDescription className="text-lg bg-[#042637]/80">Tu generosidad hace la diferencia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="my-6">
            <Heart className={`text-[#042637] mx-auto ${animate ? 'animate-pulse' : ''}`} size={64} />
          </div>
          <p className="text-[#042637]/70 mb-4">
            Tu apoyo nos ayuda a continuar nuestra misión y crear un impacto positivo en la comunidad.
          </p>
          <p className="text-[#042637] font-semibold">
            Juntos, estamos construyendo un futuro mejor.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button className="bg-[#042637] hover:bg-[#042637]/90 text-[#ECE3D4]" onClick={handleBackToHome}>
            Volver a la página principal
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
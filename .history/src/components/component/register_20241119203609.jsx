"use client";

import { useState } from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState("donor");
  const [errors, setErrors] = useState({});

  const [donorData, setDonorData] = useState({
    email: "",
    password: "",
    dni: "",
    apellido: "",
    nombre: "",
    userType: "donor"
  });

  const [charityData, setCharityData] = useState({
    email: "",
    password: "",
    direccion: "",
    telefono: "",
    nombre: "",
    descripcion: "",
    userType: "charity"
  });

  const handleChange = (e, setData) => {
    const { id, value } = e.target;
    if (id === 'dni' || id === 'telefono') {
      if (!/^\d*$/.test(value)) return;
    }
    if ((id === 'nombre' || id === 'apellido') && selectedOption === 'donor') {
      if (!/^[a-zA-Z]*$/.test(value)) return; 
    }
    if (id === 'nombre' && selectedOption === 'charity') {
      if (!/^[a-zA-Z\s]*$/.test(value)) return; 
    }
    if (id === 'dni' && value.length > 8) return; 
    if (id === 'telefono' && value.length > 9) return; 
    setData(prevState => ({ ...prevState, [id]: value }));
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validateDonorData = () => {
    const newErrors = {};
    if (donorData.nombre.length > 10) newErrors.nombre = "El nombre no debe tener más de 10 caracteres";
    if (donorData.apellido.length > 20) newErrors.apellido = "El apellido no debe tener más de 20 caracteres";
    if (!validateEmail(donorData.email)) newErrors.email = "El email no es válido";
    if (donorData.dni.length !== 8) newErrors.dni = "El DNI debe tener 8 dígitos";
    return newErrors;
  };

  const validateCharityData = () => {
    const newErrors = {};
    if (charityData.nombre.length > 30) newErrors.nombre = "El nombre no debe tener más de 20 caracteres";
    if (charityData.direccion.length > 30) newErrors.direccion = "La dirección no debe tener más de 30 caracteres";
    if (!validateEmail(charityData.email)) newErrors.email = "El email no es válido";
    if (charityData.telefono.length !== 9) newErrors.telefono = "El teléfono debe tener 9 dígitos";
    if (charityData.descripcion.length > 100) newErrors.descripcion = "La descripción no debe tener más de 100 caracteres";
    return newErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let newErrors = selectedOption === "donor" ? validateDonorData() : validateCharityData();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    try {
      const url = 'https://rwggxws5-3001.brs.devtunnels.ms/signup';
      const data = selectedOption === "donor" ? { ...donorData, type: 'donor' } : { ...charityData, type: 'charity' };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        // Manejar la respuesta exitosa
        router.push('/logind');
      } else {
        // Manejar errores
        console.error('Error en el registro');
      }
    } catch (error) {
      console.error('Error en el registro:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="flex justify-center items-center mb-8">
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="flex gap-4">
          <Button
            id="donor"
            value="donor"
            className={`rounded-lg px-6 py-2 transition-colors ${
              selectedOption === "donor"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => setSelectedOption("donor")}
          >
            Donor
          </Button>
          <Button
            id="charity"
            value="charity"
            className={`px-6 py-2 transition-colors rounded-lg ${
              selectedOption === "charity"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => setSelectedOption("charity")}
          >
            Charity Organization
          </Button>
        </RadioGroup>
      </div>

      <form onSubmit={onSubmit}>
        {selectedOption === "donor" && (
          <Card className="bg-background border shadow-lg w-full max-w-md">
            <CardHeader className="bg-primary text-primary-foreground p-6">
              <CardTitle className="text-2xl font-bold">Donor Registration</CardTitle>
              <CardDescription className="text-sm">Create your donor account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="Enter your first name"
                    className="border-muted focus:border-primary focus:ring-primary"
                    value={donorData.nombre}
                    onChange={(e) => handleChange(e, setDonorData)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="apellido"
                    placeholder="Enter your last name"
                    className="border-muted focus:border-primary focus:ring-primary"
                    value={donorData.apellido}
                    onChange={(e) => handleChange(e, setDonorData)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni" className="text-sm font-medium">
                  DNI
                </Label>
                <Input
                  id="dni"
                  placeholder="Enter your DNI"
                  className="border-muted focus:border-primary focus:ring-primary"
                  value={donorData.dni}
                  onChange={(e) => handleChange(e, setDonorData)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="border-muted focus:border-primary focus:ring-primary"
                  value={donorData.email}
                  onChange={(e) => handleChange(e, setDonorData)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="border-muted focus:border-primary focus:ring-primary"
                  value={donorData.password}
                  onChange={(e) => handleChange(e, setDonorData)}
                />
              </div>
              {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
              {errors.apellido && <p className="text-red-500 text-sm">{errors.apellido}</p>}
              {errors.dni && <p className="text-red-500 text-sm">{errors.dni}</p>}
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </CardContent>
            <CardFooter className="bg-muted p-6">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg"
              >
                Register as Donor
              </Button>
            </CardFooter>
          </Card>
        )}

        {selectedOption === "charity" && (
          <Card className="bg-background border shadow-lg w-full max-w-md">
            <CardHeader className="bg-primary text-primary-foreground p-6">
              <CardTitle className="text-2xl font-bold">Charity Organization Registration</CardTitle>
              <CardDescription className="text-sm">Create your charity organization account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="nombre"
                  placeholder="Enter your organization's name"
                  className="border-muted focus:border-primary focus:ring-primary"
                  value={charityData.nombre}
                  onChange={(e) => handleChange(e, setCharityData)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Enter your organization's description"
                  className="text-left border-muted focus:border-primary focus:ring-primary"
                  value={charityData.descripcion}
                  onChange={(e) => handleChange(e, setCharityData)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your organization's email"
                  className="border-muted focus:border-primary focus:ring-primary"
                  value={charityData.email}
                  onChange={(e) => handleChange(e, setCharityData)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-sm font-medium">
                  Address
                </Label>
                <Input
                  id="direccion"
                  placeholder="Enter your organization's address"
                  className="border-muted focus:border-primary focus:ring-primary"
                  value={charityData.direccion}
                  onChange={(e) => handleChange(e, setCharityData)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-sm font-medium">
                  Phone
                </Label>
                <Input
                  id="telefono"
                  placeholder="Enter your organization's phone number"
                  className="border-muted focus:border-primary focus:ring-primary"
                  value={charityData.telefono}
                  onChange={(e) => handleChange(e, setCharityData)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your organization's password"
                  className="border-muted focus:border-primary focus:ring-primary"
                  value={charityData.password}
                  onChange={(e) => handleChange(e, setCharityData)}
                />
              </div>
              {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
              {errors.direccion && <p className="text-red-500 text-sm">{errors.direccion}</p>}
              {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              {errors.descripcion && <p className="text-red-500 text-sm">{errors.descripcion}</p>}
            </CardContent>
            <CardFooter className="bg-muted p-6">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Register as Charity Organization
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
}

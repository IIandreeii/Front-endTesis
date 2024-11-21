"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';

export default function UpdateCharity({ charityData, onUpdateSuccess, onCancel }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: charityData.email || "",
        direccion: charityData.direccion || "",
        telefono: charityData.telefono || "",
        nombre: charityData.nombre || "",
        descripcion: charityData.descripcion || "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === 'telefono') {
            if (!/^\d*$/.test(value)) return;
        }
        if (id === 'nombre') {
            if (!/^[a-zA-Z\s]*$/.test(value)) return;
        }
        if (id === 'telefono' && value.length > 9) return;
        setFormData(prevState => ({ ...prevState, [id]: value }));
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const validateCharityData = () => {
        const newErrors = {};
        if (formData.nombre.length > 30) newErrors.nombre = "El nombre no debe tener más de 20 caracteres";
        if (formData.direccion.length > 30) newErrors.direccion = "La dirección no debe tener más de 30 caracteres";
        if (!validateEmail(formData.email)) newErrors.email = "El email no es válido";
        if (formData.telefono.length !== 9) newErrors.telefono = "El teléfono debe tener 9 dígitos";
        if (formData.descripcion.length > 100) newErrors.descripcion = "La descripción no debe tener más de 100 caracteres";
        return newErrors;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        let newErrors = validateCharityData();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        try {
            const res = await fetch(`http://localhost:3001/${charityData.id}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                // Manejar la respuesta exitosa
                onUpdateSuccess();
                window
            } else {
                // Manejar errores
                console.error('Error updating charity');
            }
        } catch (error) {
            console.error('Error updating charity:', error);
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    return (
        <div className="flex flex-col items-center justify-center mt-10">
            <form onSubmit={onSubmit}>
                <Card className="bg-background border shadow-lg w-full max-w-md">
                    <CardHeader className="bg-primary text-primary-foreground p-6">
                        <CardTitle className="text-2xl font-bold">Update Charity Organization</CardTitle>
                        <CardDescription className="text-sm">Update your charity organization account</CardDescription>
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
                                value={formData.nombre}
                                onChange={handleChange}
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
                                value={formData.descripcion}
                                onChange={handleChange}
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
                                value={formData.email}
                                onChange={handleChange}
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
                                value={formData.direccion}
                                onChange={handleChange}
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
                                value={formData.telefono}
                                onChange={handleChange}
                            />
                        </div>

                        {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}
                        {errors.direccion && <p className="text-red-500 text-sm">{errors.direccion}</p>}
                        {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        {errors.descripcion && <p className="text-red-500 text-sm">{errors.descripcion}</p>}
                    </CardContent>
                    <CardFooter className="bg-muted p-6 flex justify-between">
                        <Button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            Update Charity Organization
                        </Button>
                        <Button
                            type="button"
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
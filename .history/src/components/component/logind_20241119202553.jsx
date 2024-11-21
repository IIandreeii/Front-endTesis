"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext'; // Importa el contexto de autenticación

export default function Logind() {
  const router = useRouter();
  const { login } = useAuth(); // Obtén el método login del contexto
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch('https://rwggxws5-3001.brs.devtunnels.ms//signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || 'Error en la respuesta del servidor');
        return;
      }

      const data = await res.json(); // Define y maneja `data`

      if (data.token) {
        login(data.token); // Llama al método login del contexto
        router.push('/profile'); // Redirige a la página de perfil
      } else {
        setError('No se recibió token');
      }
    } catch (error) {
      setError('Error durante el inicio de sesión');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
      <div className="flex h-[600px] w-full max-w-[1200px] items-center justify-between rounded-[8px] bg-white">
        <div className="hidden h-full w-1/2 items-center justify-center rounded-l-lg bg-gradient-to-br from-[#5f4b8b] to-[#4361ee] md:flex">
          <div className="relative h-[80%] w-[80%]">
          <div className="relative h-[80%] w-[80%]">
            <div className="absolute top-0 left-0 h-[50px] w-[50px] rounded-[40px] bg-[#4361ee]" />
            <div className="absolute top-[20%] left-[20%] h-[100px] w-[100px] rounded-[80px]  bg-[#5f4b8b]" />
            <div className="absolute bottom-[10%] right-[%] h-[80px] w-[80px] rounded-[40px] bg-[#4361ee]" />
            <div className="absolute top-[50%] left-[85%] h-[150px] w-[150px] rounded-[100px] bg-[#5f4b8b]" />
            <div className="absolute top-[80%] left-[25%] h-[60px] w-[60px] rounded-[40px] bg-[#4361ee]" />
            <div className="absolute bottom-[20%] right-[40%] h-[90px] w-[90px] rounded-[100px] bg-[#5f4b8b]" />
          </div>
          </div>
        </div>
        
        <div className="flex h-full w-full flex-col items-center justify-center rounded-r-lg px-8 md:w-1/2 bg-gradient-to-br from-[white] to-[white] md:flex">
          <h2 className="mb-8 text-3xl font-bold text-[#16213e] md:text-4xl">Login</h2>
          <form className="flex w-full flex-col items-start justify-center gap-4" onSubmit={onSubmit}>
            <div className="flex w-full flex-col items-start justify-between gap-2">
              <label htmlFor="email" className="text-sm font-medium text-[#1a1a2e]">
                Email
              </label>
              <input
                type="text"
                id="email"
                placeholder="Enter your Email"
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-2 text-[#1a1a2e] focus:border-[#4361ee] focus:outline-none"
              />
            </div>
            <div className="flex w-full flex-col items-start justify-between gap-2">
              <label htmlFor="password" className="text-sm font-medium text-[#1a1a2e]">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-[#e0e0e0] px-4 py-2 text-[#1a1a2e] focus:border-[#4361ee] focus:outline-none"
              />
            </div>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded-lg border-[#e0e0e0] bg-[#f5f5f5] text-[#4361ee] focus:ring-[#4361ee]"
                />
                <label htmlFor="remember" className="text-sm font-medium text-[#1a1a2e]">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-[#4361ee] hover:underline">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-[#4361ee] py-2 text-center text-base font-medium text-white hover:bg-[#5f4b8b]"
            >
              LOGIN
            </button>
          </form>
          {error && <p className="text-red-500 mt-4 text-[#191970]">{error}</p>} {/* Mostrar error si hay */}
          <p className="mt-4 text-sm text-[#1a1a2e]">
            ¿No tienes una cuenta?{' '}
            <a href="/register" className="text-[#4361ee] hover:underline">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}





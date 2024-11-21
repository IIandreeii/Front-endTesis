"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '../../lib/AuthContext';

function Navbar() {
  const router = useRouter();
  const { authToken, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    // console.log('Token recuperado de localStorage:', token); // Validación
    if (token) {
      login(token);
    }
    setIsLoading(false);
    // console.log('Estado de autenticación actualizado:', !!token); // Validación
  }, [login]);

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // console.error('Token no encontrado');
      return;
    }

    try {
      const response = await fetch(`https://rwggxws5-3001.brs.devtunnels.ms/logout?secret_token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // console.log(data.message);
        localStorage.removeItem('authToken');
        logout();
        router.push('/logind'); // Corrige la ruta de redirección
      } else {
        const errorData = await response.json();
        // console.error(errorData.message);
      }
    } catch (error) {
      // console.error('Error al cerrar sesión:', error);
    }
  };

  const handleLogin = () => {
    const token = '{token}'; // Reemplaza esto con el token real
    localStorage.setItem('authToken', token);
    login(token);
    // console.log('Token almacenado:', token); // Validación
  };

  useEffect(() => {
    if (authToken && router && typeof router.replace === 'function' && router.asPath) {
      router.replace(router.asPath);
    }
  }, [authToken, router]);

  if (isLoading) {
    return null; // O cualquier otro componente de carga que prefieras
  }

  return (
    <header className=" fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
      <Link href="/" className="flex items-center gap-2" prefetch={false}>
        <MountainIcon className="w-6 h-6" />
        <span className="sr-only">Acme Inc</span>
      </Link>
      <nav className="flex items-center gap-6">
        <Link
          href="/organizaciones"
          className=" text-[#4c7d78] text-sm font-medium text-primary-foreground hover:text-foreground transition-colors"
          prefetch={false}
        >
          Organizaciones
        </Link>
        <Link
          href="/publicaciones"
          className=" text-[#4c7d78] text-sm font-medium text-primary-foreground hover:text-foreground transition-colors"
          prefetch={false}
        >
          Publicaciones
        </Link>
        {authToken ? (
          <>
            <Link
              href="/profile"
              className="text-[#4c7d78] text-sm font-medium text-primary-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              Profile
            </Link>
            <Link
              href="/mensajes"
              className="text-[#4c7d78] text-sm font-medium text-primary-foreground hover:text-foreground transition-colors"
              prefetch={false}
            >
              mensajes
            </Link>
            <button
              onClick={handleLogout}
              className="text-[#4c7d78] text-sm font-medium text-primary-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/logind"
            className="text-[#4c7d78] text-sm font-medium text-primary-foreground hover:text-foreground transition-colors"
            prefetch={false}
          >
            Login
          </Link>
          
        )}
        

      </nav>
    </header>
  );
}

function MountainIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

export default Navbar;
// app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FilePlus, FileText, Home, LogOut, BarChart } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación con Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    // Limpiar la suscripción al desmontar
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del administrador */}
      <header className="bg-primary text-white shadow">
        <div className="container mx-auto px-4 py-20 flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-0 bg-white/30 rounded-full transform rotate-45"></div>
              <div className="absolute inset-0 bg-white/20 rounded-full transform -rotate-45 scale-75"></div>

            </div>
            <h1 className="text-xl font-montserrat font-bold">Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button 
              onClick={handleLogout}
              className="text-white p-2 rounded-md hover:bg-primary-light flex items-center"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap mb-8">
          <Link 
            href="/"
            className="text-primary hover:underline flex items-center mb-4 mr-4"
          >
            <Home size={16} className="mr-1" /> Volver al sitio principal
          </Link>
        </div>

        <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
          Bienvenido al sistema de administración
        </h2>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-montserrat font-bold">Presupuestos</h3>
              <div className="bg-blue-100 p-2 rounded-md">
                <FileText size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">0</p>
            <p className="text-sm text-gray-500">Presupuestos generados</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-montserrat font-bold">Pendientes</h3>
              <div className="bg-yellow-100 p-2 rounded-md">
                <BarChart size={20} className="text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">0</p>
            <p className="text-sm text-gray-500">Esperando aprobación</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-montserrat font-bold">Aprobados</h3>
              <div className="bg-green-100 p-2 rounded-md">
                <BarChart size={20} className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">0</p>
            <p className="text-sm text-gray-500">Presupuestos aprobados</p>
          </div>
        </div>

        <h3 className="text-xl font-montserrat font-bold mb-4 text-primary">
          Acciones rápidas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/presupuestos/nuevo"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="bg-primary/10 p-4 rounded-full w-fit mb-4">
              <FilePlus size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-montserrat font-bold mb-2">Nuevo Presupuesto</h3>
            <p className="text-gray-600">
              Crear un nuevo presupuesto personalizado para un cliente.
            </p>
          </Link>

          <Link
            href="/admin/presupuestos"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="bg-primary/10 p-4 rounded-full w-fit mb-4">
              <FileText size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-montserrat font-bold mb-2">Historial de Presupuestos</h3>
            <p className="text-gray-600">
              Ver y gestionar todos los presupuestos creados.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

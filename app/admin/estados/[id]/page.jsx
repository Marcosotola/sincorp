// app/admin/estados/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { obtenerEstadoPorId } from '../../../lib/firestore';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EstadoPDF from '../../../components/pdf/EstadoPDF';

// Función para formatear montos con separador de miles (punto) y decimal (coma)
const formatMoney = (amount) => {
    if (amount === undefined || amount === null) return '$0,00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formatted = num.toFixed(2).replace('.', ',');
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return '$' + parts.join(',');
};

export default function VerEstado({ params }) {
  // Usar React.use para manejar params como una promesa
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    if (!id) return;

    // Verificar autenticación y cargar estado
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // Cargar datos del estado
          const estadoData = await obtenerEstadoPorId(id);
          setEstado(estadoData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar estado:', error);
          alert('Error al cargar los datos del estado.');
          router.push('/admin/estados');
        }
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [id, router]);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del administrador */}
      <header className="text-white shadow bg-primary">
        <div className="container flex items-center justify-between px-4 py-20 mx-auto">
          <div className="flex items-center">
            <div className="relative mr-2">
              <div className="absolute inset-0 transform rotate-45 rounded-full bg-white/30"></div>
              <div className="absolute inset-0 transform scale-75 -rotate-45 rounded-full bg-white/20"></div>
            </div>
            <h1 className="text-xl font-bold font-montserrat">Panel de Administración</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-primary-light"
            >
              <LogOut size={18} className="mr-2" /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              <Home size={16} className="mr-1" /> Dashboard
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <Link
              href="/admin/estados"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              Estados
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Detalles del Estado</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <Link
              href="/admin/estados"
              className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <ArrowLeft size={18} className="mr-2" /> Volver
            </Link>
            <Link
              href={`/admin/estados/editar/${id}`}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
            >
              <Edit size={18} className="mr-2" /> Editar
            </Link>
            <PDFDownloadLink
              document={<EstadoPDF estado={estado} />}
              fileName={`${estado.numero}.pdf`}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-primary hover:bg-primary-light"
            >     
              {({ blob, url, loading, error }) =>
                loading ?
                  <span><span className="inline-block w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span> Generando PDF...</span> :
                  <span><Download size={18} className="mr-2" /> Descargar PDF</span>
              }
            </PDFDownloadLink>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Estado de Cuenta {estado.numero}
        </h2>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          {/* Información del estado */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Estado</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Número:</span>
                <span className="col-span-2">{estado.numero}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Fecha:</span>
                <span className="col-span-2">{new Date(estado.fecha).toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Creado por:</span>
                <span className="col-span-2">{estado.usuarioCreador || 'No disponible'}</span>
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Cliente</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Nombre:</span>
                <span className="col-span-2">{estado.cliente.nombre}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Empresa:</span>
                <span className="col-span-2">{estado.cliente.empresa}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="col-span-2">{estado.cliente.email}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Teléfono:</span>
                <span className="col-span-2">{estado.cliente.telefono}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Dirección:</span>
                <span className="col-span-2">{estado.cliente.direccion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items del estado */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Detalle del Estado de Cuenta</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="w-32 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Fecha</th>
                  <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Descripción</th>
                  <th className="w-32 px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-700 uppercase">Precio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estado.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {new Date(item.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.descripcion}</td>
                    <td className="px-4 py-2 text-sm font-medium text-right text-gray-900">
                      {formatMoney(parseFloat(item.precio || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-full mt-6 ml-auto md:w-64">
            <div className="flex justify-between py-2 text-lg font-bold border-t border-b border-gray-200">
              <span>Saldo: </span>
              <span>{formatMoney(estado.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
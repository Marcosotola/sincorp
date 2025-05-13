'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { obtenerRemitoPorId } from '../../../lib/firestore';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RemitoPDF from '../../../components/pdf/RemitoPDF';

export default function VerRemito({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remito, setRemito] = useState(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const remitoData = await obtenerRemitoPorId(id);
          setRemito(remitoData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar remito:', error);
          alert('Error al cargar los datos del remito.');
          router.push('/admin/remitos');
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
              href="/admin/remitos"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              Remitos
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Detalles del Remito</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <Link
              href="/admin/remitos"
              className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <ArrowLeft size={18} className="mr-2" /> Volver
            </Link>
            <Link
              href={`/admin/remitos/editar/${id}`}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
            >
              <Edit size={18} className="mr-2" /> Editar
            </Link>
            <PDFDownloadLink
              document={<RemitoPDF remito={remito} />}
              fileName={`${remito.numero}.pdf`}
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
          Remito {remito.numero}
        </h2>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          {/* Información del remito */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Remito</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Número:</span>
                <span className="col-span-2">{remito.numero}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Fecha:</span>
                <span className="col-span-2">{new Date(remito.fecha).toLocaleDateString('es-AR')}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Creado por:</span>
                <span className="col-span-2">{remito.usuarioCreador || 'No disponible'}</span>
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Cliente</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Nombre:</span>
                <span className="col-span-2">{remito.cliente.nombre}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Empresa:</span>
                <span className="col-span-2">{remito.cliente.empresa}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="col-span-2">{remito.cliente.email}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Teléfono:</span>
                <span className="col-span-2">{remito.cliente.telefono}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Dirección:</span>
                <span className="col-span-2">{remito.cliente.direccion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items del remito */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Detalle del Remito</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Descripción</th>
                  <th className="w-24 px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-700 uppercase">Cantidad</th>
                  <th className="w-24 px-4 py-2 text-xs font-medium tracking-wider text-center text-gray-700 uppercase">Unidad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {remito.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.descripcion}</td>
                    <td className="px-4 py-2 text-sm text-right text-gray-700">{item.cantidad}</td>
                    <td className="px-4 py-2 text-sm text-center text-gray-700">{item.unidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observaciones */}
        {remito.observaciones && (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Observaciones</h3>
            <div className="p-4 whitespace-pre-line rounded-md bg-gray-50">
              {remito.observaciones}
            </div>
          </div>
        )}

        {/* Firma */}
        {remito.firma && (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Firma de Recepción</h3>
            <div className="text-center">
              <img
                src={remito.firma}
                alt="Firma"
                className="mx-auto mb-2 border border-gray-300"
                style={{ maxWidth: '300px', height: '150px' }}
              />
              <p className="text-sm font-medium text-gray-700">{remito.aclaracionFirma || 'Sin aclaración'}</p>
              <p className="mt-1 text-sm text-gray-600">Recibí conforme</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
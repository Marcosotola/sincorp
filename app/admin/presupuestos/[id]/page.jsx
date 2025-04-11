// app/admin/presupuestos/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download, Check, X } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { obtenerPresupuestoPorId, actualizarPresupuesto } from '../../../lib/firestore';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PresupuestoPDF from '../../../components/pdf/PresupuestoPDF';

export default function VerPresupuesto({ params }) {
  // Usar React.use para manejar params como una promesa
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presupuesto, setPresupuesto] = useState(null);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Verificar autenticación y cargar presupuesto
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // Cargar datos del presupuesto
          const presupuestoData = await obtenerPresupuestoPorId(id);
          setPresupuesto(presupuestoData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar presupuesto:', error);
          alert('Error al cargar los datos del presupuesto.');
          router.push('/admin/presupuestos');
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

  // Función para descargar el PDF
  const handleDescargarPDF = async () => {
    setDescargandoPdf(true);
    try {
      // Importamos dinámicamente solo cuando se necesita
      const { pdf } = await import('@react-pdf/renderer');
      const PresupuestoPDF = (await import('../../../../components/pdf/PresupuestoPDF')).default;

      // Crear el blob del PDF
      const blob = await pdf(<PresupuestoPDF presupuesto={presupuesto} />).toBlob();

      // Crear URL del blob
      const url = URL.createObjectURL(blob);

      // Descargar el PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = `${presupuesto.numero}.pdf`;
      link.click();

      // Limpiar el URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Inténtelo de nuevo más tarde.');
    } finally {
      setDescargandoPdf(false);
    }
  };

  // Función para manejar el cambio de estado
  const handleCambiarEstado = async (nuevoEstado) => {
    if (presupuesto.estado === nuevoEstado) return;

    if (confirm(`¿Está seguro de cambiar el estado a "${nuevoEstado}"?`)) {
      setCambiandoEstado(true);
      try {
        await actualizarPresupuesto(id, {
          estado: nuevoEstado,
          fechaActualizacionEstado: new Date()
        });

        // Actualizar el estado local
        setPresupuesto({
          ...presupuesto,
          estado: nuevoEstado
        });

        alert(`El presupuesto ha sido marcado como "${nuevoEstado}".`);
      } catch (error) {
        console.error('Error al cambiar el estado:', error);
        alert('Error al cambiar el estado del presupuesto.');
      } finally {
        setCambiandoEstado(false);
      }
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
              href="/admin/presupuestos"
              className="flex items-center mr-4 text-primary hover:underline"
            >
              Presupuestos
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-700">Detalles del Presupuesto</span>
          </div>

          <div className="flex mb-4 space-x-2">
            <Link
              href="/admin/presupuestos"
              className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <ArrowLeft size={18} className="mr-2" /> Volver
            </Link>
            <Link
              href={`/admin/presupuestos/editar/${id}`}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
            >
              <Edit size={18} className="mr-2" /> Editar
            </Link>
            <button
              title="Descargar PDF"
              className="flex px-4 py-2 text-white rounded-md bg-primary hover:text-primary-light"
            >
              <PDFDownloadLink
                document={<PresupuestoPDF presupuesto={presupuesto} />}
                fileName={`${presupuesto.numero}.pdf`}
                className="flex text-white"
              >     
                                {({ blob, url, loading, error }) =>
                                    loading ?
                                        <span><span className="inline-block w-4 h-4 mr-2 border-t-2 border-white rounded-full animate-spin"></span> Generando PDF...</span> :
                                        <span><Download size={18} className="mr-2" /> Descargar PDF</span>
                                }
              </PDFDownloadLink>
            </button>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Presupuesto {presupuesto.numero}
        </h2>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          {/* Información del presupuesto */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Presupuesto</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Número:</span>
                <span className="col-span-2">{presupuesto.numero}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Fecha:</span>
                <span className="col-span-2">{new Date(presupuesto.fecha).toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Validez:</span>
                <span className="col-span-2">{presupuesto.validez}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Estado:</span>
                <div className="flex items-center col-span-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block mr-2
                    ${presupuesto.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                      presupuesto.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                    {presupuesto.estado}
                  </span>

                  {/* Botones para cambiar estado */}
                  <div className="flex ml-2 space-x-4">
                    <button
                      onClick={() => handleCambiarEstado('Aprobado')}
                      disabled={presupuesto.estado === 'Aprobado' || cambiandoEstado}
                      className={`p-1 rounded-md ${presupuesto.estado === 'Aprobado' ? 'bg-green-100 text-green-800 cursor-default' : 'bg-white text-green-600 hover:bg-green-50 border border-green-200'}`}
                      title="Aprobar presupuesto"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleCambiarEstado('Rechazado')}
                      disabled={presupuesto.estado === 'Rechazado' || cambiandoEstado}
                      className={`p-1 rounded-md ${presupuesto.estado === 'Rechazado' ? 'bg-red-100 text-red-800 cursor-default' : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'}`}
                      title="Rechazar presupuesto"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => handleCambiarEstado('Pendiente')}
                      disabled={presupuesto.estado === 'Pendiente' || cambiandoEstado}
                      className={`p-1 rounded-md ${presupuesto.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800 cursor-default' : 'bg-white text-yellow-600 hover:bg-yellow-50 border border-yellow-200'}`}
                      title="Marcar como pendiente"
                    >
                      P
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Creado por:</span>
                <span className="col-span-2">{presupuesto.usuarioCreador || 'No disponible'}</span>
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Cliente</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Nombre:</span>
                <span className="col-span-2">{presupuesto.cliente.nombre}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Empresa:</span>
                <span className="col-span-2">{presupuesto.cliente.empresa}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="col-span-2">{presupuesto.cliente.email}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Teléfono:</span>
                <span className="col-span-2">{presupuesto.cliente.telefono}</span>
              </div>
              <div className="grid grid-cols-3 pb-2 border-b">
                <span className="font-medium text-gray-600">Dirección:</span>
                <span className="col-span-2">{presupuesto.cliente.direccion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items del presupuesto */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Detalle del Presupuesto</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Descripción</th>
                  <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Cantidad</th>
                  <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Precio Unit.</th>
                  <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {presupuesto.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.descripcion}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.cantidad}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">$${parseFloat(item.precioUnitario || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-full mt-6 ml-auto md:w-64">
            <div className="flex justify-between py-2 border-t border-gray-200">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">${presupuesto.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-200">
            </div>
            <div className="flex justify-between py-2 text-lg font-bold border-t border-b border-gray-200">
              <span>Total:</span>
              <span>${presupuesto.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Notas y Condiciones</h3>
          <div className="p-4 whitespace-pre-line rounded-md bg-gray-50">
            {presupuesto.notas}
          </div>
        </div>
      </div>
    </div>
  );
}
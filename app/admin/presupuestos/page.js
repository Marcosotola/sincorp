// app/admin/presupuestos/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FilePlus, FileText, Home, LogOut, Search, Download, Edit, Trash, Eye } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { obtenerPresupuestos, eliminarPresupuesto } from '../../lib/firestore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PresupuestoPDF from '../../components/pdf/PresupuestoPDF';

export default function HistorialPresupuestos() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presupuestos, setPresupuestos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const router = useRouter();

  // Datos de ejemplo para mostrar en la interfaz
  const presupuestosEjemplo = [
    {
      id: '1',
      numero: 'P-2025-0001',
      fecha: '2025-04-01',
      cliente: { nombre: 'Juan Pérez', empresa: 'Empresa ABC' },
      total: 45000,
      estado: 'Enviado'
    },
    {
      id: '2',
      numero: 'P-2025-0002',
      fecha: '2025-03-28',
      cliente: { nombre: 'María López', empresa: 'Comercial XYZ' },
      total: 68500,
      estado: 'Aprobado'
    },
    {
      id: '3',
      numero: 'P-2025-0003',
      fecha: '2025-03-26',
      cliente: { nombre: 'Carlos Rodríguez', empresa: 'Industrias Norte' },
      total: 120000,
      estado: 'Pendiente'
    }
  ];

  useEffect(() => {
    // Verificar autenticación con Firebase
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Cargar presupuestos desde Firestore
        try {
          const presupuestosData = await obtenerPresupuestos();
          setPresupuestos(presupuestosData);
        } catch (error) {
          console.error('Error al cargar presupuestos:', error);
        }

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

  const presupuestosFiltrados = presupuestos.filter((presupuesto) => {
    const terminoBusqueda = filtro.toLowerCase();
    return (
      presupuesto.numero.toLowerCase().includes(terminoBusqueda) ||
      presupuesto.cliente.nombre.toLowerCase().includes(terminoBusqueda) ||
      presupuesto.cliente.empresa.toLowerCase().includes(terminoBusqueda)
    );
  });

  const handleDeletePresupuesto = async (id) => {
    if (confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
      try {
        await eliminarPresupuesto(id);
        // Actualizar el estado local
        setPresupuestos(presupuestos.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
        alert('Error al eliminar el presupuesto. Inténtelo de nuevo más tarde.');
      }
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
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/dashboard"
              className="text-primary hover:underline flex items-center mr-4"
            >
              <Home size={16} className="mr-1" /> Dashboard
            </Link>
            <span className="text-gray-500 mx-2">/</span>
            <span className="text-gray-700">Historial de Presupuestos</span>
          </div>

          <Link
            href="/admin/presupuestos/nuevo"
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-light transition-colors flex items-center mb-4"
          >
            <FilePlus size={18} className="mr-2" /> Nuevo Presupuesto
          </Link>
        </div>

        <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
          Historial de Presupuestos
        </h2>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center relative mb-6">
            <Search size={18} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, cliente o empresa..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {presupuestosFiltrados.map((presupuesto) => (
                  <tr key={presupuesto.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{presupuesto.numero}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{presupuesto.fecha}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{presupuesto.cliente.nombre}</div>
                      <div className="text-sm text-gray-500">{presupuesto.cliente.empresa}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${presupuesto.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${presupuesto.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                          presupuesto.estado === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                        {presupuesto.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          title="Ver detalles"
                          className="text-gray-600 hover:text-primary"
                          onClick={() => router.push(`/admin/presupuestos/${presupuesto.id}`)}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          title="Descargar PDF"
                          className="text-primary hover:text-primary-light"
                        >
                          <PDFDownloadLink
                            document={<PresupuestoPDF presupuesto={presupuesto} />}
                            fileName={`${presupuesto.numero}.pdf`}
                            className="text-primary hover:text-primary-light"
                          >
                            {({ blob, url, loading, error }) =>
                              <Download size={18} className={loading ? "animate-pulse" : ""} />
                            }
                          </PDFDownloadLink>
                        </button>
                        <button
                          title="Editar"
                          className="text-secondary hover:text-secondary-light"
                          onClick={() => router.push(`/admin/presupuestos/editar/${presupuesto.id}`)}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          title="Eliminar"
                          className="text-danger hover:text-red-700"
                          onClick={() => handleDeletePresupuesto(presupuesto.id)}
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {presupuestosFiltrados.length === 0 && (
            <div className="text-center py-10">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No hay presupuestos que coincidan con su búsqueda</p>
              <p className="text-gray-400 text-sm">Intente con otros términos o cree un nuevo presupuesto</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
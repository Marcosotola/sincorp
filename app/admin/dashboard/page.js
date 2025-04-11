// app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FilePlus, FileText, Home, LogOut, BarChart, X } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    aprobados: 0,
    rechazados: 0,
    ultimosPresupuestos: []
  });
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación con Firebase
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarEstadisticas();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    // Limpiar la suscripción al desmontar
    return () => unsubscribe();
  }, [router]);

  const cargarEstadisticas = async () => {
    try {
      const presupuestosRef = collection(db, 'presupuestos');

      // Contar total de presupuestos
      const totalSnapshot = await getDocs(presupuestosRef);
      const total = totalSnapshot.size;

      // Contar presupuestos pendientes
      const pendientesQuery = query(presupuestosRef, where('estado', '==', 'Pendiente'));
      const pendientesSnapshot = await getDocs(pendientesQuery);
      const pendientes = pendientesSnapshot.size;

      // Contar presupuestos aprobados
      const aprobadosQuery = query(presupuestosRef, where('estado', '==', 'Aprobado'));
      const aprobadosSnapshot = await getDocs(aprobadosQuery);
      const aprobados = aprobadosSnapshot.size;

      // Contar presupuestos rechazados
      const rechazadosQuery = query(presupuestosRef, where('estado', '==', 'Rechazado'));
      const rechazadosSnapshot = await getDocs(rechazadosQuery);
      const rechazados = rechazadosSnapshot.size;

      // Obtener últimos presupuestos
      const ultimosQuery = query(presupuestosRef, orderBy('fechaCreacion', 'desc'), limit(5));
      const ultimosSnapshot = await getDocs(ultimosQuery);
      const ultimosPresupuestos = ultimosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEstadisticas({
        total,
        pendientes,
        aprobados,
        rechazados,
        ultimosPresupuestos
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

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
        <div className="flex flex-wrap mb-8">
          <Link
            href="/"
            className="flex items-center mb-4 mr-4 text-primary hover:underline"
          >
            <Home size={16} className="mr-1" /> Volver al sitio principal
          </Link>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Bienvenido al sistema de administración
        </h2>

        <h3 className="mb-4 text-xl font-bold font-montserrat text-primary">
          Acciones rápidas
        </h3>

        <div className="grid grid-cols-1 gap-6 mb-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/presupuestos/nuevo"
            className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg"
          >
            <div className="p-4 mb-4 rounded-full bg-primary/10 w-fit">
              <FilePlus size={32} className="text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold font-montserrat">Nuevo Presupuesto</h3>
            <p className="text-gray-600">
              Crear un nuevo presupuesto personalizado para un cliente.
            </p>
          </Link>

          <Link
            href="/admin/presupuestos"
            className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg"
          >
            <div className="p-4 mb-4 rounded-full bg-primary/10 w-fit">
              <FileText size={32} className="text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold font-montserrat">Historial de Presupuestos</h3>
            <p className="text-gray-600">
              Ver y gestionar todos los presupuestos creados.
            </p>
          </Link>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-montserrat">Presupuestos</h3>
              <div className="p-2 bg-blue-100 rounded-md">
                <FileText size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="mb-1 text-3xl font-bold">{estadisticas.total}</p>
            <p className="text-sm text-gray-500">Presupuestos generados</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-montserrat">Pendientes</h3>
              <div className="p-2 bg-yellow-100 rounded-md">
                <BarChart size={20} className="text-yellow-600" />
              </div>
            </div>
            <p className="mb-1 text-3xl font-bold">{estadisticas.pendientes}</p>
            <p className="text-sm text-gray-500">Esperando aprobación</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-montserrat">Aprobados</h3>
              <div className="p-2 bg-green-100 rounded-md">
                <BarChart size={20} className="text-green-600" />
              </div>
            </div>
            <p className="mb-1 text-3xl font-bold">{estadisticas.aprobados}</p>
            <p className="text-sm text-gray-500">Presupuestos aprobados</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-montserrat">Rechazados</h3>
              <div className="p-2 bg-red-100 rounded-md">
                <X size={20} className="text-red-600" />
              </div>
            </div>
            <p className="mb-1 text-3xl font-bold">{estadisticas.rechazados}</p>
            <p className="text-sm text-gray-500">Presupuestos rechazados</p>
          </div>
        </div>

        {/* Últimos presupuestos */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-bold font-montserrat">Últimos presupuestos</h3>
          {estadisticas.ultimosPresupuestos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Número</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Fecha</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Cliente</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Total</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Estado</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-right text-gray-700 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estadisticas.ultimosPresupuestos.map((presupuesto) => (
                    <tr key={presupuesto.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{presupuesto.numero}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {presupuesto.fechaCreacion ? new Date(presupuesto.fechaCreacion.toDate()).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-900">{presupuesto.cliente?.nombre}</div>
                        <div className="text-sm text-gray-500">{presupuesto.cliente?.empresa}</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">${presupuesto.total?.toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${presupuesto.estado === 'Aprobado' ? 'bg-green-100 text-green-800' :
                            presupuesto.estado === 'Rechazado' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                          {presupuesto.estado}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-right">
                        <Link
                          href={`/admin/presupuestos/${presupuesto.id}`}
                          className="text-primary hover:text-primary-light"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No hay presupuestos registrados aún.
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

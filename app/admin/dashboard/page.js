// app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FilePlus, 
  FileText, 
  Home, 
  LogOut, 
  BarChart3, 
  DollarSign, 
  FileCheck, 
  Receipt, 
  ScrollText,
  TrendingUp,
  Users,
  Calendar,
  ChevronRight,
  Menu,
  X,
  Clock,
  AlertCircle
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    presupuestos: { total: 0, pendientes: 0, aprobados: 0 },
    estados: { total: 0, ultimos: [] },
    // Para futuro: remitos, recibos, etc.
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await cargarEstadisticas();
        setLoading(false);
      } else {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarEstadisticas = async () => {
    try {
      // Estadísticas de presupuestos
      const presupuestosRef = collection(db, 'presupuestos');
      const presupuestosSnapshot = await getDocs(presupuestosRef);
      const presupuestosData = presupuestosSnapshot.docs.map(doc => doc.data());
      
      const presupuestosPendientes = presupuestosData.filter(p => p.estado === 'Pendiente').length;
      const presupuestosAprobados = presupuestosData.filter(p => p.estado === 'Aprobado').length;

      // Estadísticas de estados de cuenta
      const estadosRef = collection(db, 'estados');
      const estadosSnapshot = await getDocs(estadosRef);
      const estadosTotal = estadosSnapshot.size;

      // Últimos estados
      const ultimosEstadosQuery = query(estadosRef, orderBy('fechaCreacion', 'desc'), limit(3));
      const ultimosEstadosSnapshot = await getDocs(ultimosEstadosQuery);
      const ultimosEstados = ultimosEstadosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEstadisticas({
        presupuestos: {
          total: presupuestosSnapshot.size,
          pendientes: presupuestosPendientes,
          aprobados: presupuestosAprobados
        },
        estados: {
          total: estadosTotal,
          ultimos: ultimosEstados
        }
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

  // Definir módulos del sistema
  const modulos = [
    {
      id: 'presupuestos',
      titulo: 'Presupuestos',
      icono: FileText,
      color: 'bg-blue-500',
      colorClaro: 'bg-blue-100',
      colorTexto: 'text-blue-600',
      descripcion: 'Crear y gestionar presupuestos',
      rutas: {
        nuevo: '/admin/presupuestos/nuevo',
        historial: '/admin/presupuestos'
      },
      activo: true
    },
    {
      id: 'estados',
      titulo: 'Estados de Cuenta',
      icono: DollarSign,
      color: 'bg-green-500',
      colorClaro: 'bg-green-100',
      colorTexto: 'text-green-600',
      descripcion: 'Control de estados de cuenta',
      rutas: {
        nuevo: '/admin/estados/nuevo',
        historial: '/admin/estados'
      },
      activo: true
    },
    {
      id: 'remitos',
      titulo: 'Remitos',
      icono: FileCheck,
      color: 'bg-purple-500',
      colorClaro: 'bg-purple-100',
      colorTexto: 'text-purple-600',
      descripcion: 'Gestión de remitos',
      rutas: {
        nuevo: '/admin/remitos/nuevo',
        historial: '/admin/remitos'
      },
      activo: true,
      proximamente: false
    },
    {
      id: 'recibos',
      titulo: 'Recibos',
      icono: Receipt,
      color: 'bg-orange-500',
      colorClaro: 'bg-orange-100',
      colorTexto: 'text-orange-600',
      descripcion: 'Administrar recibos',
      rutas: {
        nuevo: '/admin/recibos/nuevo',
        historial: '/admin/recibos'
      },
      activo: true,
      proximamente: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mejorado */}
      <header className="sticky top-0 z-50 text-white shadow-lg bg-primary">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center">
            <button
              className="mr-4 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center">
              <div className="relative mr-2">
                <div className="absolute inset-0 transform rotate-45 rounded-full bg-white/30"></div>
                <div className="absolute inset-0 transform scale-75 -rotate-45 rounded-full bg-white/20"></div>
              </div>
              <h1 className="text-lg font-bold md:text-xl font-montserrat">Panel de Administración</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center p-2 text-white rounded-md hover:bg-primary-light"
            >
              <LogOut size={18} className="mr-2" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="absolute w-full bg-white shadow-lg top-full md:hidden">
            <nav className="flex flex-col p-4">
              <Link href="/" className="py-2 text-gray-700 hover:text-primary">
                Volver al sitio principal
              </Link>
              {modulos.filter(m => m.activo).map(modulo => (
                <div key={modulo.id} className="py-2">
                  <p className="font-semibold text-gray-800">{modulo.titulo}</p>
                  <Link href={modulo.rutas.nuevo} className="block py-1 pl-4 text-gray-600 hover:text-primary">
                    Nuevo
                  </Link>
                  <Link href={modulo.rutas.historial} className="block py-1 pl-4 text-gray-600 hover:text-primary">
                    Historial
                  </Link>
                </div>
              ))}
            </nav>
          </div>
        )}
      </header>

      <div className="container px-4 py-8 mx-auto">
        {/* Título y bienvenida */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold md:text-3xl font-montserrat text-primary">
            ¡Bienvenido, {user?.displayName || user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Cards */}
        

        {/* Módulos del sistema */}
        <h3 className="mb-4 text-xl font-bold text-gray-800">Documentos</h3>
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {modulos.map(modulo => {
            const Icono = modulo.icono;
            return (
              <div
                key={modulo.id}
                className={`relative overflow-hidden rounded-lg shadow-md transition-all ${
                  modulo.activo ? 'hover:shadow-lg cursor-pointer' : 'opacity-75'
                }`}
              >
                {modulo.proximamente && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                    <span className="px-3 py-1 text-sm font-semibold text-white bg-yellow-500 rounded-full">
                      Próximamente
                    </span>
                  </div>
                )}
                
                <div className={`p-6 ${modulo.activo ? modulo.color : 'bg-gray-300'} text-white`}>
                  <Icono size={32} />
                  <h4 className="mt-4 text-lg font-bold">{modulo.titulo}</h4>
                  <p className="text-sm opacity-90">{modulo.descripcion}</p>
                </div>
                
                {modulo.activo && (
                  <div className="p-4 bg-white">
                    <div className="space-y-2">
                      <Link
                        href={modulo.rutas.nuevo}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${modulo.colorClaro} ${modulo.colorTexto} hover:opacity-80`}
                      >
                        <span className="flex items-center">
                          <FilePlus size={16} className="mr-2" />
                          Crear nuevo
                        </span>
                        <ChevronRight size={16} />
                      </Link>
                      <Link
                        href={modulo.rutas.historial}
                        className="flex items-center justify-between p-2 text-gray-700 transition-colors rounded-md hover:bg-gray-100"
                      >
                        <span className="flex items-center">
                          <ScrollText size={16} className="mr-2" />
                          Ver historial
                        </span>
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 transition-all bg-white rounded-lg shadow-md hover:shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <span className="text-sm text-green-600">+15%</span>
            </div>
            <h3 className="text-2xl font-bold">{estadisticas.presupuestos.total}</h3>
            <p className="text-sm text-gray-600">Presupuestos totales</p>
          </div>

          <div className="p-4 transition-all bg-white rounded-lg shadow-md hover:shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={20} className="text-yellow-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">{estadisticas.presupuestos.pendientes}</h3>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>

          <div className="p-4 transition-all bg-white rounded-lg shadow-md hover:shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign size={20} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">{estadisticas.estados.total}</h3>
            <p className="text-sm text-gray-600">Estados de cuenta</p>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Actividad Reciente</h3>
          {estadisticas.estados.ultimos.length > 0 ? (
            <div className="space-y-3">
              {estadisticas.estados.ultimos.map(estado => (
                <div key={estado.id} className="flex items-center justify-between p-3 transition-colors rounded-md hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="p-2 mr-3 bg-green-100 rounded-lg">
                      <DollarSign size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Estado {estado.numero}</p>
                      <p className="text-sm text-gray-600">{estado.cliente?.nombre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">${estado.total?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {estado.fechaCreacion ? new Date(estado.fechaCreacion.toDate()).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No hay actividad reciente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
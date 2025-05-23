// app/admin/estados/editar/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, Download, Eye, PlusCircle, Trash2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';
import { obtenerEstadoPorId, actualizarEstado } from '../../../../lib/firestore';
import { use } from 'react';

// Función para formatear montos con separador de miles (punto) y decimal (coma)
const formatMoney = (amount) => {
    if (amount === undefined || amount === null) return '$0,00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formatted = num.toFixed(2).replace('.', ',');
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return '$' + parts.join(',');
};

export default function EditarEstado({ params }) {
  // Usar React.use para manejar params como una promesa
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [estadoOriginal, setEstadoOriginal] = useState(null);

  // Estado del formulario
  const [cliente, setCliente] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  
  const [estado, setEstado] = useState({
    numero: '',
    fecha: '',
    items: [
      { id: 1, fecha: new Date().toISOString().split('T')[0], descripcion: '', precio: '' }
    ],
    total: 0
  });

  useEffect(() => {
    if (!id) return;
    
    // Verificar autenticación y cargar estado
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Cargar datos del estado
          const estadoData = await obtenerEstadoPorId(id);
          setEstadoOriginal(estadoData);
          
          // Actualizar estado con los datos cargados
          setEstado({
            numero: estadoData.numero,
            fecha: estadoData.fecha,
            items: estadoData.items || [],
            total: estadoData.total || 0
          });
          
          setCliente(estadoData.cliente);
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

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setCliente({...cliente, [name]: value});
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = estado.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    
    const total = updatedItems.reduce((sum, item) => sum + (parseFloat(item.precio) || 0), 0);
    
    setEstado({
      ...estado,
      items: updatedItems,
      total: total
    });
  };

  const addItem = () => {
    const newId = Math.max(...estado.items.map(item => item.id), 0) + 1;
    setEstado({
      ...estado,
      items: [
        ...estado.items,
        { id: newId, fecha: new Date().toISOString().split('T')[0], descripcion: '', precio: '' }
      ]
    });
  };

  const removeItem = (id) => {
    if (estado.items.length === 1) return;
    
    const updatedItems = estado.items.filter(item => item.id !== id);
    const total = updatedItems.reduce((sum, item) => sum + (parseFloat(item.precio) || 0), 0);
    
    setEstado({
      ...estado,
      items: updatedItems,
      total: total
    });
  };

  const handleGuardarEstado = async () => {
    setGuardando(true);
    try {
      // Preparar datos del estado
      const estadoData = {
        numero: estado.numero,
        fecha: estado.fecha,
        cliente: cliente,
        items: estado.items,
        total: estado.total,
        estado: estadoOriginal.estado || 'Pendiente',
      };
      
      // Actualizar en Firestore
      await actualizarEstado(id, estadoData);
      alert('Estado actualizado exitosamente');
      router.push('/admin/estados');
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      alert('Error al actualizar el estado. Inténtelo de nuevo más tarde.');
    } finally {
      setGuardando(false);
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
            <span className="text-gray-700">Editar Estado</span>
          </div>
          
          <div className="flex mb-4 space-x-2">
            <button
              onClick={handleGuardarEstado}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" /> 
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold font-montserrat text-primary">
          Editar Estado {estado.numero}
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* Información del estado */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Estado</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Número</label>
                <input 
                  type="text" 
                  value={estado.numero} 
                  disabled 
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Fecha</label>
                <input 
                  type="date" 
                  value={estado.fecha}
                  onChange={(e) => setEstado({...estado, fecha: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* Información del cliente */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Información del Cliente</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Nombre</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={cliente.nombre} 
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Empresa</label>
                <input 
                  type="text" 
                  name="empresa"
                  value={cliente.empresa} 
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={cliente.email} 
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                <input 
                  type="text" 
                  name="telefono"
                  value={cliente.telefono} 
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">Dirección</label>
                <input 
                  type="text" 
                  name="direccion"
                  value={cliente.direccion} 
                  onChange={handleClienteChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          {/* Items del estado */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">Detalle del Estado</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-32 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Fecha</th>
                    <th className="px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Descripción</th>
                    <th className="w-32 px-4 py-2 text-xs font-medium tracking-wider text-left text-gray-700 uppercase">Precio</th>
                    <th className="w-16 px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estado.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">
                        <input 
                          type="date" 
                          value={item.fecha || ''} 
                          onChange={(e) => handleItemChange(item.id, 'fecha', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <textarea 
                          value={item.descripcion || ''} 
                          onChange={(e) => handleItemChange(item.id, 'descripcion', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                          placeholder="Descripción del servicio"
                          rows={2}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input 
                          type="number" 
                          value={item.precio || ''} 
                          onChange={(e) => handleItemChange(item.id, 'precio', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={estado.items.length === 1}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={addItem}
                className="flex items-center text-blue-500 hover:text-blue-700"
              >
                <PlusCircle size={18} className="mr-1" /> Agregar ítem
              </button>
            </div>
            
            <div className="w-full mt-6 ml-auto md:w-64">
              <div className="flex justify-between py-2 text-lg font-bold border-t border-b border-gray-200">
                <span>Total:</span>
                <span>{formatMoney(estado.total)}</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => router.push('/admin/estados')}
              className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarEstado}
              disabled={guardando}
              className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-success hover:bg-green-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" /> 
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
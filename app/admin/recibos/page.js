// app/admin/recibos/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Edit, ArrowLeft, Download, Trash } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { use } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReciboPDF from '../../components/pdf/ReciboPDF';

export default function VerRecibo({ params }) {
  // Usar React.use para manejar params como una promesa
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recibo, setRecibo] = useState(null);

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  useEffect(() => {
    if (!id) return;

    // Verificar autenticación y cargar recibo
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // Cargar datos del recibo
          const reciboDoc = doc(db, 'recibos', id);
          const reciboSnapshot = await getDoc(reciboDoc);
          
          if (reciboSnapshot.exists()) {
            setRecibo({ id: reciboSnapshot.id, ...reciboSnapshot.data() });
          } else {
            alert('Recibo no encontrado.');
            router.push('/admin/recibos');
          }
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar recibo:', error);
          alert('Error al cargar los datos del recibo.');
          router.push('/admin/recibos');
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

  const handleDeleteRecibo = async () => {
    if (confirm('¿Está seguro de que desea eliminar este recibo?')) {
      try {
        await deleteDoc(doc(db, 'recibos', id));
        alert('Recibo eliminado exitosamente.');
        router.push('/admin/recibos');
      } catch (error) {
        console.error('Error al eliminar recibo:', error);
        alert('Error al eliminar el recibo.');
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
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
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

      {/* Navegación y controles */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Link
                href="/admin/dashboard"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                <Home size={16} className="mr-1" /> Dashboard
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <Link
                href="/admin/recibos"
                className="flex items-center mr-4 text-primary hover:underline"
              >
                Recibos
              </Link>
              <span className="mx-2 text-gray-500">/</span>
              <span className="text-gray-700">Detalles</span>
            </div>

            <div className="flex space-x-2">
              <Link
                href="/admin/recibos"
                className="flex items-center px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Link>
              <Link
                href={`/admin/recibos/editar/${id}`}
                className="flex items-center px-4 py-2 text-white transition-colors rounded-md bg-secondary hover:bg-blue-600"
              >
                <Edit size={18} className="mr-2" /> Editar
              </Link>
              <button
                onClick={handleDeleteRecibo}
                className="flex items-center px-4 py-2 text-white transition-colors bg-red-500 rounded-md hover:bg-red-600"
              >
                <Trash size={18} className="mr-2" /> Eliminar
              </button>
              <button
                title="Descargar PDF"
                className="flex px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark"
              >
                <PDFDownloadLink
                  document={<ReciboPDF recibo={recibo} />}
                  fileName={`${recibo.numero}.pdf`}
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
        </div>
      </div>

      {/* Vista previa estilo PDF */}
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-2xl mx-auto bg-white shadow-lg">
          {/* Encabezado compacto estilo PDF */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-blue-800">
            <div className="flex items-center">
              <div className="mr-3">
                {/* Logo placeholder */}
                <div className="flex items-center justify-center w-6 h-8 text-sm font-bold text-white bg-blue-800 rounded">
                  S
                </div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  <span className="text-blue-800">Sin</span>
                  <span className="text-blue-500">corp</span>
                </div>
                <div className="text-xs text-gray-600">Servicios Integrales</div>
              </div>
            </div>
            <div className="text-xs text-right text-gray-600">
              <div>CUIT: 20-24471842-7</div>
              <div>Tel: (351) 681 0777</div>
              <div>sincorpserviciosintegrales@gmail.com</div>
            </div>
          </div>

          {/* Título y número en la misma línea */}
          <div className="flex items-center justify-between px-8 py-5">
            <h1 className="text-2xl font-bold text-blue-800">RECIBO</h1>
            <div className="text-lg text-blue-800">N° {recibo.numero || ''}</div>
          </div>

          {/* Monto destacado */}
          <div className="px-8 py-2">
            <div className="p-4 text-xl font-bold text-center bg-gray-100 rounded">
              {formatCurrency(recibo.monto)}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="px-8 py-6 space-y-6">
            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-24 text-xs font-bold text-gray-700">RECIBÍ DE:</div>
                <div className="flex-1 text-xs text-black">{recibo.recibiDe || ''}</div>
              </div>
            </div>

            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-24 text-xs font-bold text-gray-700">LA SUMA DE:</div>
                <div className="flex-1 text-xs text-black">{recibo.cantidadLetras || ''}</div>
              </div>
            </div>

            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-24 text-xs font-bold text-gray-700">CONCEPTO:</div>
                <div className="flex-1 text-xs text-black">{recibo.concepto || ''}</div>
              </div>
            </div>

            <div className="pb-4 border-b border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-24 text-xs font-bold text-gray-700">FECHA:</div>
                <div className="flex-1 text-xs text-black">{formatDate(recibo.fecha)}</div>
              </div>
            </div>
          </div>

          {/* Sección de firmas */}
          <div className="flex justify-around px-8 py-12 mt-8">
            <div className="flex flex-col items-center w-2/5">
              {recibo.firma && (
                <div className="flex items-center justify-center w-32 h-16 mb-2 border border-gray-200 rounded bg-gray-50">
                  <img 
                    src={recibo.firma} 
                    alt="Firma" 
                    className="object-contain max-w-full max-h-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <span style={{display: 'none'}} className="text-xs text-gray-400">Firma no disponible</span>
                </div>
              )}
              <div className="w-full pt-1 border-t border-gray-800">
                <div className="mt-1 text-xs text-center text-gray-600">FIRMA</div>
              </div>
            </div>

            <div className="flex flex-col items-center w-2/5">
              <div className="flex items-end justify-center w-32 h-16 mb-2">
                {recibo.aclaracion && (
                  <div className="text-xs text-center">{recibo.aclaracion}</div>
                )}
              </div>
              <div className="w-full pt-1 border-t border-gray-800">
                <div className="mt-1 text-xs text-center text-gray-600">ACLARACIÓN</div>
              </div>
            </div>
          </div>

          {/* Pie de página */}
          <div className="px-8 py-4 text-xs text-center text-gray-500 border-t border-gray-200">
            <div>SINCORP Servicios Integrales - Av. Luciano Torrent 4800, 5000 - Córdoba</div>
          </div>
        </div>
      </div>
    </div>
  );
}
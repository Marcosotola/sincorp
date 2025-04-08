// app/admin/presupuestos/nuevo/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LogOut, Save, Download, Eye, PlusCircle, Trash2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { crearPresupuesto } from '../../../lib/firestore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PresupuestoPDF from '../../../components/pdf/PresupuestoPDF';

export default function NuevoPresupuesto() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Estado del formulario
    const [cliente, setCliente] = useState({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        direccion: ''
    });

    const [presupuesto, setPresupuesto] = useState({
        numero: `P-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        fecha: new Date().toISOString().split('T')[0],
        validez: '30 días',
        items: [
            { id: 1, descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }
        ],
        notas: 'Este presupuesto tiene una validez de 30 días a partir de la fecha de emisión.\nForma de pago: 50% anticipado, 50% contra entrega.',
        subtotal: 0,
        iva: 0,
        total: 0
    });

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

    const handleClienteChange = (e) => {
        const { name, value } = e.target;
        setCliente({ ...cliente, [name]: value });
    };

    const handleItemChange = (id, field, value) => {
        const updatedItems = presupuesto.items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'cantidad' || field === 'precioUnitario') {
                    updatedItem.subtotal = parseFloat(updatedItem.cantidad || 0) * parseFloat(updatedItem.precioUnitario || 0);
                }
                return updatedItem;
            }
            return item;
        });

        const subtotal = updatedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const iva = subtotal * 0.21;

        setPresupuesto({
            ...presupuesto,
            items: updatedItems,
            subtotal: subtotal,
            iva: iva,
            total: subtotal + iva
        });
    };

    const addItem = () => {
        const newId = Math.max(...presupuesto.items.map(item => item.id), 0) + 1;
        setPresupuesto({
            ...presupuesto,
            items: [
                ...presupuesto.items,
                { id: newId, descripcion: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }
            ]
        });
    };

    const removeItem = (id) => {
        if (presupuesto.items.length === 1) return;

        const updatedItems = presupuesto.items.filter(item => item.id !== id);
        const subtotal = updatedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const iva = subtotal * 0.21;

        setPresupuesto({
            ...presupuesto,
            items: updatedItems,
            subtotal: subtotal,
            iva: iva,
            total: subtotal + iva
        });
    };


    const handleGuardarPresupuesto = async () => {
        setGuardando(true);
        try {
            // Preparar datos del presupuesto
            const presupuestoData = {
                numero: presupuesto.numero,
                fecha: presupuesto.fecha,
                validez: presupuesto.validez,
                cliente: cliente,
                items: presupuesto.items,
                notas: presupuesto.notas,
                subtotal: presupuesto.subtotal,
                iva: presupuesto.iva,
                total: presupuesto.total,
                estado: 'Pendiente',
                usuarioCreador: user.email
            };

            // Guardar en Firestore
            await crearPresupuesto(presupuestoData);
            alert('Presupuesto guardado exitosamente');
            router.push('/admin/presupuestos');
        } catch (error) {
            console.error('Error al guardar el presupuesto:', error);
            alert('Error al guardar el presupuesto. Inténtelo de nuevo más tarde.');
        } finally {
            setGuardando(false);
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
                        <Link
                            href="/admin/presupuestos"
                            className="text-primary hover:underline flex items-center mr-4"
                        >
                            Presupuestos
                        </Link>
                        <span className="text-gray-500 mx-2">/</span>
                        <span className="text-gray-700">Nuevo Presupuesto</span>
                    </div>

                    <div className="flex space-x-2 mb-4">
                        <button
                            onClick={handleGuardarPresupuesto}
                            disabled={guardando}
                            className="bg-success text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" />
                            {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-light transition-colors flex items-center"
                        >
                            <Eye size={18} className="mr-2" /> Vista Previa
                        </button>
                        <button
                            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
                        >
                            <PDFDownloadLink
                                document={<PresupuestoPDF presupuesto={{ ...presupuesto, cliente }} />}
                                fileName={`${presupuesto.numero}.pdf`}
                                className={`bg-secondary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center ${!presupuesto.items[0].descripcion ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!presupuesto.items[0].descripcion}
                            >
                                {({ blob, url, loading, error }) =>
                                    loading ?
                                        <span><span className="animate-spin inline-block h-4 w-4 border-t-2 border-white rounded-full mr-2"></span> Generando PDF...</span> :
                                        <span><Download size={18} className="mr-2" /> Descargar PDF</span>
                                }
                            </PDFDownloadLink>
                        </button>
                    </div>
                </div>

                <h2 className="text-2xl font-montserrat font-bold mb-6 text-primary">
                    Nuevo Presupuesto
                </h2>

                <div className="grid grid-cols-1 gap-6">
                    {/* Información del presupuesto */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Información del Presupuesto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                <input
                                    type="text"
                                    value={presupuesto.numero}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                <input
                                    type="date"
                                    value={presupuesto.fecha}
                                    onChange={(e) => setPresupuesto({ ...presupuesto, fecha: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Validez</label>
                                <input
                                    type="text"
                                    value={presupuesto.validez}
                                    onChange={(e) => setPresupuesto({ ...presupuesto, validez: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información del cliente */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Información del Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={cliente.nombre}
                                    onChange={handleClienteChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                                <input
                                    type="text"
                                    name="empresa"
                                    value={cliente.empresa}
                                    onChange={handleClienteChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={cliente.email}
                                    onChange={handleClienteChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={cliente.telefono}
                                    onChange={handleClienteChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
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

                    {/* Items del presupuesto */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Detalle del Presupuesto</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Descripción</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24">Cantidad</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">Precio Unit.</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">Subtotal</th>
                                        <th className="px-4 py-2 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {presupuesto.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={item.descripcion}
                                                    onChange={(e) => handleItemChange(item.id, 'descripcion', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                    placeholder="Descripción del servicio"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={item.cantidad}
                                                    onChange={(e) => handleItemChange(item.id, 'cantidad', parseInt(e.target.value) || 0)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={item.precioUnitario}
                                                    onChange={(e) => handleItemChange(item.id, 'precioUnitario', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-gray-700 font-medium">
                                                ${item.subtotal ? item.subtotal.toFixed(2) : '0.00'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                    disabled={presupuesto.items.length === 1}
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

                        <div className="mt-6 ml-auto w-full md:w-64">
                            <div className="flex justify-between py-2 border-t border-gray-200">
                                <span className="text-gray-700">Subtotal:</span>
                                <span className="font-medium">${presupuesto.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-gray-200">
                                <span className="text-gray-700">IVA (21%):</span>
                                <span className="font-medium">${presupuesto.iva.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-b border-gray-200 text-lg font-bold">
                                <span>Total:</span>
                                <span>${presupuesto.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notas adicionales */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Notas Adicionales</h3>
                        <textarea
                            value={presupuesto.notas}
                            onChange={(e) => setPresupuesto({ ...presupuesto, notas: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                            placeholder="Información adicional, términos y condiciones, etc."
                        ></textarea>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => router.push('/admin/presupuestos')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleGuardarPresupuesto}
                            disabled={guardando}
                            className="bg-success text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                        >
                            <Save size={18} className="mr-2" />
                            {guardando ? 'Guardando...' : 'Guardar Presupuesto'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
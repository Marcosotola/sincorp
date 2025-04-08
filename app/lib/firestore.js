// lib/firestore.js
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';

// Colección de presupuestos
const presupuestosCollection = collection(db, 'presupuestos');

// Crear un nuevo presupuesto
export const crearPresupuesto = async (presupuestoData) => {
  try {
    const docRef = await addDoc(presupuestosCollection, {
      ...presupuestoData,
      fechaCreacion: new Date(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error al crear presupuesto:', error);
    throw error;
  }
};

// Obtener todos los presupuestos
export const obtenerPresupuestos = async () => {
  try {
    const q = query(presupuestosCollection, orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    throw error;
  }
};

// Obtener un presupuesto por ID
export const obtenerPresupuestoPorId = async (id) => {
  try {
    const docRef = doc(db, 'presupuestos', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Presupuesto no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    throw error;
  }
};

// Actualizar un presupuesto
export const actualizarPresupuesto = async (id, datosActualizados) => {
  try {
    const docRef = doc(db, 'presupuestos', id);
    await updateDoc(docRef, {
      ...datosActualizados,
      fechaActualizacion: new Date()
    });
    return { id };
  } catch (error) {
    console.error('Error al actualizar presupuesto:', error);
    throw error;
  }
};

// Eliminar un presupuesto
export const eliminarPresupuesto = async (id) => {
  try {
    const docRef = doc(db, 'presupuestos', id);
    await deleteDoc(docRef);
    return { id };
  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    throw error;
  }
};
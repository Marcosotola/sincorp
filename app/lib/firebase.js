// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCfZjvzab67TlMv_rc2jr2NHEINwnFxwVY",
    authDomain: "sincorp-deb4b.firebaseapp.com",
    projectId: "sincorp-deb4b",
    storageBucket: "sincorp-deb4b.firebasestorage.app",
    messagingSenderId: "170765298334",
    appId: "1:170765298334:web:b89140b3334e28e8a7698f"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
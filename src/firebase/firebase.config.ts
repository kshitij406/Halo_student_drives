import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

console.log('🔥 Firebase API Key Loaded:', process.env.NEXT_PUBLIC_FIREBASE_API);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API, // ✅ UPDATED HERE
  authDomain: 'student-rides-bb77e.firebaseapp.com',
  projectId: 'student-rides-bb77e',
  storageBucket: 'student-rides-bb77e.appspot.com',
  messagingSenderId: '856900955842',
  appId: '1:856900955842:web:c1ff508d982cf0b297155b',
  measurementId: 'G-XNZZSSV1KG',
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, storage, googleProvider };

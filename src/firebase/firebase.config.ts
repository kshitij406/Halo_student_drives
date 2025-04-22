import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Add this line to debug
console.log("🔥 Firebase API Key Loaded:", process.env.FIREBASE_API);

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API,
  authDomain: 'student-rides-bb77e.firebaseapp.com',
  projectId: 'student-rides-bb77e',
  storageBucket: 'student-rides-bb77e.appspot.com',
  messagingSenderId: '856900955842',
  appId: '1:856900955842:web:c1ff508d982cf0b297155b',
  measurementId: 'G-XNZZSSV1KG'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

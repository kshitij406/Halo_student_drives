// src/firebase/firebase.config.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import dotenv from 'dotenv';
dotenv.config();
// ✅ Your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API,
  authDomain: "student-rides-bb77e.firebaseapp.com",
  projectId: "student-rides-bb77e",
  storageBucket: "student-rides-bb77e.firebasestorage.app",
  messagingSenderId: "856900955842",
  appId: "1:856900955842:web:c1ff508d982cf0b297155b",
  measurementId: "G-XNZZSSV1KG"
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

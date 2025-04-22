'use client';

import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebase.config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = query(
        collection(db, 'auth'),
        where('username', '==', username),
        where('password', '==', password)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert('Login successful!');
      } else {
        alert('Invalid Credentials');
      }
      router.push('/login');
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <Image
        className="mx-auto pt-8 mt-20"
        src="/transparent-white-logo.png"
        alt="Logo"
        width={200}
        height={200}
      />
      <form onSubmit={handleSubmit}>
        <div>
          <div className="mb-4 text-center">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-80 border border-gray-300 p-2 rounded text-white"
              required
            />
          </div>
          <div className="mb-4 text-center">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-80 border border-gray-300 p-2 rounded text-white"
              required
            />
          </div>
          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-yellow-500 text-black font-bold px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

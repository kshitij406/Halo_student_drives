'use client';

import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import { useState } from 'react';
import { db } from '@/firebase/firebase.config';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import {query, where, getDocs } from 'firebase/firestore';
export default function Login(){
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
            const q = query(
                collection(db, 'auth'),
                where('username', '==', username),
                where('password', '==', password)
              );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty){
                alert('Login successful!');}
            else{
                alert('Invalid Credentials');
            }
      router.push('/');}
      catch (error) {
      console.error(error);
      alert('Something went wrong.');
            
            }
        };
    return(
        <main className="p-6 max-w-xl mx-auto">
            <h1 className='text-2xl mb-2 text-center text-#808080'>
                Login to access your profile</h1>
            <form onSubmit={handleSubmit}></form>
            <div>
                {/* Name */}
        <div className="mb-4">
          <label className="block font-medium mb-1 text-center pt-10"></label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block font-medium mb-1 text-center"></label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
        </div>
            </div>
            
            </main>
    )
}

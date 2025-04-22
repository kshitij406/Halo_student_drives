'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
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
      router.push('/login');}
      catch (error) {
      console.error(error);
      alert('Something went wrong.');
            
            }
        };
    return(
        <main className="p-6 max-w-xl mx-auto">
            
            <Image className = " mx-auto pt-25" src = "/transparent-white-logo.png" 
            alt = "Logo" 
            width = {200} height={200}></Image>
            <form onSubmit={handleSubmit}>
            <div>
        <div className="mb-4 text-center ">
          <label className="block font-medium"></label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-80 border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div className="mb-4 text-center">
          <label className="block font-medium mb-1"></label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password
            "
            className="w-80 border border-gray-300 p-2 rounded"
            required
          />
        </div>
        <div className='text-center pt-4'>
        <button
          type="submit"
          className=" bg-yellow-500 text-black text-bold px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          Submit
        </button>
        </div>
            </div>
            </form>
            </main>
    )
}

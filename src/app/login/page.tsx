'use client';

import { useState } from 'react';
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/firebase/firebase.config';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, username, password);
      alert('Login successful!');
      router.push('/');
    } catch (error: any) {
      console.error(error);
      alert('Invalid credentials or something went wrong.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert('Google sign-in successful!');
      router.push('/');
    } catch (error: any) {
      console.error(error);
      alert('Google sign-in failed.');
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <Image
        className="mx-auto pt-25"
        src="/transparent-white-logo.png"
        alt="Logo"
        width={200}
        height={200}
      />
      <form onSubmit={handleSubmit}>
        <div>
          <div className="mb-4 text-center">
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
              placeholder="Password"
              className="w-80 border border-gray-300 p-2 rounded"
              required
            />
          </div>
          <div className="flex justify-center gap-4 pt-6">
          <button
            type="submit"
            className="bg-yellow-500 text-black text-bold px-4 py-2 rounded hover:bg-yellow-600 transition"
          >
            Submit
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="bg-white border border-gray-400 px-4 py-2 rounded hover:bg-gray-100 transition flex items-center"
          >
            <Image
              src="/google-icon.svg"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            <span className="text-black">Sign in with Google</span>
          </button>
        </div>

        </div>
      </form>
    </main>
  );
}

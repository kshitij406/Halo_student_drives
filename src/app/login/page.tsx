'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/firebase/firebase.config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { useUser } from '@/context/Usercontext';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    const existingUser = localStorage.getItem('user');
    if (existingUser) router.push('/');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userInfo = {
        username: user.displayName || user.email || '',
        email: user.email || '',
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        alert('Google sign-in failed: ' + error.message);
      } else {
        console.error(error);
        alert('Google sign-in failed.');
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set username as displayName
      await updateProfile(user, { displayName: username });

      const userInfo = {
        username: username,
        email: user.email || '',
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        alert('Google sign-in failed: ' + error.message);
      } else {
        console.error(error);
        alert('Google sign-in failed.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userInfo = {
        username: user.displayName || user.email || '',
        email: user.email || '',
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        alert('Google sign-in failed: ' + error.message);
      } else {
        console.error(error);
        alert('Google sign-in failed.');
      }
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto text-center">
      <Image
        className="mx-auto mb-4"
        src="/transparent-white-logo.png"
        alt="Logo"
        width={150}
        height={150}
      />

      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            tab === 'login' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'
          }`}
          onClick={() => setTab('login')}
        >
          Login
        </button>
        <button
          className={`px-4 py-2 rounded ${
            tab === 'signup' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'
          }`}
          onClick={() => setTab('signup')}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-80 border border-gray-300 p-2 rounded text-white"
          required
        />

        {tab === 'signup' && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-80 border border-gray-300 p-2 rounded text-white"
            required
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-80 border border-gray-300 p-2 rounded text-white"
          required
        />

        <button
          type="submit"
          className="w-80 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded"
        >
          {tab === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>

      <div className="pt-6">
        <button
          onClick={handleGoogleSignIn}
          className="bg-white border border-gray-400 px-4 py-2 rounded hover:bg-gray-100 transition flex items-center mx-auto"
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
    </main>
  );
}
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/firebase.config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userRef = collection(db, 'auth');

    try {
      if (mode === 'login') {
        const qUsername = query(
          userRef,
          where('username', '==', usernameOrEmail),
          where('password', '==', password)
        );
        const qEmail = query(
          userRef,
          where('email', '==', usernameOrEmail),
          where('password', '==', password)
        );

        const [usernameSnapshot, emailSnapshot] = await Promise.all([
          getDocs(qUsername),
          getDocs(qEmail),
        ]);

        if (!usernameSnapshot.empty || !emailSnapshot.empty) {
          alert('Login successful!');
          router.push('/');
        } else {
          alert('Invalid username/email or password');
        }
      } else {
        // Signup validation
        if (!validateEmail(email)) {
          alert('Please enter a valid email address');
          return;
        }

        const existingUser = await getDocs(
          query(userRef, where('username', '==', username))
        );

        if (!existingUser.empty) {
          alert('Username already taken');
          return;
        }

        await addDoc(userRef, {
          username,
          email,
          password,
        });

        alert('Account created! Please log in.');
        setMode('login');
        setUsername('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <Image
        className="mx-auto pt-5"
        src="/transparent-white-logo.png"
        alt="Logo"
        width={200}
        height={200}
      />

      <div className="flex justify-center mb-6 mt-4">
        <button
          onClick={() => setMode('login')}
          className={`px-4 py-2 rounded-l ${
            mode === 'login'
              ? 'bg-yellow-500 text-black font-semibold'
              : 'bg-gray-800 text-white'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`px-4 py-2 rounded-r ${
            mode === 'signup'
              ? 'bg-yellow-500 text-black font-semibold'
              : 'bg-gray-800 text-white'
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'login' ? (
          <>
            <div className="mb-4 text-center">
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Username or Email"
                className="w-80 border border-gray-300 p-2 rounded bg-white text-black"
                required
              />
            </div>
            <div className="mb-4 text-center">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-80 border border-gray-300 p-2 rounded bg-white text-black"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 text-center">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-80 border border-gray-300 p-2 rounded bg-white text-black"
                required
              />
            </div>
            <div className="mb-4 text-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-80 border border-gray-300 p-2 rounded bg-white text-black"
                required
              />
            </div>
            <div className="mb-4 text-center">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-80 border border-gray-300 p-2 rounded bg-white text-black"
                required
              />
            </div>
          </>
        )}

        <div className="text-center pt-4">
          <button
            type="submit"
            className="bg-yellow-500 text-black font-bold px-4 py-2 rounded hover:bg-yellow-600 transition"
          >
            {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </div>
      </form>

      <div className="text-sm text-center mt-6 text-gray-400">
        {mode === 'signup' ? (
          <p>
            Already have an account?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-yellow-400 underline"
            >
              Login here
            </button>
          </p>
        ) : (
          <p>
            Don’t have an account?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-yellow-400 underline"
            >
              Sign up
            </button>
          </p>
        )}
        <p className="mt-2 italic text-xs text-gray-500">
          You only need to log in if you want to leave a review or register as a driver.
        </p>
      </div>
    </main>
  );
}

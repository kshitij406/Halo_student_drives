'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { auth, googleProvider } from '@/firebase/firebase.config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { useUser } from '@/context/Usercontext';
import LoadingScreen from '../components/LoadingScreen';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // 👈 New

  const router = useRouter();
  const { setUser } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    const existingUser = localStorage.getItem('user');
    if (existingUser) {
      router.push('/');
    } else {
      const timeout = setTimeout(() => {
        setPageLoading(false); // Simulate a smooth fade-in
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [router]);

  if (pageLoading) return <LoadingScreen show={loading} /> ; 

  const determineRole = (email: string, password?: string): 'user' | 'dev' => {
    return (
      email === process.env.NEXT_PUBLIC_DEV_USERNAME &&
      password === process.env.NEXT_PUBLIC_DEV_PASSWORD
    )
      ? 'dev'
      : 'user';
  };

  const delayedRedirect = (callback: () => void) => {
    setTimeout(() => {
      callback();
      setLoading(false);
      router.push('/');
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const role = determineRole(email, password);
      const userInfo = {
        username: user.displayName || user.email || '',
        email: user.email || '',
        role,
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      delayedRedirect(() => {});
    } catch (error: unknown) {
      if (error instanceof Error) alert('Login failed: ' + error.message);
      else alert('Login failed.');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      const role = determineRole(email, password);
      const userInfo = {
        username,
        email: user.email || '',
        role,
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      delayedRedirect(() => {});
    } catch (error: unknown) {
      if (error instanceof Error) alert('Signup failed: ' + error.message);
      else alert('Signup failed.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const role = determineRole(user.email || '');
      const userInfo = {
        username: user.displayName || user.email || '',
        email: user.email || '',
        role,
      };
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      delayedRedirect(() => {});
    } catch (error: unknown) {
      if (error instanceof Error) alert('Google sign-in failed: ' + error.message);
      else alert('Google sign-in failed.');
      setLoading(false);
    }
  };

  // 👇 Tab switch with mini loading animation
  const handleSignupClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setTab('signup');
      setLoading(false);
    }, 700);
  };

  const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setTab('login');
      setLoading(false);
    }, 700);
  };

  return (
    <>
      <LoadingScreen show={loading} />
      <main className="p-6 max-w-xl mx-auto text-center">
        <Image
          className="mx-auto mb-4 mt-30"
          src="/transparent-white-logo.png"
          alt="Logo"
          width={150}
          height={150}
        />

        {/* 👇 Form transition wrapper */}
        <div className="transition-opacity duration-500 ease-in-out" key={tab}>
          <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-80 border border-gray-300 p-2 rounded text-white bg-black/10"
              required
            />

            {tab === 'signup' && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-80 border border-gray-300 p-2 rounded text-white bg-black/10"
                required
              />
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-80 border border-gray-300 p-2 rounded text-white bg-black/10"
              required
            />

            <button
              type="submit"
              className="w-80 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 rounded"
            >
              {tab === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>

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

        {tab === 'login' && (
          <div className="pt-6">
            <a
              href="#"
              onClick={handleSignupClick}
              className="text-yellow-500 font-semibold hover:bg-yellow-500 hover:text-black rounded-4xl px-4 py-2 transition duration-200"
            >
              Don’t have an account? Sign up here
            </a>
          </div>
        )}

        {tab === 'signup' && (
          <div className="pt-6">
            <a
              href="#"
              onClick={handleLoginClick}
              className="text-yellow-500 font-semibold hover:bg-yellow-500 hover:text-black rounded-4xl px-4 py-2 transition duration-200"
            >
              Already have an account? Log in here
            </a>
          </div>
        )}
      </main>
    </>
  );
}

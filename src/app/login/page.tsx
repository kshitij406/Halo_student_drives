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
import LoadingScreen from '../components/LoadingScreen';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    const existingUser = localStorage.getItem('user');
    if (existingUser) {
      router.push('/');
      return;
    }
    const timeout = setTimeout(() => setPageLoading(false), 400);
    return () => clearTimeout(timeout);
  }, [router]);

  function determineRole(email: string, password?: string): 'user' | 'dev' {
    return email === process.env.NEXT_PUBLIC_DEV_USERNAME &&
      password === process.env.NEXT_PUBLIC_DEV_PASSWORD
      ? 'dev'
      : 'user';
  }

  function storeUser(info: { username: string; email: string; role: 'user' | 'dev' }) {
    setUser(info);
    localStorage.setItem('user', JSON.stringify(info));
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 600);
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      storeUser({
        username: cred.user.displayName || cred.user.email || '',
        email: cred.user.email || '',
        role: determineRole(email, password),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: username });
      storeUser({
        username,
        email: cred.user.email || '',
        role: determineRole(email, password),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed.');
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      storeUser({
        username: u.displayName || u.email || '',
        email: u.email || '',
        role: determineRole(u.email || ''),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      setLoading(false);
    }
  }

  return (
    <>
      <LoadingScreen show={pageLoading || loading} />

      {!pageLoading && (
        <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12">
          <div className="card w-full max-w-sm p-8">
            {/* Logo */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: 'var(--yellow)' }}
              >
                <Image
                  src="/transparent_logo.png"
                  alt="Halo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold">Welcome to Halo</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                  {tab === 'login' ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="mb-6 flex rounded-xl p-1"
              style={{ background: 'var(--surface-2)' }}
            >
              {(['login', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors capitalize"
                  style={
                    tab === t
                      ? { background: 'var(--yellow)', color: '#000' }
                      : { color: 'var(--muted)' }
                  }
                >
                  {t === 'login' ? 'Login' : 'Sign up'}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-4 rounded-lg px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={tab === 'login' ? handleLogin : handleSignup} className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                autoComplete="email"
              />
              {tab === 'signup' && (
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  required
                  autoComplete="username"
                />
              )}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="submit" className="btn-primary w-full py-2.5">
                {tab === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>or</span>
              <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              className="btn-ghost w-full gap-2.5"
            >
              <Image src="/google-icon.svg" alt="Google" width={18} height={18} />
              Continue with Google
            </button>
          </div>
        </main>
      )}
    </>
  );
}

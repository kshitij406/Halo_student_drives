'use client';

import { useUser } from '@/context/Usercontext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user) router.push('/login');
  }, [user, router]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (!isClient || !user) return null;

  const initials = user.username
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <div className="card p-8 text-center">
        {/* Avatar */}
        <div
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-black"
          style={{ background: 'var(--yellow)' }}
        >
          {initials}
        </div>

        <h1 className="text-xl font-bold">{user.username}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{user.email}</p>

        {user.role === 'dev' && (
          <span
            className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'rgba(250,204,21,0.15)', color: 'var(--yellow)' }}
          >
            Dev Account
          </span>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/add-driver" className="btn-primary w-full justify-center py-2.5">
            Register as a Driver
          </Link>
          <button
            onClick={handleLogout}
            className="btn-ghost w-full py-2.5"
            style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

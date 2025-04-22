'use client';

import { useUser } from '@/context/Usercontext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (!isClient || !user) return null;

  return (
    <main className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">👤 Profile</h1>

      <div className="bg-gray-900 p-4 rounded shadow space-y-3">
        <p>
          <span className="font-semibold text-yellow-400">Username:</span> {user.username}
        </p>
        <p>
          <span className="font-semibold text-yellow-400">Email:</span> {user.email}
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/Usercontext';
import AddDriverForm from './AddDriverForm';

export default function AddDriverPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!isClient || !user) return null;

  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Add Driver</h1>
      <AddDriverForm />
    </main>
  );
}

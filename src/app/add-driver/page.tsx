'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/Usercontext';
import AddDriverForm from './AddDriverForm';
import LoadingScreen from '../components/LoadingScreen';

export default function AddDriverPage() {
  const { user } = useUser();
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true); // controls initial loader

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user) {
        router.push('/login');
      } else {
        setPageLoading(false); 
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [user, router]);

  return (
    <>
      <LoadingScreen show={pageLoading} />
      {!pageLoading && (
        <main className="p-6 text-white">
          <h1 className="text-2xl font-bold mb-4">Add Driver</h1>
          <AddDriverForm />
        </main>
      )}
    </>
  );
}

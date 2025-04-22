'use client';

import { Toaster } from 'sonner';
import dynamic from 'next/dynamic';
import { UserProvider } from '@/context/Usercontext';

const Header = dynamic(() => import('./components/Header'), { ssr: false });

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <body className="bg-black text-white flex flex-col">
        <Header />
        <Toaster position="top-center" richColors />
        <main className="min-h-screen flex-1 overflow-hidden">{children}</main>
        <footer className="bg-yellow-500 py-2 text-black font-bold text-center">
          Made by Harshil Patel & Kshitij Jha
        </footer>
      </body>
    </UserProvider>
  );
}

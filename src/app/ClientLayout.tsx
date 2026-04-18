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
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <Header />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            },
          }}
        />
        <main className="flex-1">{children}</main>
        <footer
          className="py-4 text-center text-sm"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <span style={{ color: 'var(--muted)' }}>
            Halo &mdash; Made by{' '}
            <a
              href="https://github.com/harshilpatel05"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--yellow)' }}
              className="hover:underline"
            >
              Harshil
            </a>{' '}
            &amp;{' '}
            <a
              href="https://github.com/kshitij406"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--yellow)' }}
              className="hover:underline"
            >
              Kshitij
            </a>
          </span>
        </footer>
      </div>
    </UserProvider>
  );
}

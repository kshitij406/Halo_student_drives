'use client';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  show: boolean;
}

export default function LoadingScreen({ show }: LoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!show) {
      const timeout = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timeout);
    } else {
      setShouldRender(true);
    }
  }, [show]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 transition-opacity duration-400 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'var(--bg)' }}
    >
      {/* Logo mark */}
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black text-black"
        style={{ background: 'var(--yellow)' }}
      >
        H
      </div>
      {/* Spinner bar */}
      <div
        className="h-0.5 w-24 overflow-hidden rounded-full"
        style={{ background: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full animate-pulse"
          style={{ background: 'var(--yellow)', width: '60%' }}
        />
      </div>
    </div>
  );
}

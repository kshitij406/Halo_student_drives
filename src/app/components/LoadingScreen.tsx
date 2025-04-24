'use client';
import { useEffect, useState } from 'react';
interface LoadingScreenProps {
  show: boolean;
}

export default function LoadingScreen({ show }: LoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!show) {
      const timeout = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timeout);
    } else {
      setShouldRender(true);
    }
  }, [show]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="h-12 w-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

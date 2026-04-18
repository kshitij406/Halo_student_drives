'use client';

import Link from 'next/link';
import Image from 'next/image';
import NavLinks from './NavLinks';

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(8, 8, 8, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="h-9 w-9 overflow-hidden rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--yellow)' }}
          >
            <Image
              src="/transparent_logo.png"
              alt="Halo"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <span className="text-lg font-bold tracking-tight">Halo</span>
        </Link>

        <NavLinks />
      </div>
    </header>
  );
}

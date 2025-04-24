'use client';

import Link from 'next/link';
import Image from 'next/image';
import NavLinks from './NavLinks';

export default function Header() {
  return (
    <nav className="bg-yellow-400 text-black px-4 py-3 shadow-md flex justify-between items-center">
      <Link href="/" className="text-2xl font-extrabold tracking-tight hover:opacity-90">
        <div className="flex items-center gap-3">
          <Image
            src="/transparent_logo.png"
            alt="Halo Logo"
            width={48}
            height={48}
            className="rounded"
          />
          <span className="text-black font-bold">Halo</span>
        </div>
      </Link>

      <NavLinks />
    </nav>
  );
}

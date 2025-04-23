'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '../../context/Usercontext';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, setUser } = useUser();
  const pathname = usePathname();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const linkClass =
    'px-3 py-2 transition-all duration-200 rounded-xl text-sm sm:text-base font-medium';

  const getLinkStyle = (href: string) => {
    return pathname === href
      ? `${linkClass} bg-black text-white`
      : `${linkClass} hover:bg-black hover:text-white`;
  };

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

      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/" className={getLinkStyle('/')}>
          Home
        </Link>

        {!user ? (
          <Link href="/login" className={getLinkStyle('/login')}>
            Login
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className={`${linkClass} hover:bg-red-600 hover:text-white`}
          >
            Logout
          </button>
        )}

        <Link href="/add-driver" className={getLinkStyle('/add-driver')}>
          Drive
        </Link>
      </div>
    </nav>
  );
}

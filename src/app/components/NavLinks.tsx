'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../../context/Usercontext';

export default function NavLinks() {
  const { user, setUser } = useUser();
  const pathname = usePathname();

  const linkClass =
    'px-3 py-2 transition-all duration-200 rounded-xl text-sm sm:text-base font-bold';

  const getLinkStyle = (href: string) => {
    return pathname === href
      ? `${linkClass} bg-black text-white`
      : `${linkClass} text-black hover:bg-black hover:text-white`;
  };

  return (
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
          onClick={() => {
            setUser(null);
            localStorage.removeItem('user');
          }}
          className="px-3 py-2 rounded-xl text-sm sm:text-base font-bold text-black hover:bg-red-600 hover:text-white transition"
        >
          Logout
        </button>
      )}

      <Link href="/add-driver" className={getLinkStyle('/add-driver')}>
        Drive
      </Link>
    </div>
  );
}

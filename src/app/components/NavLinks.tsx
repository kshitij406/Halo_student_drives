'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../../context/Usercontext';

export default function NavLinks() {
  const { user, setUser } = useUser();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const linkStyle = (href: string) =>
    `px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
      isActive(href)
        ? 'text-black'
        : 'hover:text-white'
    }`;

  return (
    <nav className="flex items-center gap-1">
      <Link
        href="/"
        className={linkStyle('/')}
        style={isActive('/') ? { background: 'var(--yellow)', color: '#000' } : { color: 'var(--muted)' }}
      >
        Home
      </Link>

      <Link
        href="/add-driver"
        className={linkStyle('/add-driver')}
        style={isActive('/add-driver') ? { background: 'var(--yellow)', color: '#000' } : { color: 'var(--muted)' }}
      >
        Drive
      </Link>

      {!user ? (
        <Link
          href="/login"
          className="ml-2 btn-primary text-sm px-4 py-1.5"
        >
          Login
        </Link>
      ) : (
        <div className="flex items-center gap-2 ml-2">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: 'var(--muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-black"
              style={{ background: 'var(--yellow)' }}
            >
              {user.username?.[0]?.toUpperCase() ?? '?'}
            </span>
            {user.username?.split(' ')[0] ?? 'Me'}
          </Link>
          <button
            onClick={() => {
              setUser(null);
              localStorage.removeItem('user');
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ color: 'var(--muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

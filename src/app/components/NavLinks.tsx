'use client';

import Link from 'next/link';
import { useUser } from '../../context/Usercontext';

export default function NavLinks() {
  const { user, setUser } = useUser();

  return (
    <div className="flex items-center">
      <Link
        href="/"
        className="block h-full px-4 py-2 transition-transform duration-300 ease-in-out transform hover:bg-black hover:text-white hover:scale-110 hover:rounded-3xl"
      >
        Home
      </Link>

      {!user ? (
        <Link
          href="/login"
          className="block h-full px-4 py-2 transition-transform duration-300 ease-in-out transform hover:bg-black hover:text-white hover:scale-110 hover:rounded-3xl"
        >
          Login
        </Link>
      ) : (
        <>
          <button
            onClick={() => {
              setUser(null);
              localStorage.removeItem('user');
            }}
            className="block h-full px-4 py-2 transition-transform duration-300 ease-in-out transform hover:bg-red-600 hover:text-white hover:scale-110 hover:rounded-3xl"
          >
            Logout
          </button>
        </>
      )}

      <Link
        href="/add-driver"
        className="block h-full px-4 py-2 mr-3 transition-transform duration-300 ease-in-out transform hover:bg-black hover:text-white hover:scale-110 hover:rounded-3xl"
      >
        Drive
      </Link>
    </div>
  );
}

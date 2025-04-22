'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '../../context/Usercontext';

export default function Header() {
  const { user, setUser } = useUser();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <nav className="bg-yellow-500 text-black sm:text-sm md:text-base lg:text-lg font-bold py-2 shadow-md flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">
        <div className="flex items-center">
          <Image
            className="pr-2 pl-4"
            src="/transparent_logo.png"
            alt="Logo"
            width={70}
            height={70}
          />
          Peer Rides
        </div>
      </Link>

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
            <span className="px-4 py-2 text-white">Hi, {user.username}</span>
            <button
              onClick={handleLogout}
              className="block h-full px-4 py-2 text-red-400 hover:text-red-600 hover:underline"
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
    </nav>
  );
}
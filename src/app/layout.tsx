import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Student Rides',
  description: 'A student driver contact app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* Top Navbar */}
        <nav className="bg-yellow-500 text-black font-bold py-3 shadow-md flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
          <div className="flex items-center">
            <Image className = "pr-2" src = "/transparent_logo.png" alt = "Logo" width = {50} height={50}></Image>
            Peer Rides
            </div>
          </Link>
          <div className="space-x-4 pr-10 ">
            <Link href="/" className="w-full transform transition duration-300 
            ease-in-out hover:bg-black hover:text-white 
             hover:scale-105">
              Home
            </Link>
            <Link href="/add-driver" className="w-full transform transition duration-300 
            ease-in-out hover:bg-black hover:text-white 
             hover:scale-105">
              Add Driver
            </Link>

          </div>
        </nav>

        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

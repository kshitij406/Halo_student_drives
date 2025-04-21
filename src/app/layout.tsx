import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

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
        <nav className="bg-yellow-500 text-black px-6 py-3 shadow-md flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Peer Rides
          </Link>
          <div className="space-x-4">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/add-driver" className="hover:underline">
              Add Driver
            </Link>
          </div>
        </nav>

        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

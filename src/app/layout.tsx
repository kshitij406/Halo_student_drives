import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { UserProvider } from '../context/Usercontext';
import Header from './components/Header';

export const metadata: Metadata = {
  title: 'Peer Rides',
  description: 'A student driver contact app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white flex flex-col">
        <UserProvider>
          <Header />

          <main className="min-h-screen flex-1 overflow-hidden">{children}</main>

          <nav className="bg-yellow-500 py-2 text-black font-bold">
            <div className="text-center">
              Made by{' '}
              <Link
                href="https://www.linkedin.com/in/harshilpatel05/"
                className="text-black font-bold pr-1 hover:underline"
              >
                Harshil Patel
              </Link>
              &nbsp; &amp; &nbsp;
              <Link
                href="https://www.linkedin.com/in/kshitij-jha2006/"
                className="text-black font-bold pl-1 hover:underline"
              >
                Kshitij Jha
              </Link>
            </div>
          </nav>
        </UserProvider>
      </body>
    </html>
  );
}

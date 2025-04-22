import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';

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
        <nav className="bg-yellow-500 text-black sm:text-sm md:text-base lg:text-lg font-bold py-2 shadow-md flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
          <div className="flex items-center">
            <Image className = "pr-2 pl-4" src = "/transparent_logo.png" alt = "Logo" width = {70} height={70}></Image>
            Peer Rides
            </div>
          </Link>
          <div className="flex items-center">
            <Link href="/" className="block  h-full 
            px-4 py-2 transition-transform duration-300 ease-in-out transform
             hover:bg-black hover:text-white hover:scale-110 hover:rounded-3xl">
              Home
            </Link>
            <Link href="/login" className="block h-full 
            px-4 py-2 transition-transform duration-300 ease-in-out transform
             hover:bg-black hover:text-white hover:scale-110 hover:rounded-3xl">
              Login
            </Link>
            <Link href="/add-driver" className="block h-full 
            px-4 py-2 mr-3 transition-transform duration-300 ease-in-out transform
             hover:bg-black hover:text-white hover:scale-110 hover:rounded-3xl">
              Drive
            </Link>

          </div>
        </nav>

        <main className="min-h-screen flex-1 overflow-hidden">{children}</main>
        <nav className="bg-yellow-500 py-2 text-black font-bold">
          <div className=" text-center">
            Made by <Link href="https://www.linkedin.com/in/harshilpatel05/" 
            className='text-black font-bold pr-1 hover:underline'>Harshil Patel</Link>
             &
             <Link href="https://www.linkedin.com/in/kshitij-jha2006/" 
            className='text-black font-bold pl-1 hover:underline'>Kshitij Jha</Link>
            </div>
            </nav>
      </body>
    </html>
  );
}

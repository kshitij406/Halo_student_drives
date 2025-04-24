import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Halo',
  description: 'A student driver finding app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}

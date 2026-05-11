import { ReactNode } from 'react';
import { Viewport } from 'next';
import SessionProvider from './SessionProvider';
import './globals.css';

export const metadata = {
  title: 'V.Two Hardware Inventory',
  description: 'Report V.Two-owned hardware in your possession',
};

export const viewport: Viewport = {
  themeColor: '#7c6fff',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

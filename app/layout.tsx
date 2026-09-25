import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Hop · Amara Atelier',
  description: 'Hop — an analyst built into every page of a small fashion business dashboard. Prototype.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}

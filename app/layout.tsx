import type { Metadata, Viewport } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';

const display = Inter_Tight({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Xiaomi Ecosystem 2026 — Concept by Kazzi',
  authors: [{ name: 'Kazzi' }],
  creator: 'Kazzi',
  description:
    'An immersive concept showcase for Xiaomi 18 Pro, Xiaomi 18 Fold, Xiaomi Pad 9 and the HyperOS ecosystem. Fan project, not affiliated with Xiaomi.',
};

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}

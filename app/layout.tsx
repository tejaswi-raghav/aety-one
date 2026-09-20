import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ÆTY ONE® — DROP 01 / INITIAL CONDITIONS',
  description: 'ÆTY ONE experimental streetwear. DROP 01 — Initial Conditions. No permanent form.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

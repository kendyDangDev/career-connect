import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Providers } from '@/components/providers/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CareerConnect - Find Your Dream Job or Perfect Candidate',
  description:
    'CareerConnect is a modern recruitment platform connecting talented professionals with their dream careers and helping employers find the perfect candidates.',
  keywords: 'jobs, careers, recruitment, hiring, employment, job search, candidates, employers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col">
            {/* <Header /> */}
            <main className="flex-grow">{children}</main>
            {/* <Footer /> */}
          </div>
        </Providers>
      </body>
    </html>
  );
}

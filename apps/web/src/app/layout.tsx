import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Providers } from '@/components/providers/providers';
import CandidateHomeNav from '@/components/candidate/home/CandidateHomeNav';

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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <CandidateHomeNav />
            {/* <Header /> */}
            <main className="flex-grow">{children}</main>
            {/* <Footer /> */}
          </div>
        </Providers>
      </body>
    </html>
  );
}

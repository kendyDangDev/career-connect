import { Providers } from '@/components/providers/providers';
import CandidateHeader from '@/components/layout/CandidateLayout/CandidateHeader';
import CandidateFooter from '@/components/layout/CandidateLayout/CandidateFooter';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className="flex min-h-screen flex-col">
        <CandidateHeader />
        {/* <Header /> */}
        <main className="flex-grow">{children}</main>
        {/* <Footer /> */}
        <CandidateFooter />
      </div>
    </Providers>
  );
}

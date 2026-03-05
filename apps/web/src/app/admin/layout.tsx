import { AdminLayout } from '@/components/layout/AdminLayout/AdminLayout';
import { Providers } from '@/components/providers/providers';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AdminLayout>{children}</AdminLayout>;
    </Providers>
  );
}

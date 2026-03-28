import { Providers } from '@/components/providers/providers';

export const metadata = {
  title: 'Access Denied',
  description: 'Bạn không có quyền truy cập trang này',
};

export default function UnauthorizedLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}

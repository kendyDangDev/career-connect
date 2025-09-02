import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý kỹ năng | Admin Portal',
  description: 'Quản lý danh sách kỹ năng cho ứng viên và việc làm trong hệ thống',
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

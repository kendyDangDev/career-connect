import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import CandidateApplicationsClient from '@/components/candidate/applications/CandidateApplicationsClient';
import { authOptions } from '@/lib/auth-config';

export const metadata: Metadata = {
  title: 'Việc làm đã ứng tuyển | CareerConnect',
  description:
    'Theo dõi trạng thái hồ sơ, xem lại CV đã nộp và quản lý các công việc bạn đã ứng tuyển trên CareerConnect.',
};

export default async function CandidateApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  if (session.user.userType !== 'CANDIDATE') {
    redirect('/');
  }

  return <CandidateApplicationsClient />;
}

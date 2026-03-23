import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import CandidateSavedJobsClient from '@/components/candidate/saved-jobs/CandidateSavedJobsClient';
import { authOptions } from '@/lib/auth-config';

export const metadata: Metadata = {
  title: 'Việc làm đã lưu | CareerConnect',
  description:
    'Theo dõi các công việc bạn đã lưu, lọc lại những cơ hội phù hợp và quay lại ứng tuyển đúng thời điểm trên CareerConnect.',
};

export default async function CandidateSavedJobsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  if (session.user.userType !== 'CANDIDATE') {
    redirect('/');
  }

  return <CandidateSavedJobsClient />;
}

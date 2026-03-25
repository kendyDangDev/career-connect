import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import MyCVsClient from '@/components/candidate/my-cvs/MyCVsClient';
import { authOptions } from '@/lib/auth-config';
import { getCandidateProfileCompletionScore } from '@/lib/candidate/profile-completion';
import { candidateProfileSelect } from '@/lib/candidate/profile.data';
import { mapCandidateProfileRecord } from '@/lib/candidate/profile.mapper';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Quản lý CV | CareerConnect',
  description: 'Quản lý và tối ưu hoá hồ sơ chuyên nghiệp của bạn.',
};

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center bg-slate-50 *:justify-center dark:bg-slate-950">
      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
    </div>
  );
}

export default async function MyCVsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  if (session.user.userType !== 'CANDIDATE') {
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: candidateProfileSelect,
  });

  if (!user) {
    redirect('/auth/signin');
  }

  const initialData = mapCandidateProfileRecord(user);
  const initialCompletionScore = getCandidateProfileCompletionScore(initialData);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <MyCVsClient initialCompletionScore={initialCompletionScore} />
    </Suspense>
  );
}

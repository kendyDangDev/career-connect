import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { UserType } from '@/generated/prisma';
import { CandidateEmployerRequestService } from '@/services/candidate/employer-request.service';

import BecomeEmployerClient from './components/BecomeEmployerClient';

export default async function BecomeEmployerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  if (session.user.userType === UserType.EMPLOYER) {
    redirect('/employer/dashboard');
  }

  if (session.user.userType !== UserType.CANDIDATE) {
    redirect('/');
  }

  const [industries, initialState] = await Promise.all([
    prisma.industry.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    }),
    CandidateEmployerRequestService.getRequestState(session.user.id),
  ]);

  return <BecomeEmployerClient industries={industries} initialState={initialState} />;
}

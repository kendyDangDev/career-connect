import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { candidateProfileSelect } from '@/lib/candidate/profile.data';
import { mapCandidateProfileRecord } from '@/lib/candidate/profile.mapper';

import CandidateProfileClient from './components/CandidateProfileClient';

export default async function CandidateProfilePage() {
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

  return <CandidateProfileClient initialData={initialData} />;
}

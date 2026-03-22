import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware/auth';
import { candidateProfileSelect } from '@/lib/candidate/profile.data';
import { mapCandidateProfileRecord } from '@/lib/candidate/profile.mapper';
import { candidateProfileUpdateSchema } from '@/lib/validations/candidate/profile.validation';

const mapProfileWrite = (
  profile: ReturnType<typeof candidateProfileUpdateSchema.parse>['profile']
) => ({
  dateOfBirth: profile.dateOfBirth ? new Date(`${profile.dateOfBirth}T00:00:00.000Z`) : null,
  gender: profile.gender,
  address: profile.address,
  city: profile.city,
  province: profile.province,
  country: profile.country ?? 'Vietnam',
  bio: profile.bio,
  websiteUrl: profile.websiteUrl,
  linkedinUrl: profile.linkedinUrl,
  githubUrl: profile.githubUrl,
  portfolioUrl: profile.portfolioUrl,
});

const mapCandidateWrite = (
  candidate: ReturnType<typeof candidateProfileUpdateSchema.parse>['candidate']
) => ({
  currentPosition: candidate.currentPosition,
  experienceYears: candidate.experienceYears,
  expectedSalaryMin: candidate.expectedSalaryMin,
  expectedSalaryMax: candidate.expectedSalaryMax,
  currency: candidate.currency.toUpperCase(),
  availabilityStatus: candidate.availabilityStatus,
  preferredWorkType: candidate.preferredWorkType,
  preferredLocationType: candidate.preferredLocationType,
  cvFileUrl: candidate.cvFileUrl,
});

const getFreshCandidateProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: candidateProfileSelect,
  });

  return user ? mapCandidateProfileRecord(user) : null;
};

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user?.userType !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Only candidate accounts can access this route' },
        { status: 403 }
      );
    }

    const data = await getFreshCandidateProfile(req.user.id);

    if (!data) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/candidate/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user?.userType !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Only candidate accounts can update this profile' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parse = candidateProfileUpdateSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu hồ sơ không hợp lệ',
          details: parse.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { user, profile, candidate } = parse.data;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: req.user!.id },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
        },
      });

      await tx.userProfile.upsert({
        where: { userId: req.user!.id },
        update: mapProfileWrite(profile),
        create: {
          userId: req.user!.id,
          ...mapProfileWrite(profile),
        },
      });

      await tx.candidate.upsert({
        where: { userId: req.user!.id },
        update: mapCandidateWrite(candidate),
        create: {
          userId: req.user!.id,
          ...mapCandidateWrite(candidate),
        },
      });
    });

    const data = await getFreshCandidateProfile(req.user.id);

    if (!data) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data,
    });
  } catch (error) {
    console.error('PUT /api/candidate/profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

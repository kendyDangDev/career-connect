import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';

// GET /api/candidates/:id - Get candidate details
export const GET = withAuth(async (
  req: AuthenticatedRequest
) => {
  try {
    // Extract id from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    const candidate = await prisma.user.findUnique({
      where: { 
        id,
        userType: 'CANDIDATE'
      },
      include: {
        profile: true,
        candidate: {
          include: {
            education: {
              orderBy: { startDate: 'desc' }
            },
            experience: {
              orderBy: { startDate: 'desc' }
            },
            skills: {
              include: {
                skill: true
              },
              orderBy: { yearsExperience: 'desc' }
            },
            certifications: {
              orderBy: { issueDate: 'desc' }
            },
            applications: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                job: {
                  select: {
                    id: true,
                    title: true,
                    company: {
                      select: {
                        companyName: true
                      }
                    }
                  }
                }
              },
              take: 10,
              orderBy: { createdAt: 'desc' }
            },
            savedJobs: {
              select: {
                job: {
                  select: {
                    id: true,
                    title: true,
                    company: {
                      select: {
                        companyName: true
                      }
                    }
                  }
                }
              },
              take: 10
            }
          }
        }
      }
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedCandidate = {
      id: candidate.id,
      email: candidate.email,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      phone: candidate.phone,
      avatarUrl: candidate.avatarUrl,
      status: candidate.status,
      emailVerified: candidate.emailVerified,
      phoneVerified: candidate.phoneVerified,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      profile: candidate.profile,
      candidateInfo: candidate.candidate ? {
        id: candidate.candidate.id,
        currentPosition: candidate.candidate.currentPosition,
        experienceYears: candidate.candidate.experienceYears,
        expectedSalaryMin: candidate.candidate.expectedSalaryMin ? 
          parseFloat(candidate.candidate.expectedSalaryMin.toString()) : null,
        expectedSalaryMax: candidate.candidate.expectedSalaryMax ? 
          parseFloat(candidate.candidate.expectedSalaryMax.toString()) : null,
        currency: candidate.candidate.currency,
        availabilityStatus: candidate.candidate.availabilityStatus,
        preferredWorkType: candidate.candidate.preferredWorkType,
        preferredLocationType: candidate.candidate.preferredLocationType,
        cvFileUrl: candidate.candidate.cvFileUrl,
        coverLetter: candidate.candidate.coverLetter,
        education: candidate.candidate.education,
        experience: candidate.candidate.experience,
        skills: candidate.candidate.skills,
        certifications: candidate.candidate.certifications,
        recentApplications: candidate.candidate.applications,
        savedJobs: candidate.candidate.savedJobs
      } : null
    };

    return NextResponse.json({
      success: true,
      data: formattedCandidate
    });
  } catch (error) {
    console.error('GET /api/candidates/:id error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { ApplicationStatus } from '@/generated/prisma';

interface Params {
  params: {
    id: string; // application ID
  };
}

const updateApplicationSchema = z.object({
  status: z.nativeEnum(ApplicationStatus),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * PUT /api/admin/applications/:id
 * Update application status
 * Requires: application.update permission
 */
export const PUT = withPermission(
  'job.edit',
  async (req: AuthenticatedRequest, { params }: Params) => {
    try {
      const { id } = await params;
      const body = await req.json();

      // Validate input
      const validationResult = updateApplicationSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid input',
            details: validationResult.error.flatten(),
          },
          { status: 400 }
        );
      }

      const data = validationResult.data;

      // Check if application exists
      const existingApplication = await prisma.application.findUnique({
        where: { id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              companyId: true,
            },
          },
          candidate: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!existingApplication) {
        return NextResponse.json(
          {
            success: false,
            error: 'Application not found',
          },
          { status: 404 }
        );
      }

      // Update application in transaction
      const updatedApplication = await prisma.$transaction(async (tx) => {
        // Update application
        const application = await tx.application.update({
          where: { id },
          data: {
            status: data.status,
            updatedAt: new Date(),
          },
          include: {
            job: {
              select: {
                id: true,
                title: true,
              },
            },
            candidate: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        // TODO: Create status history record when model is available
        // await tx.applicationStatusHistory.create({
        //   data: {
        //     applicationId: id,
        //     fromStatus: existingApplication.status,
        //     toStatus: data.status,
        //     reason: data.reason,
        //     notes: data.notes,
        //     changedById: req.user!.id,
        //     changedAt: new Date(),
        //   },
        // });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: req.user!.id,
            action: 'UPDATE_APPLICATION_STATUS',
            tableName: 'applications',
            recordId: id,
            oldValues: { status: existingApplication.status },
            newValues: { status: data.status, reason: data.reason },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown',
          },
        });

        return application;
      });

      return NextResponse.json({
        success: true,
        message: 'Application status updated successfully',
        data: updatedApplication,
      });
    } catch (error) {
      console.error('Update application error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update application status',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * GET /api/admin/applications/:id
 * Get application details
 * Requires: application.view permission
 */
export const GET = withPermission(
  'job.view',
  async (req: AuthenticatedRequest, { params }: Params) => {
    try {
      const { id } = await params;

      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              company: {
                select: {
                  id: true,
                  companyName: true,
                  logoUrl: true,
                },
              },
            },
          },
          candidate: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  avatarUrl: true,
                  profile: {
                    select: {
                      dateOfBirth: true,
                      gender: true,
                      address: true,
                      city: true,
                      province: true,
                      bio: true,
                      linkedinUrl: true,
                      githubUrl: true,
                      portfolioUrl: true,
                    },
                  },
                },
              },
              // Include CV data if available
              cvs: {
                select: {
                  id: true,
                  cvName: true,
                  fileUrl: true,
                  isPrimary: true,
                  uploadedAt: true,
                  viewCount: true,
                },
                orderBy: {
                  uploadedAt: 'desc',
                },
                take: 5,
              },
              // Include skills
              skills: {
                include: {
                  skill: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                    },
                  },
                },
              },
              // Include experience
              experience: {
                orderBy: {
                  startDate: 'desc',
                },
              },
              // Include education
              education: {
                orderBy: {
                  startDate: 'desc',
                },
              },
              // Include certifications
              certifications: {
                orderBy: {
                  issueDate: 'desc',
                },
              },
            },
          },
          // TODO: Include status history when model is available
          // statusHistory: {
          //   include: {
          //     changedBy: {
          //       select: {
          //         id: true,
          //         firstName: true,
          //         lastName: true,
          //       },
          //     },
          //   },
          //   orderBy: {
          //     changedAt: 'desc',
          //   },
          // },
        },
      });

      if (!application) {
        return NextResponse.json(
          {
            success: false,
            error: 'Application not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error('Get application error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch application',
        },
        { status: 500 }
      );
    }
  }
);

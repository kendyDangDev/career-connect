import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission, AuthenticatedRequest } from '@/middleware/auth';
import { z } from 'zod';

// Validation schema for job application
const applyJobSchema = z.object({
  jobId: z.string().cuid(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
  cvFileUrl: z.string().url('Invalid CV file URL').optional(),
  cvId: z.string().cuid('Invalid CV ID').optional(),
});

// POST - Apply for a job (requires 'application.create' permission - CANDIDATE only)
export const POST = withPermission('application.create', async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = applyJobSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { jobId, coverLetter, cvFileUrl } = validationResult.data;
    
    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        status: true,
        applicationDeadline: true,
        company: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This job is not accepting applications' },
        { status: 400 }
      );
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
      return NextResponse.json(
        { error: 'The application deadline has passed' },
        { status: 400 }
      );
    }

    // Get candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { userId: req.user!.id },
      select: {
        id: true,
        cvFileUrl: true,
        coverLetter: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate profile not found' },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        candidateId: candidate.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 409 }
      );
    }

    // Create application
    const application = await prisma.$transaction(async (tx) => {
      // Create the application
      const newApplication = await tx.application.create({
        data: {
          jobId,
          candidateId: candidate.id,
          userId: req.user!.id,
          coverLetter: coverLetter || candidate.coverLetter,
          cvFileUrl: cvFileUrl || candidate.cvFileUrl,
          status: 'APPLIED',
        },
      });

      // Increment application count on job
      await tx.job.update({
        where: { id: jobId },
        data: {
          applicationCount: { increment: 1 },
        },
      });

      // Create timeline entry
      await tx.applicationTimeline.create({
        data: {
          applicationId: newApplication.id,
          status: 'APPLIED',
          note: 'Application submitted',
          changedBy: req.user!.id,
        },
      });

      // Create notification for employer
      const companyUsers = await tx.companyUser.findMany({
        where: {
          companyId: job.company.id,
          role: { in: ['ADMIN', 'RECRUITER', 'HR_MANAGER'] },
        },
        select: { userId: true },
      });

      // Create notifications for all relevant company users
      await tx.notification.createMany({
        data: companyUsers.map(user => ({
          userId: user.userId,
          type: 'APPLICATION_STATUS',
          title: 'New Job Application',
          message: `A new application has been received for the position: ${job.title}`,
          data: {
            jobId: job.id,
            applicationId: newApplication.id,
          },
        })),
      });

      return newApplication;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_APPLICATION',
        tableName: 'applications',
        recordId: application.id,
        newValues: {
          jobId,
          candidateId: candidate.id,
          jobTitle: job.title,
          companyName: job.company.companyName,
        },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application.id,
        jobTitle: job.title,
        companyName: job.company.companyName,
        appliedAt: application.appliedAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Apply job error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
});

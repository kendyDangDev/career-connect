import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { JobStatus } from '@/generated/prisma';

const bulkUpdateSchema = z.object({
  jobIds: z.array(z.string()).min(1, 'At least one job ID is required'),
  action: z.enum(['UPDATE_STATUS', 'DELETE', 'FEATURE', 'UNFEATURE', 'URGENT', 'NOT_URGENT']),
  data: z.object({
    status: z.nativeEnum(JobStatus).optional(),
    reason: z.string().optional(),
  }).optional(),
});

/**
 * POST /api/admin/jobs/bulk
 * Perform bulk operations on multiple jobs
 * Requires: job.update permission
 */
export const POST = withPermission('job.update', async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = bulkUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }
    
    const { jobIds, action, data } = validationResult.data;
    
    // Verify all jobs exist
    const existingJobs = await prisma.job.findMany({
      where: {
        id: { in: jobIds }
      },
      select: {
        id: true,
        title: true,
        status: true,
      }
    });
    
    if (existingJobs.length !== jobIds.length) {
      const foundIds = existingJobs.map(j => j.id);
      const missingIds = jobIds.filter(id => !foundIds.includes(id));
      
      return NextResponse.json(
        {
          success: false,
          error: 'Some jobs not found',
          details: { missingIds }
        },
        { status: 404 }
      );
    }
    
    // Perform bulk action
    const result = await prisma.$transaction(async (tx) => {
      let updateData: any = {};
      let auditAction = '';
      
      switch (action) {
        case 'UPDATE_STATUS':
          if (!data?.status) {
            throw new Error('Status is required for UPDATE_STATUS action');
          }
          updateData = {
            status: data.status,
            publishedAt: data.status === JobStatus.ACTIVE ? new Date() : undefined,
          };
          auditAction = 'BULK_UPDATE_STATUS';
          break;
          
        case 'DELETE':
          updateData = { status: JobStatus.CLOSED };
          auditAction = 'BULK_DELETE';
          break;
          
        case 'FEATURE':
          updateData = { featured: true };
          auditAction = 'BULK_FEATURE';
          break;
          
        case 'UNFEATURE':
          updateData = { featured: false };
          auditAction = 'BULK_UNFEATURE';
          break;
          
        case 'URGENT':
          updateData = { urgent: true };
          auditAction = 'BULK_URGENT';
          break;
          
        case 'NOT_URGENT':
          updateData = { urgent: false };
          auditAction = 'BULK_NOT_URGENT';
          break;
      }
      
      // Update all jobs
      const updatedJobs = await tx.job.updateMany({
        where: { id: { in: jobIds } },
        data: updateData,
      });
      
      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: auditAction,
          tableName: 'jobs',
          recordId: jobIds.join(','),
          oldValues: { jobs: existingJobs },
          newValues: { action, data, affectedCount: updatedJobs.count },
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
        },
      });
      
      return updatedJobs;
    });
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${result.count} jobs`,
      data: {
        affectedCount: result.count,
        action,
      }
    });
    
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform bulk operation'
      },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/admin/jobs/bulk
 * Bulk delete jobs
 * Requires: job.delete permission
 */
export const DELETE = withPermission('job.delete', async (req: AuthenticatedRequest) => {
  try {
    const { jobIds } = await req.json();
    
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job IDs array is required'
        },
        { status: 400 }
      );
    }
    
    // Check for active applications
    const jobsWithApplications = await prisma.job.findMany({
      where: {
        id: { in: jobIds },
        applications: {
          some: {
            status: {
              in: ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED']
            }
          }
        }
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            applications: {
              where: {
                status: {
                  in: ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED']
                }
              }
            }
          }
        }
      }
    });
    
    if (jobsWithApplications.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete jobs with active applications',
          details: jobsWithApplications.map(j => ({
            id: j.id,
            title: j.title,
            activeApplications: j._count.applications
          }))
        },
        { status: 400 }
      );
    }
    
    // Soft delete all jobs
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.job.updateMany({
        where: { id: { in: jobIds } },
        data: { status: JobStatus.CLOSED }
      });
      
      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'BULK_DELETE_JOBS',
          tableName: 'jobs',
          recordId: jobIds.join(','),
          newValues: { deletedCount: updated.count },
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
        },
      });
      
      return updated;
    });
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} jobs`,
      data: {
        deletedCount: result.count
      }
    });
    
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete jobs'
      },
      { status: 500 }
    );
  }
});
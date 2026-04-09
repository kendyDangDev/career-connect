import { NextRequest, NextResponse } from "next/server";
import { withCompanyAuth, canPostJobs, CompanyAuthenticatedRequest } from "@/lib/middleware/company-auth";
import { EmployerJobService } from "@/services/employer/job.service";
import { UpdateJobDTO } from "@/types/employer/job";
import { validateJobData, sanitizeJobData, canChangeJobStatus } from "@/lib/utils/job-utils";
import { JobStatus } from "@/generated/prisma";

interface Params {
  params: {
    id: string;
  };
}

export const GET = withCompanyAuth(async (request: CompanyAuthenticatedRequest, { params }: Params) => {
  try {

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: "Job ID is required" 
        },
        { status: 400 }
      );
    }

    // Get job detail
    const job = await EmployerJobService.getJobDetail(id, request.company!.id);

    if (!job) {
      return NextResponse.json(
        { 
          success: false,
          error: "Job not found" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error("Error fetching job detail:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch job detail" 
      },
      { status: 500 }
    );
  }
});

export const PUT = withCompanyAuth(async (request: CompanyAuthenticatedRequest, { params }: Params) => {
  try {
    // Check if user can post jobs
    if (!canPostJobs(request.company!.role)) {
      return NextResponse.json(
        { 
          success: false,
          error: "You don't have permission to update job postings" 
        },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: "Job ID is required" 
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body: UpdateJobDTO = await request.json();

    // Validate job data
    const validation = validateJobData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: "Validation failed",
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Sanitize data
    const sanitizedData = sanitizeJobData(body);

    const currentJob = await EmployerJobService.getJobDetail(id, request.company!.id);
    if (!currentJob) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found or you don't have permission to update it"
        },
        { status: 404 }
      );
    }

    if (
      sanitizedData.status !== undefined &&
      sanitizedData.status !== currentJob.status
    ) {
      const statusCheck = canChangeJobStatus(
        currentJob.status,
        sanitizedData.status as JobStatus
      );

      if (!statusCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: statusCheck.reason || "Invalid status transition"
          },
          { status: 400 }
        );
      }

      if (
        sanitizedData.status === JobStatus.ACTIVE &&
        request.company!.verificationStatus !== 'VERIFIED'
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot activate job - company verification required'
          },
          { status: 403 }
        );
      }
    }

    // Update job
    const updatedJob = await EmployerJobService.updateJob(
      id,
      request.company!.id,
      sanitizedData
    );

    if (!updatedJob) {
      return NextResponse.json(
        { 
          success: false,
          error: "Job not found or you don't have permission to update it" 
        },
        { status: 404 }
      );
    }

    // Get updated job with details
    const jobDetail = await EmployerJobService.getJobDetail(id, request.company!.id);

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      data: jobDetail
    });

  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update job" 
      },
      { status: 500 }
    );
  }
});

export const DELETE = withCompanyAuth(async (request: CompanyAuthenticatedRequest, { params }: Params) => {
  try {
    // Check if user can manage jobs
    if (!canPostJobs(request.company!.role)) {
      return NextResponse.json(
        { 
          success: false,
          error: "You don't have permission to delete job postings" 
        },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: "Job ID is required" 
        },
        { status: 400 }
      );
    }

    // Check if job has active applications
    const job = await EmployerJobService.getJobDetail(id, request.company!.id);
    if (!job) {
      return NextResponse.json(
        { 
          success: false,
          error: "Job not found" 
        },
        { status: 404 }
      );
    }

    if (job._count.applications > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "Cannot delete job with existing applications. Please close the job instead." 
        },
        { status: 400 }
      );
    }

    // Delete job (soft delete)
    const deleted = await EmployerJobService.deleteJob(id, request.company!.id);

    if (!deleted) {
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to delete job" 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to delete job" 
      },
      { status: 500 }
    );
  }
});

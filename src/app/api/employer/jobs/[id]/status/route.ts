import { NextRequest, NextResponse } from "next/server";
import { requireCompanyAuth, canPostJobs } from "@/lib/middleware/company-auth";
import { EmployerJobService } from "@/services/employer/job.service";
import { UpdateJobStatusDTO } from "@/types/employer/job";
import { canChangeJobStatus } from "@/lib/utils/job-utils";
import { JobStatus } from "@/generated/prisma";

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    // Verify authentication and permissions
    const authResult = await requireCompanyAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check if user can manage jobs
    if (!canPostJobs(authResult.companyRole)) {
      return NextResponse.json(
        { 
          success: false,
          error: "You don't have permission to update job status" 
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
    const body: UpdateJobStatusDTO = await request.json();
    const { status, reason, notifyApplicants } = body;

    // Validate status
    if (!status || !Object.values(JobStatus).includes(status)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid job status" 
        },
        { status: 400 }
      );
    }

    // Get current job to check status transition
    const currentJob = await EmployerJobService.getJobDetail(id, authResult.companyId);
    if (!currentJob) {
      return NextResponse.json(
        { 
          success: false,
          error: "Job not found" 
        },
        { status: 404 }
      );
    }

    // Check if status transition is allowed
    const statusCheck = canChangeJobStatus(currentJob.status, status);
    if (!statusCheck.allowed) {
      return NextResponse.json(
        { 
          success: false,
          error: statusCheck.reason || "Invalid status transition" 
        },
        { status: 400 }
      );
    }

    // If changing to ACTIVE, verify company is still verified
    if (status === JobStatus.ACTIVE && authResult.company.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        { 
          success: false,
          error: "Cannot activate job - company verification required" 
        },
        { status: 403 }
      );
    }

    // Update job status
    const result = await EmployerJobService.updateJobStatus(
      id,
      authResult.companyId,
      body
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.message 
        },
        { status: 500 }
      );
    }

    // Get updated job
    const updatedJob = await EmployerJobService.getJobDetail(id, authResult.companyId);

    // Log the status change
    console.log(`Job ${id} status changed from ${currentJob.status} to ${status} by user ${authResult.userId}`);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        id,
        previousStatus: currentJob.status,
        newStatus: status,
        job: updatedJob
      }
    });

  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update job status" 
      },
      { status: 500 }
    );
  }
}

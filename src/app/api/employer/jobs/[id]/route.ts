import { NextRequest, NextResponse } from "next/server";
import { requireCompanyAuth, canPostJobs } from "@/lib/middleware/company-auth";
import { EmployerJobService } from "@/services/employer/job.service";
import { UpdateJobDTO } from "@/types/employer/job";
import { validateJobData, sanitizeJobData } from "@/lib/utils/job-utils";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Verify authentication and get company info
    const authResult = await requireCompanyAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
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

    // Get job detail
    const job = await EmployerJobService.getJobDetail(id, authResult.companyId);

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
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    // Verify authentication and permissions
    const authResult = await requireCompanyAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check if user can post jobs
    if (!canPostJobs(authResult.companyRole)) {
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

    // Update job
    const updatedJob = await EmployerJobService.updateJob(
      id,
      authResult.companyId,
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
    const jobDetail = await EmployerJobService.getJobDetail(id, authResult.companyId);

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
}

export async function DELETE(request: NextRequest, { params }: Params) {
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
    const job = await EmployerJobService.getJobDetail(id, authResult.companyId);
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
    const deleted = await EmployerJobService.deleteJob(id, authResult.companyId);

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
}

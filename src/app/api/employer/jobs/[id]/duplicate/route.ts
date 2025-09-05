import { NextRequest, NextResponse } from "next/server";
import { requireCompanyAuth, canPostJobs } from "@/lib/middleware/company-auth";
import { EmployerJobService } from "@/services/employer/job.service";
import { DuplicateJobDTO } from "@/types/employer/job";

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: Params) {
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
          error: "You don't have permission to create job postings" 
        },
        { status: 403 }
      );
    }

    // Check if company is verified
    if (authResult.company.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        { 
          success: false,
          error: "Your company must be verified before posting jobs" 
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

    // TODO: Check job posting quota/limits based on subscription plan

    // Parse optional request body
    let duplicateData: DuplicateJobDTO | undefined;
    try {
      const body = await request.json();
      duplicateData = body;
    } catch {
      // Body is optional, so we can proceed without it
    }

    // Duplicate the job
    const duplicatedJob = await EmployerJobService.duplicateJob(
      id,
      authResult.companyId,
      authResult.userId,
      duplicateData
    );

    if (!duplicatedJob) {
      return NextResponse.json(
        { 
          success: false,
          error: "Job not found or you don't have permission to duplicate it" 
        },
        { status: 404 }
      );
    }

    // Get duplicated job with details
    const jobDetail = await EmployerJobService.getJobDetail(
      duplicatedJob.id,
      authResult.companyId
    );

    return NextResponse.json({
      success: true,
      message: "Job duplicated successfully",
      data: {
        originalJobId: id,
        duplicatedJob: jobDetail
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error duplicating job:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to duplicate job" 
      },
      { status: 500 }
    );
  }
}

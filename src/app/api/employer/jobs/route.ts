import { NextRequest, NextResponse } from "next/server";
import { withCompanyAuth, canPostJobs, CompanyAuthenticatedRequest } from "@/lib/middleware/company-auth";
import { EmployerJobService } from "@/services/employer/job.service";
import { JobListParams, CreateJobDTO } from "@/types/employer/job";
import { validateJobData, sanitizeJobData } from "@/lib/utils/job-utils";

export const GET = withCompanyAuth(async (request: CompanyAuthenticatedRequest) => {
  try {

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: JobListParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as any || undefined,
      jobType: searchParams.get('jobType') as any || undefined,
      experienceLevel: searchParams.get('experienceLevel') as any || undefined,
      sortBy: searchParams.get('sortBy') as any || 'createdAt',
      sortOrder: searchParams.get('sortOrder') as any || 'desc',
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined
    };

    // Validate pagination params
    if (params.page < 1) params.page = 1;
    if (params.limit < 1 || params.limit > 100) params.limit = 10;

    // Get jobs list
    const result = await EmployerJobService.getCompanyJobs(request.company!.id, params);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error fetching jobs list:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch jobs" 
      },
      { status: 500 }
    );
  }
});

export const POST = withCompanyAuth(async (request: CompanyAuthenticatedRequest) => {
  try {
    // Check if user can post jobs
    if (!canPostJobs(request.company!.role)) {
      return NextResponse.json(
        { 
          success: false,
          error: "You don't have permission to create job postings" 
        },
        { status: 403 }
      );
    }

    // Check if company is verified
    if (request.company!.verificationStatus !== "VERIFIED") {
      return NextResponse.json(
        { 
          success: false,
          error: "Your company must be verified before posting jobs" 
        },
        { status: 403 }
      );
    }

    // TODO: Check job posting quota/limits based on subscription plan

    // Parse request body
    const body: CreateJobDTO = await request.json();

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

    // Create job
    const job = await EmployerJobService.createJob(
      request.company!.id,
      request.user!.id,
      sanitizedData
    );

    // Get created job with details
    const jobDetail = await EmployerJobService.getJobDetail(job.id, request.company!.id);

    return NextResponse.json({
      success: true,
      message: "Job created successfully",
      data: jobDetail
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create job" 
      },
      { status: 500 }
    );
  }
});

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { EmployerApplicationService } from "@/services/employer/application.service";
import { ApplicationListParams } from "@/types/employer/application";
import { ErrorCode } from "@/lib/errors/application-errors";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Employer access only" },
        { status: 403 }
      );
    }

    // Get company ID from session
    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "No company associated with user" },
        { status: 400 }
      );
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    
    const params: ApplicationListParams = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      sortBy: searchParams.get("sortBy") as any || "appliedAt",
      sortOrder: searchParams.get("sortOrder") as "asc" | "desc" || "desc",
      search: searchParams.get("search") || undefined,
      includeMatchScores: searchParams.get("includeScores") === "true"
    };

    // Parse filter JSON if provided
    const filterJson = searchParams.get("filter");
    if (filterJson) {
      try {
        params.filter = JSON.parse(filterJson);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Invalid filter format" },
          { status: 400 }
        );
      }
    }

    // Get applications
    const result = await EmployerApplicationService.getJobApplications(
      params.jobId,
      companyId,
      params
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error("Error fetching applications:", error);
    
    if (error.message === "Job not found or access denied") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Job not found or access denied",
          code: ErrorCode.JOB_NOT_FOUND
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch applications",
        code: ErrorCode.INTERNAL_ERROR
      },
      { status: 500 }
    );
  }
}

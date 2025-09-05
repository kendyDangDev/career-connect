import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { EmployerApplicationService } from "@/services/employer/application.service";
import { ApplicationFilterCriteria, ScoringConfig } from "@/types/employer/application";
import { ErrorCode } from "@/lib/errors/application-errors";

export async function POST(
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

    // Parse request body
    const body = await req.json();

    // Validate filter criteria
    const filterCriteria: ApplicationFilterCriteria = body.filterCriteria || {};
    const scoringConfig: ScoringConfig | undefined = body.scoringConfig;

    // Validate scoring config if provided
    if (scoringConfig) {
      const weights = scoringConfig.weights;
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      
      if (Math.abs(totalWeight - 1) > 0.001) {
        return NextResponse.json(
          { success: false, error: "Scoring weights must sum to 1" },
          { status: 400 }
        );
      }

      // Validate all weights are between 0 and 1
      for (const weight of Object.values(weights)) {
        if (weight < 0 || weight > 1) {
          return NextResponse.json(
            { success: false, error: "All weights must be between 0 and 1" },
            { status: 400 }
          );
        }
      }
    }

    // Get filtered applications
    const filteredApplications = await EmployerApplicationService.filterApplicationsWithAI(
      params.jobId,
      companyId,
      filterCriteria,
      scoringConfig
    );

    // Calculate distribution stats
    const scoreDistribution = {
      excellent: filteredApplications.filter(app => app.matchScore && app.matchScore >= 80).length,
      good: filteredApplications.filter(app => app.matchScore && app.matchScore >= 60 && app.matchScore < 80).length,
      average: filteredApplications.filter(app => app.matchScore && app.matchScore >= 40 && app.matchScore < 60).length,
      poor: filteredApplications.filter(app => app.matchScore && app.matchScore < 40).length
    };

    return NextResponse.json({
      success: true,
      data: {
        applications: filteredApplications,
        totalCount: filteredApplications.length,
        scoreDistribution,
        filterCriteria,
        scoringConfig: scoringConfig || "default"
      }
    });

  } catch (error: any) {
    console.error("Error filtering applications:", error);
    
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
        error: "Failed to filter applications",
        code: ErrorCode.INTERNAL_ERROR
      },
      { status: 500 }
    );
  }
}

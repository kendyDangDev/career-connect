import { NextRequest, NextResponse } from "next/server";
import { requireCompanyAuth } from "@/lib/middleware/company-auth";
import { EmployerJobService } from "@/services/employer/job.service";
import { calculateJobMetrics, formatSalaryRange } from "@/lib/utils/job-utils";

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

    // Get job to verify ownership and calculate additional metrics
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

    // Get detailed statistics
    const statistics = await EmployerJobService.getJobStatistics(id, authResult.companyId);
    
    if (!statistics) {
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to fetch job statistics" 
        },
        { status: 500 }
      );
    }

    // Calculate additional metrics
    const metrics = calculateJobMetrics(job);
    
    // Format salary for display
    const salaryRange = formatSalaryRange(
      job.salaryMin?.toNumber(),
      job.salaryMax?.toNumber(),
      job.currency || 'VND',
      job.salaryNegotiable
    );

    // Prepare response with all statistics
    const responseData = {
      job: {
        id: job.id,
        title: job.title,
        status: job.status,
        createdAt: job.createdAt,
        publishedAt: job.publishedAt,
        applicationDeadline: job.applicationDeadline,
        salaryRange
      },
      metrics: {
        ...statistics,
        ...metrics,
        // Application funnel
        applicationFunnel: {
          views: statistics.totalViews,
          uniqueViews: statistics.uniqueViews,
          applications: statistics.totalApplications,
          viewToApplicationRate: statistics.conversionRate
        },
        // Performance indicators
        performance: {
          viewsPerDay: metrics.daysActive > 0 ? Math.round(statistics.totalViews / metrics.daysActive) : 0,
          applicationsPerDay: metrics.applicationRate,
          trending: statistics.viewsLastWeek > statistics.viewsLastMonth / 4 ? 'up' : 'down'
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("Error fetching job statistics:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch job statistics" 
      },
      { status: 500 }
    );
  }
}

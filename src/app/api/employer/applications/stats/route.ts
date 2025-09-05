import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@/generated/prisma";
import { ErrorCode } from "@/lib/errors/application-errors";

export async function GET(req: NextRequest) {
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
    const jobId = searchParams.get("jobId");
    const timeRange = searchParams.get("timeRange") || "30days"; // default to last 30 days

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Build where clause
    const where: any = {
      job: {
        companyId
      },
      createdAt: {
        gte: startDate
      }
    };

    if (jobId) {
      where.jobId = jobId;
    }

    // Get all applications for the company within date range
    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true
          }
        },
        candidate: {
          select: {
            experienceYears: true,
            skills: {
              select: {
                skill: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Calculate overall statistics
    const totalApplications = applications.length;
    
    // Status distribution
    const statusDistribution = Object.values(ApplicationStatus).reduce((acc, status) => {
      const count = applications.filter(app => app.status === status).length;
      acc[status] = {
        count,
        percentage: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0
      };
      return acc;
    }, {} as Record<string, { count: number; percentage: number }>);

    // Rating distribution
    const ratingDistribution = {
      5: applications.filter(app => app.rating === 5).length,
      4: applications.filter(app => app.rating === 4).length,
      3: applications.filter(app => app.rating === 3).length,
      2: applications.filter(app => app.rating === 2).length,
      1: applications.filter(app => app.rating === 1).length,
      unrated: applications.filter(app => !app.rating).length
    };

    // Experience distribution
    const experienceDistribution = {
      "0-2": applications.filter(app => app.candidate.experienceYears >= 0 && app.candidate.experienceYears <= 2).length,
      "3-5": applications.filter(app => app.candidate.experienceYears >= 3 && app.candidate.experienceYears <= 5).length,
      "6-10": applications.filter(app => app.candidate.experienceYears >= 6 && app.candidate.experienceYears <= 10).length,
      "10+": applications.filter(app => app.candidate.experienceYears > 10).length
    };

    // Time to hire metrics
    const hiredApplications = applications.filter(app => app.status === ApplicationStatus.HIRED);
    let averageTimeToHire = 0;
    
    if (hiredApplications.length > 0) {
      const timeToHireSum = hiredApplications.reduce((sum, app) => {
        const daysToHire = Math.floor((app.statusUpdatedAt.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysToHire;
      }, 0);
      averageTimeToHire = Math.round(timeToHireSum / hiredApplications.length);
    }

    // Top skills
    const skillCounts: Record<string, number> = {};
    applications.forEach(app => {
      app.candidate.skills.forEach(cs => {
        const skillName = cs.skill.name;
        skillCounts[skillName] = (skillCounts[skillName] || 0) + 1;
      });
    });
    
    const topSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Applications by job (if not filtered by specific job)
    let applicationsByJob: any[] = [];
    if (!jobId) {
      const jobGroups = applications.reduce((acc, app) => {
        if (!acc[app.jobId]) {
          acc[app.jobId] = {
            jobId: app.jobId,
            jobTitle: app.job.title,
            count: 0
          };
        }
        acc[app.jobId].count++;
        return acc;
      }, {} as Record<string, any>);
      
      applicationsByJob = Object.values(jobGroups)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    // Conversion funnel
    const conversionFunnel = {
      applied: totalApplications,
      reviewed: applications.filter(app => 
        app.status !== ApplicationStatus.APPLIED
      ).length,
      interviewed: applications.filter(app => 
        [ApplicationStatus.INTERVIEWING, ApplicationStatus.HIRED, ApplicationStatus.REJECTED].includes(app.status)
      ).length,
      hired: hiredApplications.length
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalApplications,
          averageTimeToHire,
          hireRate: totalApplications > 0 ? Math.round((hiredApplications.length / totalApplications) * 100) : 0,
          timeRange,
          dateRange: {
            start: startDate.toISOString(),
            end: now.toISOString()
          }
        },
        statusDistribution,
        ratingDistribution,
        experienceDistribution,
        conversionFunnel,
        topSkills,
        applicationsByJob
      }
    });

  } catch (error: any) {
    console.error("Error fetching application statistics:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch statistics",
        code: ErrorCode.INTERNAL_ERROR
      },
      { status: 500 }
    );
  }
}

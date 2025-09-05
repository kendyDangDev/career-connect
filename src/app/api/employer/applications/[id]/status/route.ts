import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { EmployerApplicationService } from "@/services/employer/application.service";
import { UpdateApplicationStatusDTO } from "@/types/employer/application";
import { ErrorCode } from "@/lib/errors/application-errors";
import { ApplicationStatus } from "@/generated/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    // Validate status
    if (!body.status || !Object.values(ApplicationStatus).includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (body.rating !== undefined && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Create update DTO
    const updateData: UpdateApplicationStatusDTO = {
      status: body.status,
      rating: body.rating,
      notes: body.notes,
      interviewScheduledAt: body.interviewScheduledAt,
      notifyCandidate: body.notifyCandidate || false
    };

    // Update application status
    const result = await EmployerApplicationService.updateApplicationStatus(
      params.id,
      companyId,
      session.user.id,
      updateData
    );

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully"
    });

  } catch (error: any) {
    console.error("Error updating application status:", error);
    
    if (error.message === "Application not found or access denied") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Application not found or access denied",
          code: ErrorCode.APPLICATION_NOT_FOUND
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update application status",
        code: ErrorCode.INTERNAL_ERROR
      },
      { status: 500 }
    );
  }
}

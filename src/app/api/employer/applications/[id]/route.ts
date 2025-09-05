import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { EmployerApplicationService } from "@/services/employer/application.service";
import { ErrorCode } from "@/lib/errors/application-errors";

export async function GET(
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

    // Get application detail
    const application = await EmployerApplicationService.getApplicationDetail(
      params.id,
      companyId
    );

    if (!application) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Application not found or access denied",
          code: ErrorCode.APPLICATION_NOT_FOUND
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application
    });

  } catch (error: any) {
    console.error("Error fetching application detail:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch application detail",
        code: ErrorCode.INTERNAL_ERROR
      },
      { status: 500 }
    );
  }
}

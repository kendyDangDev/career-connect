import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, logAdminAction } from "@/lib/middleware/admin-auth";
import { AdminCompanyService } from "@/services/admin/company.service";
import { CompanyVerificationDTO } from "@/types/admin/company";
import { VerificationStatus } from "@/generated/prisma";

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: "Company ID is required" 
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body: CompanyVerificationDTO = await request.json();
    const { verificationStatus, verificationNotes, notifyCompany } = body;

    // Validate status
    if (!verificationStatus || !Object.values(VerificationStatus).includes(verificationStatus)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid verification status" 
        },
        { status: 400 }
      );
    }

    // Get current company data for audit
    const currentCompany = await AdminCompanyService.getCompanyDetail(id);
    if (!currentCompany) {
      return NextResponse.json(
        { 
          success: false,
          error: "Company not found" 
        },
        { status: 404 }
      );
    }

    // Check if status is actually changing
    if (currentCompany.verificationStatus === verificationStatus) {
      return NextResponse.json(
        { 
          success: false,
          error: "Company already has this verification status" 
        },
        { status: 400 }
      );
    }

    // Update verification status
    await AdminCompanyService.updateVerificationStatus(id, body);

    // Log admin action
    await logAdminAction(
      authResult.userId,
      `UPDATE_VERIFICATION_STATUS_${verificationStatus}`,
      "companies",
      id,
      { verificationStatus: currentCompany.verificationStatus },
      { verificationStatus, verificationNotes },
      request
    );

    // Get updated company
    const updatedCompany = await AdminCompanyService.getCompanyDetail(id);

    // TODO: Send notification if notifyCompany is true
    if (notifyCompany && updatedCompany?.companyUsers[0]?.user.email) {
      // Implement email notification
      console.log(`TODO: Send verification status update email to ${updatedCompany.companyUsers[0].user.email}`);
    }

    return NextResponse.json({
      success: true,
      message: `Company verification status updated to ${verificationStatus}`,
      data: {
        id,
        verificationStatus,
        previousStatus: currentCompany.verificationStatus,
        notificationSent: notifyCompany || false
      }
    });

  } catch (error) {
    console.error("Error updating company verification status:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update verification status" 
      },
      { status: 500 }
    );
  }
}

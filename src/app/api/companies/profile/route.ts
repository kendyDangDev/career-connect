import { NextRequest, NextResponse } from "next/server";
import { requireCompanyAuth, canManageCompany } from "@/lib/middleware/company-auth";
import { CompanyService } from "@/services/company.service";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and get company info
    const authResult = await requireCompanyAuth(request);
    
    // Check if auth failed (returns NextResponse)
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get company profile with additional info
    const companyProfile = await CompanyService.getCompanyProfile(authResult.companyId);

    if (!companyProfile) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Get company statistics if user can manage company
    let stats = null;
    if (canManageCompany(authResult.companyRole)) {
      stats = await CompanyService.getCompanyStats(authResult.companyId);
    }

    return NextResponse.json({
      success: true,
      data: {
        company: companyProfile,
        userRole: authResult.companyRole,
        canManage: canManageCompany(authResult.companyRole),
        stats
      }
    });

  } catch (error) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch company profile" 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication and permissions
    const authResult = await requireCompanyAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check if user can manage company
    if (!canManageCompany(authResult.companyRole)) {
      return NextResponse.json(
        { 
          success: false,
          error: "You don't have permission to update company information" 
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Import validation functions
    const { validateCompanyData, sanitizeCompanyData } = await import("@/lib/utils/company-utils");

    // Validate data
    const validation = validateCompanyData(body);
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
    const sanitizedData = sanitizeCompanyData(body);

    // Update company profile
    const updatedCompany = await CompanyService.updateCompanyProfile(
      authResult.companyId,
      sanitizedData
    );

    // Get updated profile with additional info
    const companyProfile = await CompanyService.getCompanyProfile(authResult.companyId);

    return NextResponse.json({
      success: true,
      message: "Company profile updated successfully",
      data: {
        company: companyProfile
      }
    });

  } catch (error) {
    console.error("Error updating company profile:", error);
    
    // Handle unique constraint errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { 
          success: false,
          error: "A company with this name already exists" 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update company profile" 
      },
      { status: 500 }
    );
  }
}

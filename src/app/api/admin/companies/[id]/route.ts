import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, logAdminAction } from "@/lib/middleware/admin-auth";
import { AdminCompanyService } from "@/services/admin/company.service";
import { AdminCompanyUpdateDTO } from "@/types/admin/company";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
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

    // Get company detail
    const company = await AdminCompanyService.getCompanyDetail(id);

    if (!company) {
      return NextResponse.json(
        { 
          success: false,
          error: "Company not found" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company
    });

  } catch (error) {
    console.error("Error fetching company detail:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch company detail" 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
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
    const body: AdminCompanyUpdateDTO = await request.json();

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

    // Update company
    const updatedCompany = await AdminCompanyService.updateCompany(id, body);

    if (!updatedCompany) {
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to update company" 
        },
        { status: 500 }
      );
    }

    // Log admin action
    await logAdminAction(
      authResult.userId,
      "UPDATE_COMPANY",
      "companies",
      id,
      currentCompany,
      updatedCompany,
      request
    );

    return NextResponse.json({
      success: true,
      message: "Company updated successfully",
      data: updatedCompany
    });

  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update company" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
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

    // Parse query params to check if hard delete
    const searchParams = request.nextUrl.searchParams;
    const hardDelete = searchParams.get('hard') === 'true';

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

    // Delete company
    await AdminCompanyService.deleteCompany(id, hardDelete);

    // Log admin action
    await logAdminAction(
      authResult.userId,
      hardDelete ? "HARD_DELETE_COMPANY" : "SOFT_DELETE_COMPANY",
      "companies",
      id,
      currentCompany,
      null,
      request
    );

    return NextResponse.json({
      success: true,
      message: `Company ${hardDelete ? 'permanently deleted' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to delete company" 
      },
      { status: 500 }
    );
  }
}

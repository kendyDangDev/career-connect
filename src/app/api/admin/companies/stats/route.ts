import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/middleware/admin-auth";
import { AdminCompanyService } from "@/services/admin/company.service";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get statistics
    const stats = await AdminCompanyService.getAdminStats();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error fetching company statistics:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch company statistics" 
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { CompanyService } from "@/services/company.service";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { 
          success: false,
          error: "Company slug is required" 
        },
        { status: 400 }
      );
    }

    // Get public company profile
    const companyProfile = await CompanyService.getPublicCompanyProfile(slug);

    if (!companyProfile) {
      return NextResponse.json(
        { 
          success: false,
          error: "Company not found" 
        },
        { status: 404 }
      );
    }

    // Check if company is verified (optional - depends on business logic)
    // if (companyProfile.verificationStatus !== "VERIFIED") {
    //   return NextResponse.json(
    //     { 
    //       success: false,
    //       error: "Company profile is not available" 
    //     },
    //     { status: 403 }
    //   );
    // }

    return NextResponse.json({
      success: true,
      data: companyProfile
    });

  } catch (error) {
    console.error("Error fetching public company profile:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch company profile" 
      },
      { status: 500 }
    );
  }
}

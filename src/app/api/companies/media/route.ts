import { NextRequest, NextResponse } from "next/server";
import { requireCompanyAuth, canManageCompany } from "@/lib/middleware/company-auth";
import { CompanyService } from "@/services/company.service";
import { UploadService } from "@/services/upload.service";

export async function POST(request: NextRequest) {
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
          error: "You don't have permission to upload company media" 
        },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const mediaType = formData.get("type") as string;
    
    if (!["logo", "cover", "gallery", "video"].includes(mediaType)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid media type" 
        },
        { status: 400 }
      );
    }

    // Handle different media types
    switch (mediaType) {
      case "logo": {
        const file = formData.get("file") as File;
        if (!file) {
          return NextResponse.json(
            { 
              success: false,
              error: "No file provided" 
            },
            { status: 400 }
          );
        }

        const uploadResult = await UploadService.uploadCompanyLogo(file, authResult.companyId);
        
        if (!uploadResult.success) {
          return NextResponse.json(
            { 
              success: false,
              error: uploadResult.error 
            },
            { status: 400 }
          );
        }

        // Delete old logo if exists
        const currentCompany = await CompanyService.getCompanyProfile(authResult.companyId);
        if (currentCompany?.logoUrl) {
          await UploadService.deleteFile(currentCompany.logoUrl);
        }

        // Update database
        await CompanyService.updateCompanyMedia(
          authResult.companyId,
          "logo",
          uploadResult.fileUrl!
        );

        return NextResponse.json({
          success: true,
          message: "Logo uploaded successfully",
          data: {
            logoUrl: uploadResult.fileUrl
          }
        });
      }

      case "cover": {
        const file = formData.get("file") as File;
        if (!file) {
          return NextResponse.json(
            { 
              success: false,
              error: "No file provided" 
            },
            { status: 400 }
          );
        }

        const uploadResult = await UploadService.uploadCompanyCover(file, authResult.companyId);
        
        if (!uploadResult.success) {
          return NextResponse.json(
            { 
              success: false,
              error: uploadResult.error 
            },
            { status: 400 }
          );
        }

        // Delete old cover if exists
        const currentCompany = await CompanyService.getCompanyProfile(authResult.companyId);
        if (currentCompany?.coverImageUrl) {
          await UploadService.deleteFile(currentCompany.coverImageUrl);
        }

        // Update database
        await CompanyService.updateCompanyMedia(
          authResult.companyId,
          "cover",
          uploadResult.fileUrl!
        );

        return NextResponse.json({
          success: true,
          message: "Cover image uploaded successfully",
          data: {
            coverImageUrl: uploadResult.fileUrl
          }
        });
      }

      case "gallery": {
        const files = formData.getAll("files") as File[];
        if (files.length === 0) {
          return NextResponse.json(
            { 
              success: false,
              error: "No files provided" 
            },
            { status: 400 }
          );
        }

        const uploadResult = await UploadService.uploadCompanyGallery(files, authResult.companyId);
        
        if (!uploadResult.success && !uploadResult.urls) {
          return NextResponse.json(
            { 
              success: false,
              errors: uploadResult.errors 
            },
            { status: 400 }
          );
        }

        // Note: Gallery images would typically be stored in a separate table
        // For now, we'll just return the URLs
        
        return NextResponse.json({
          success: true,
          message: "Gallery images uploaded",
          data: {
            urls: uploadResult.urls,
            errors: uploadResult.errors
          }
        });
      }

      case "video": {
        const file = formData.get("file") as File;
        if (!file) {
          return NextResponse.json(
            { 
              success: false,
              error: "No file provided" 
            },
            { status: 400 }
          );
        }

        const uploadResult = await UploadService.uploadCompanyVideo(file, authResult.companyId);
        
        if (!uploadResult.success) {
          return NextResponse.json(
            { 
              success: false,
              error: uploadResult.error 
            },
            { status: 400 }
          );
        }

        // Note: Videos would typically be stored in a separate table
        // For now, we'll just return the URL
        
        return NextResponse.json({
          success: true,
          message: "Video uploaded successfully",
          data: {
            videoUrl: uploadResult.fileUrl
          }
        });
      }

      default:
        return NextResponse.json(
          { 
            success: false,
            error: "Invalid media type" 
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Error uploading company media:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to upload media" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
          error: "You don't have permission to delete company media" 
        },
        { status: 403 }
      );
    }

    // Parse request body
    const { mediaType, fileUrl } = await request.json();
    
    if (!["logo", "cover"].includes(mediaType)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid media type" 
        },
        { status: 400 }
      );
    }

    // Delete file from storage
    await UploadService.deleteFile(fileUrl);

    // Update database
    await CompanyService.updateCompanyMedia(
      authResult.companyId,
      mediaType as "logo" | "cover",
      "" // Set to empty string to remove
    );

    return NextResponse.json({
      success: true,
      message: `${mediaType === "logo" ? "Logo" : "Cover image"} deleted successfully`
    });

  } catch (error) {
    console.error("Error deleting company media:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to delete media" 
      },
      { status: 500 }
    );
  }
}

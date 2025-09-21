export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/mobile/profile
 * Get user profile (requires Bearer token authentication)
 */
async function handler(req: AuthenticatedRequest): Promise<NextResponse> {
  const origin = req.headers.get('origin');
  
  try {
    // User is already authenticated by withAuth middleware
    const userId = req.user?.id;
    
    if (!userId) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'User ID không tồn tại',
        },
        { status: 400 }
      );
      
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        candidate: true,
        companyUsers: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Người dùng không tồn tại',
        },
        { status: 404 }
      );
      
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    // Prepare user data for response
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      status: user.status,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
      // Include employer data if user is an employer
      ...(user.userType === 'EMPLOYER' &&
        user.companyUsers &&
        user.companyUsers.length > 0 && {
          employer: {
            id: user.companyUsers[0].id,
            position: user.companyUsers[0].position,
            isVerified: user.companyUsers[0].isVerified,
            companyId: user.companyUsers[0].companyId,
            company: user.companyUsers[0].company,
          },
        }),
      // Include candidate data if user is a candidate
      ...(user.userType === 'CANDIDATE' &&
        user.candidate && {
          candidate: {
            id: user.candidate.id,
            title: user.candidate.title,
            level: user.candidate.level,
            isAvailable: user.candidate.isAvailable,
          },
        }),
    };

    const response = NextResponse.json({
      success: true,
      data: userData,
    });
    
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    return response;
  } catch (error) {
    console.error('Get profile error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: 'Đã có lỗi xảy ra khi lấy thông tin người dùng',
      },
      { status: 500 }
    );
    
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    return response;
  }
}

// Apply authentication middleware
export const GET = withAuth(handler);

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  
  return response;
}

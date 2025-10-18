export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  verifyRefreshToken, 
  generateTokenPair,
  extractBearerToken 
} from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  try {
    // Get refresh token from request body or Authorization header
    const body = await request.json().catch(() => ({}));
    let refreshToken = body.refreshToken;
    
    // Also check Authorization header for refresh token
    if (!refreshToken) {
      const authHeader = request.headers.get('authorization');
      refreshToken = extractBearerToken(authHeader);
    }
    
    if (!refreshToken) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Refresh token không được cung cấp',
        },
        { status: 400 }
      );
      
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Refresh token không hợp lệ hoặc đã hết hạn',
        },
        { status: 401 }
      );
      
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
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

    // Check account status
    if (user.status === 'SUSPENDED') {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Tài khoản của bạn đã bị tạm khóa',
        },
        { status: 403 }
      );
      
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    if (user.status === 'INACTIVE') {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Tài khoản của bạn chưa được kích hoạt',
        },
        { status: 403 }
      );
      
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    // Generate new token pair
    const tokenPayload = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const { 
      accessToken, 
      refreshToken: newRefreshToken, 
      accessTokenExpires, 
      refreshTokenExpires 
    } = generateTokenPair(tokenPayload);

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
      profile: user.profile,
      // Include employer data if user is an employer
      ...(user.userType === 'EMPLOYER' &&
        user.companyUsers &&
        user.companyUsers.length > 0 && {
          employer: {
            id: user.companyUsers[0].id,
            role: user.companyUsers[0].role,
            isPrimaryContact: user.companyUsers[0].isPrimaryContact,
            companyId: user.companyUsers[0].companyId,
            company: user.companyUsers[0].company,
          },
        }),
      // Include candidate data if user is a candidate
      ...(user.userType === 'CANDIDATE' &&
        user.candidate && {
          candidate: {
            id: user.candidate.id,
            currentPosition: user.candidate.currentPosition,
            experienceYears: user.candidate.experienceYears,
            availabilityStatus: user.candidate.availabilityStatus,
          },
        }),
    };

    // Return success response with new tokens
    const response = NextResponse.json({
      success: true,
      data: {
        user: userData,
        accessToken,
        refreshToken: newRefreshToken,
        accessTokenExpires,
        refreshTokenExpires,
        tokenType: 'Bearer',
      },
    });
    
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: 'Đã có lỗi xảy ra khi làm mới token',
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

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  
  return response;
}

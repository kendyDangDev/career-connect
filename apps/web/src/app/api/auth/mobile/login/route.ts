export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-utils';
import { loginSchema } from '@/lib/validations';
import { generateTokenPair } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    const { error } = loginSchema.validate({ email, password });
    if (error) {
      const response = NextResponse.json(
        {
          success: false,
          error: error.details[0].message,
        },
        { status: 400 }
      );
      
      // Add CORS headers
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
          error: 'Email hoặc mật khẩu không chính xác',
        },
        { status: 401 }
      );
      
      // Add CORS headers
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    // Check if user has a password (not social login only)
    if (!user.passwordHash) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Tài khoản này chỉ hỗ trợ đăng nhập bằng mạng xã hội',
        },
        { status: 401 }
      );
      
      // Add CORS headers
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Email hoặc mật khẩu không chính xác',
        },
        { status: 401 }
      );
      
      // Add CORS headers
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
      
      // Add CORS headers
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
          error:
            'Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email để xác thực tài khoản.',
        },
        { status: 403 }
      );
      
      // Add CORS headers
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

// Generate token pair (access + refresh)
    const tokenPayload = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const { accessToken, refreshToken, accessTokenExpires, refreshTokenExpires } = generateTokenPair(tokenPayload);

    // Note: lastLogin field update removed - field doesn't exist in schema

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

// Return success response with tokens
    const response = NextResponse.json({
      success: true,
      data: {
        user: userData,
        accessToken,
        refreshToken,
        accessTokenExpires,
        refreshTokenExpires,
        tokenType: 'Bearer',
      },
    });
    
    // Add CORS headers
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    return response;
  } catch (error) {
    console.error('Mobile login error:', error);
    const response = NextResponse.json(
      {
        success: false,
        error: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
      },
      { status: 500 }
    );
    
    // Add CORS headers
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
  
  // Add CORS headers
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  
  return response;
}

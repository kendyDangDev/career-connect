export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobile-auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token không được cung cấp',
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await verifyMobileToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token không hợp lệ hoặc đã hết hạn',
        },
        { status: 401 }
      );
    }

    // Get fresh user data from database
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
                companySlug: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Người dùng không tồn tại',
        },
        { status: 404 }
      );
    }

    // Check if account is still active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Tài khoản không hoạt động',
        },
        { status: 403 }
      );
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
      profile: user.profile,
      // Include employer data if user is an employer
      ...(user.userType === 'EMPLOYER' &&
        user.companyUsers &&
        user.companyUsers.length > 0 && {
          employer: {
            id: user.companyUsers[0].id,
            position: (user.companyUsers as any)[0]?.position,
            isVerified: (user.companyUsers as any)[0]?.isVerified,
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

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        token: {
          valid: true,
          expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
        },
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    const message = error instanceof Error ? error.message : 'Đã có lỗi xảy ra';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}

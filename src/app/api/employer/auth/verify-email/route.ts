import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailVerificationSchema } from '@/lib/validations/employer';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { token } = emailVerificationSchema.parse(body);
    
    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            companyUsers: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });
    
    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      );
    }
    
    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: 'Token đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực' },
        { status: 400 }
      );
    }
    
    // Check if token has been used
    if (verificationToken.used) {
      return NextResponse.json(
        { error: 'Token đã được sử dụng' },
        { status: 400 }
      );
    }
    
    // Update user and token
    await prisma.$transaction(async (tx) => {
      // Mark token as used
      await tx.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      });
      
      // Update user email verification status
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { 
          emailVerified: true,
          // Don't activate user yet - need phone verification too
        },
      });
      
      // Log the verification
      await tx.auditLog.create({
        data: {
          userId: verificationToken.userId,
          action: 'EMAIL_VERIFIED',
          tableName: 'users',
          recordId: verificationToken.userId,
          newValues: { emailVerified: true },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    });
    
    // Check if phone is also verified
    const phoneVerificationCount = await prisma.phoneVerificationToken.count({
      where: {
        userId: verificationToken.userId,
        used: true,
      },
    });
    
    const isPhoneVerified = phoneVerificationCount > 0;
    const company = verificationToken.user.companyUsers[0]?.company;
    
    return NextResponse.json({
      message: 'Email đã được xác thực thành công',
      emailVerified: true,
      phoneVerified: isPhoneVerified,
      nextStep: isPhoneVerified ? 'AWAITING_APPROVAL' : 'PHONE_VERIFICATION',
      company: company ? {
        id: company.id,
        name: company.companyName,
        verificationStatus: company.verificationStatus,
      } : null,
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi trong quá trình xác thực email' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify email from link
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token không được cung cấp' },
        { status: 400 }
      );
    }
    
    // Call the POST handler with the token
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ token }),
    });
    
    return POST(postRequest);
    
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi trong quá trình xác thực email' },
      { status: 500 }
    );
  }
}

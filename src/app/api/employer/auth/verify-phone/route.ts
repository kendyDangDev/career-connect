import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { phoneVerificationSchema } from '@/lib/validations/employer';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { phone, otp } = phoneVerificationSchema.parse(body);
    
    // Normalize phone number
    const normalizedPhone = phone.replace(/\s/g, '');
    
    // Find the verification token
    const verificationToken = await prisma.phoneVerificationToken.findFirst({
      where: {
        phone: normalizedPhone,
        token: otp,
        used: false,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Mã OTP không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới' },
        { status: 400 }
      );
    }
    
    const company = verificationToken.user.companyUsers[0]?.company;
    
    // Update token and check if ready for admin approval
    await prisma.$transaction(async (tx) => {
      // Mark token as used
      await tx.phoneVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      });
      
      // Check if email is also verified
      const user = await tx.user.findUnique({
        where: { id: verificationToken.userId },
        select: { emailVerified: true },
      });
      
      // If both email and phone are verified, user is ready for admin approval
      if (user?.emailVerified) {
        // Update company status to show it's ready for admin review
        if (company) {
          await tx.company.update({
            where: { id: company.id },
            data: {
              // verificationStatus remains 'PENDING' but we can add metadata
              updatedAt: new Date(),
            },
          });
          
          // Create notification for admins
          const admins = await tx.user.findMany({
            where: {
              userType: 'ADMIN',
              status: 'ACTIVE',
            },
            select: { id: true },
          });
          
          for (const admin of admins) {
            await tx.notification.create({
              data: {
                userId: admin.id,
                type: 'SYSTEM',
                title: 'Công ty mới chờ phê duyệt',
                message: `${company.companyName} đã hoàn tất xác thực và đang chờ phê duyệt.`,
                data: {
                  companyId: company.id,
                  companyName: company.companyName,
                },
              },
            });
          }
        }
      }
      
      // Log the verification
      await tx.auditLog.create({
        data: {
          userId: verificationToken.userId,
          action: 'PHONE_VERIFIED',
          tableName: 'users',
          recordId: verificationToken.userId,
          newValues: { phoneVerified: true, phone: normalizedPhone },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    });
    
    // Check verification status
    const user = await prisma.user.findUnique({
      where: { id: verificationToken.userId },
      select: { emailVerified: true },
    });
    
    const bothVerified = user?.emailVerified === true;
    
    return NextResponse.json({
      message: 'Số điện thoại đã được xác thực thành công',
      phoneVerified: true,
      emailVerified: user?.emailVerified || false,
      nextStep: bothVerified ? 'AWAITING_APPROVAL' : 'EMAIL_VERIFICATION',
      company: company ? {
        id: company.id,
        name: company.companyName,
        verificationStatus: company.verificationStatus,
      } : null,
    });
    
  } catch (error) {
    console.error('Phone verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi trong quá trình xác thực số điện thoại' },
      { status: 500 }
    );
  }
}

// Endpoint to resend OTP
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Số điện thoại không được cung cấp' },
        { status: 400 }
      );
    }
    
    // Normalize phone number
    const normalizedPhone = phone.replace(/\s/g, '');
    
    // Find user by phone
    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
      select: { id: true, firstName: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy người dùng với số điện thoại này' },
        { status: 404 }
      );
    }
    
    // Check rate limiting - max 3 OTP requests per hour
    const recentTokens = await prisma.phoneVerificationToken.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        },
      },
    });
    
    if (recentTokens >= 3) {
      return NextResponse.json(
        { error: 'Bạn đã yêu cầu quá nhiều mã OTP. Vui lòng thử lại sau 1 giờ' },
        { status: 429 }
      );
    }
    
    // Generate new OTP
    const { generateOTP, getPhoneVerificationExpiry } = await import('@/lib/auth-utils');
    const newOTP = generateOTP();
    
    // Create new token
    await prisma.phoneVerificationToken.create({
      data: {
        userId: user.id,
        phone: normalizedPhone,
        token: newOTP,
        expires: getPhoneVerificationExpiry(),
      },
    });
    
    // Send SMS (placeholder - implement actual SMS service)
    console.log(`[SMS] Sending OTP ${newOTP} to ${normalizedPhone}`);
    
    return NextResponse.json({
      message: 'Mã OTP mới đã được gửi đến số điện thoại của bạn',
      phone: normalizedPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1***$3'), // Mask middle digits
    });
    
  } catch (error) {
    console.error('OTP resend error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi trong quá trình gửi mã OTP' },
      { status: 500 }
    );
  }
}

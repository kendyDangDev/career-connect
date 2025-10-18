import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPhoneSchema } from '@/lib/validations';
import { authRateLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = authRateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();

    // Validate input
    const { error, value } = verifyPhoneSchema.validate(body);
    if (error) {
      return NextResponse.json(
        {
          error: 'Dữ liệu không hợp lệ',
          details: error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message,
          })),
        },
        { status: 400 }
      );
    }

    const { phone, token } = value;

    // Normalize phone number
    const normalizedPhone = phone.replace(/\s+/g, '');

    // Find the verification token
    const verificationToken = await prisma.phoneVerificationToken.findFirst({
      where: {
        phone: normalizedPhone,
        token,
        used: false,
      },
      include: {
        user: true,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Mã xác thực không chính xác hoặc đã được sử dụng' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới' },
        { status: 400 }
      );
    }

    // Update user and mark token as used in transaction
    await prisma.$transaction(async (tx) => {
      // Update user phone verification
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { phoneVerified: true },
      });

      // Mark token as used
      await tx.phoneVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      });

      // Clean up other unused tokens for this phone
      await tx.phoneVerificationToken.deleteMany({
        where: {
          phone: normalizedPhone,
          used: false,
          id: { not: verificationToken.id },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Số điện thoại đã được xác thực thành công!',
      user: {
        id: verificationToken.user.id,
        phone: verificationToken.user.phone,
        phoneVerified: true,
      },
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi trong quá trình xác thực số điện thoại' },
      { status: 500 }
    );
  }
}

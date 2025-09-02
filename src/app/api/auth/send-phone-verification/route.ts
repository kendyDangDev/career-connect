import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPhoneVerificationSchema } from '@/lib/validations';
import {
  generateNumericToken,
  sendPhoneVerificationSMS,
  getPhoneVerificationExpiry,
} from '@/lib/auth-utils';
import { smsRateLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = smsRateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    
    // Validate input
    const { error, value } = sendPhoneVerificationSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: 'Số điện thoại không hợp lệ' },
        { status: 400 }
      );
    }

    const { phone } = value;

    // Normalize phone number (remove spaces, standardize format)
    const normalizedPhone = phone.replace(/\s+/g, '');

    // Check if user exists and phone belongs to them
    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Số điện thoại không tồn tại trong hệ thống' },
        { status: 404 }
      );
    }

    if (user.phoneVerified) {
      return NextResponse.json(
        { error: 'Số điện thoại đã được xác thực' },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationCode = generateNumericToken(6);

    // Clean up expired tokens and create new one
    await prisma.$transaction(async (tx) => {
      // Delete old unused tokens for this user and phone
      await tx.phoneVerificationToken.deleteMany({
        where: {
          userId: user.id,
          phone: normalizedPhone,
        },
      });

      // Create new verification token
      await tx.phoneVerificationToken.create({
        data: {
          userId: user.id,
          phone: normalizedPhone,
          token: verificationCode,
          expires: getPhoneVerificationExpiry(),
        },
      });
    });

    // Send SMS (don't wait for it to complete)
    sendPhoneVerificationSMS(normalizedPhone, verificationCode).catch((error) => {
      console.error('Failed to send SMS:', error);
      // You might want to log this to an error tracking service
    });

    return NextResponse.json({
      success: true,
      message: 'Mã xác thực đã được gửi đến số điện thoại của bạn',
      expiresIn: 10 * 60, // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Phone verification send error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi gửi mã xác thực' },
      { status: 500 }
    );
  }
}

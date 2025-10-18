import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generateToken,
  generateNumericToken,
  sendVerificationEmail,
  sendVerificationEmailWithCode,
  getEmailVerificationExpiry,
} from '@/lib/auth-utils';
import { emailRateLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = emailRateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Không tìm thấy tài khoản với email này' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email này đã được xác thực' },
        { status: 400 }
      );
    }

    // Delete any existing verification tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new token and verification code
    const token = generateToken();
    const verificationCode = generateNumericToken(6); // 6-digit verification code

    // Create new verification token with code
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        verificationCode, // Store the numeric code
        expires: getEmailVerificationExpiry(),
      },
    });

    // Send verification email with code
    await sendVerificationEmailWithCode(email, verificationCode, token, user.firstName || undefined);

    return NextResponse.json(
      {
        success: true,
        message: 'Email xác thực đã được gửi lại.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Phương thức không được hỗ trợ' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Phương thức không được hỗ trợ' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Phương thức không được hỗ trợ' },
    { status: 405 }
  );
}

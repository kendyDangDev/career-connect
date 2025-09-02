import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyEmailSchema } from '@/lib/validations';
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
    const { error, value } = verifyEmailSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: 'Token xác thực không hợp lệ' }, { status: 400 });
    }

    const { token } = value;

    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        token,
        used: false,
      },
      include: {
        user: true,
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token xác thực không tồn tại hoặc đã được sử dụng' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      return NextResponse.json({ error: 'Token xác thực đã hết hạn' }, { status: 400 });
    }

    // Update user and mark token as used in transaction
    await prisma.$transaction(async (tx) => {
      // Update user email verification
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      });

      // Mark token as used
      await tx.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Email đã được xác thực thành công!',
      user: {
        id: verificationToken.user.id,
        email: verificationToken.user.email,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi trong quá trình xác thực email' },
      { status: 500 }
    );
  }
}

// GET method for verifying via URL link (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token xác thực là bắt buộc' }, { status: 400 });
    }

    // Reuse the POST logic
    return POST(
      new NextRequest(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify({ token }),
      })
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi trong quá trình xác thực email' },
      { status: 500 }
    );
  }
}

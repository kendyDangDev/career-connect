import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyEmailSchema } from '@/lib/validations';
import { authRateLimiter, emailRateLimiter } from '@/lib/rate-limiter';
import {
  generateToken,
  generateNumericToken,
  sendVerificationEmailWithCode,
  getEmailVerificationExpiry,
} from '@/lib/auth-utils';
import { convertSegmentPathToStaticExportFilename } from 'next/dist/shared/lib/segment-cache/segment-value-encoding';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = authRateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    console.log('payload verify email:', body);

    // Validate input
    const { error, value } = verifyEmailSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: 'Token xác thực không hợp lệ' }, { status: 400 });
    }
    const { token } = value;

    // Find the verification token based on method (token OR verification code)
    let verificationToken;

    // Check if the input looks like a 6-digit verification code
    const isVerificationCode = /^\d{6}$/.test(token);
    // const isVerificationCode = token;

    console.log(isVerificationCode);

    if (isVerificationCode) {
      // Find by verification code
      console.log(await prisma.emailVerificationToken.findMany());
      verificationToken = await prisma.emailVerificationToken.findFirst({
        where: {
          verificationCode: token,
          used: false,
        },
        include: { user: true },
      });
      console.log('verication:', verificationToken);
    } else {
      // Find by token (original method)
      verificationToken = await prisma.emailVerificationToken.findFirst({
        where: { token, used: false },
        include: { user: true },
      });
    }

    if (!verificationToken) {
      return NextResponse.json(
        {
          error: 'Token xác thực không tồn tại hoặc đã được sử dụng',
        },
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

// PUT method for sending verification email with code
export async function PUT(request: NextRequest) {
  try {
    // Rate limiting for email sending
    const rateLimitResponse = emailRateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email là bắt buộc' }, { status: 400 });
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
      return NextResponse.json({ error: 'Email này đã được xác thực' }, { status: 400 });
    }

    // Delete any existing verification tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new token and numeric code
    const token = generateToken();
    const verificationCode = generateNumericToken(6); // 6-digit code

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
    await sendVerificationEmailWithCode(
      email,
      verificationCode,
      token,
      user.firstName || undefined
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Email xác thực với mã đã được gửi thành công.',
        data: {
          email: user.email,
          codeLength: 6,
          expiresIn: '24 hours',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send verification email with code error:', error);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra khi gửi email xác thực' }, { status: 500 });
  }
}

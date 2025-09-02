import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import {
  hashPassword,
  generateToken,
  sendVerificationEmail,
  getEmailVerificationExpiry,
} from '@/lib/auth-utils';
import { registerRateLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = registerRateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();

    // Validate input data
    const { error, value } = registerSchema.validate(body, { abortEarly: false });
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

    const { email, password, firstName, lastName, phone, dateOfBirth } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 409 });
      }
      if (existingUser.phone === phone) {
        return NextResponse.json({ error: 'Số điện thoại này đã được sử dụng' }, { status: 409 });
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate email verification token
    const emailToken = generateToken();

    // Create user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          firstName,
          lastName,
          phone: phone || null,
        },
      });

      // Create user profile
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        },
      });

      // Create candidate record
      const candidate = await tx.candidate.create({
        data: {
          userId: user.id,
        },
      });

      // Create email verification token
      const verificationToken = await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: emailToken,
          expires: getEmailVerificationExpiry(),
        },
      });

      return { user, profile, candidate, verificationToken };
    });

    // Send verification email (don't wait for it to complete)
    sendVerificationEmail(email, emailToken, firstName).catch((error) => {
      console.error('Failed to send verification email:', error);
      // You might want to log this to an error tracking service
    });

    // Return success response (without sensitive data)
    return NextResponse.json(
      {
        success: true,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          emailVerified: result.user.emailVerified,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Email hoặc số điện thoại đã được sử dụng' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: 'Phương thức không được hỗ trợ' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Phương thức không được hỗ trợ' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Phương thức không được hỗ trợ' }, { status: 405 });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    const email = searchParams.get('email');

    if (!userId && !companyId && !email) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp userId, companyId hoặc email' },
        { status: 400 }
      );
    }

    // Find user and company information
    let user = null;
    let company = null;

    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          companyUsers: {
            include: {
              company: true,
            },
          },
        },
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          companyUsers: {
            include: {
              company: true,
            },
          },
        },
      });
    } else if (companyId) {
      company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          companyUsers: {
            include: {
              user: true,
            },
          },
        },
      });
      user = company?.companyUsers[0]?.user;
    }

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin người dùng' }, { status: 404 });
    }

    //Chưa fix lỗi

    // if (!company && user.companyUsers.length > 0) {
    //   company = user.companyUsers[0].company;
    // }

    if (!company) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin công ty' }, { status: 404 });
    }

    // Check verification status
    const emailVerificationCount = await prisma.emailVerificationToken.count({
      where: {
        userId: user.id,
        used: true,
      },
    });

    const phoneVerificationCount = await prisma.phoneVerificationToken.count({
      where: {
        userId: user.id,
        used: true,
      },
    });

    const emailVerified = user.emailVerified || emailVerificationCount > 0;
    const phoneVerified = phoneVerificationCount > 0;

    // Determine current step
    let currentStep: string;
    let nextAction: string | null = null;

    if (!emailVerified) {
      currentStep = 'EMAIL_VERIFICATION';
      nextAction = 'Vui lòng kiểm tra email và xác thực tài khoản';
    } else if (!phoneVerified) {
      currentStep = 'PHONE_VERIFICATION';
      nextAction = 'Vui lòng xác thực số điện thoại của bạn';
    } else if (company.verificationStatus === 'PENDING') {
      currentStep = 'AWAITING_APPROVAL';
      nextAction = 'Đang chờ quản trị viên phê duyệt';
    } else if (company.verificationStatus === 'VERIFIED') {
      currentStep = 'COMPLETED';
      nextAction = 'Tài khoản đã được kích hoạt, bạn có thể đăng nhập';
    } else if (company.verificationStatus === 'REJECTED') {
      currentStep = 'REJECTED';
      nextAction = 'Tài khoản đã bị từ chối, vui lòng liên hệ hỗ trợ';
    } else {
      currentStep = 'UNKNOWN';
      nextAction = null;
    }

    // Get timeline of verification steps
    const timeline = [];

    // Registration
    timeline.push({
      step: 'REGISTRATION',
      status: 'COMPLETED',
      completedAt: user.createdAt,
      description: 'Đăng ký tài khoản',
    });

    // Email verification
    if (emailVerified) {
      const emailToken = await prisma.emailVerificationToken.findFirst({
        where: { userId: user.id, used: true },
        orderBy: { createdAt: 'desc' },
      });

      timeline.push({
        step: 'EMAIL_VERIFICATION',
        status: 'COMPLETED',
        completedAt: emailToken?.createdAt || null,
        description: 'Xác thực email',
      });
    } else {
      timeline.push({
        step: 'EMAIL_VERIFICATION',
        status: 'PENDING',
        description: 'Xác thực email',
      });
    }

    // Phone verification
    if (phoneVerified) {
      const phoneToken = await prisma.phoneVerificationToken.findFirst({
        where: { userId: user.id, used: true },
        orderBy: { createdAt: 'desc' },
      });

      timeline.push({
        step: 'PHONE_VERIFICATION',
        status: 'COMPLETED',
        completedAt: phoneToken?.createdAt || null,
        description: 'Xác thực số điện thoại',
      });
    } else {
      timeline.push({
        step: 'PHONE_VERIFICATION',
        status: emailVerified ? 'PENDING' : 'WAITING',
        description: 'Xác thực số điện thoại',
      });
    }

    // Admin approval
    if (emailVerified && phoneVerified) {
      if (company.verificationStatus === 'VERIFIED') {
        timeline.push({
          step: 'ADMIN_APPROVAL',
          status: 'COMPLETED',
          completedAt: company.updatedAt,
          description: 'Phê duyệt từ quản trị viên',
        });
      } else if (company.verificationStatus === 'REJECTED') {
        timeline.push({
          step: 'ADMIN_APPROVAL',
          status: 'REJECTED',
          completedAt: company.updatedAt,
          description: 'Bị từ chối bởi quản trị viên',
        });
      } else {
        timeline.push({
          step: 'ADMIN_APPROVAL',
          status: 'PENDING',
          description: 'Phê duyệt từ quản trị viên',
        });
      }
    } else {
      timeline.push({
        step: 'ADMIN_APPROVAL',
        status: 'WAITING',
        description: 'Phê duyệt từ quản trị viên',
      });
    }

    return NextResponse.json({
      status: {
        currentStep,
        nextAction,
        emailVerified,
        phoneVerified,
        companyVerificationStatus: company.verificationStatus,
        userStatus: user.status,
      },
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        phone: user.phone,
      },
      company: {
        id: company.id,
        name: company.companyName,
        slug: company.companySlug,
        verificationStatus: company.verificationStatus,
      },
      timeline,
    });
  } catch (error) {
    console.error('Registration status error:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi kiểm tra trạng thái đăng ký' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { companyRegistrationSchema } from '@/lib/validations/employer';
import {
  hashPassword,
  generateToken,
  getEmailVerificationExpiry,
  getPhoneVerificationExpiry,
} from '@/lib/auth-utils';
//generateOTP
import { emailService } from '@/lib/services/email.service';
import { uploadService } from '@/lib/services/upload.service';
import { z } from 'zod';

// Helper function to generate company slug
function generateCompanySlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Parse form data into object
    const data: any = {};
    const files: { [key: string]: File } = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files[key] = value;
      } else {
        // Handle number fields
        if (['foundedYear'].includes(key) && value) {
          data[key] = parseInt(value as string);
        } else {
          data[key] = value;
        }
      }
    }

    // Add files to data object for validation
    data.businessLicenseFile = files.businessLicenseFile;
    data.authorizationLetterFile = files.authorizationLetterFile;

    // Validate input
    const validatedData = companyRegistrationSchema.parse(data);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.userEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 400 });
    }

    // Check if company tax code already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { companyName: validatedData.companyName },
          // Tax code would need to be stored separately in a company details table
        ],
      },
    });

    if (existingCompany) {
      return NextResponse.json({ error: 'Công ty này đã được đăng ký' }, { status: 400 });
    }

    // Generate company slug
    let companySlug = generateCompanySlug(validatedData.companyName);
    let slugCount = 0;

    // Ensure unique slug
    while (await prisma.company.findUnique({ where: { companySlug } })) {
      slugCount++;
      companySlug = `${generateCompanySlug(validatedData.companyName)}-${slugCount}`;
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create user account
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await tx.user.create({
        data: {
          email: validatedData.userEmail,
          passwordHash: hashedPassword,
          userType: 'EMPLOYER',
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.userPhone,
          emailVerified: false,
          status: 'INACTIVE', // Will be activated after verification
        },
      });

      // 2. Create company
      const company = await tx.company.create({
        data: {
          companyName: validatedData.companyName,
          companySlug,
          industryId: validatedData.industryId,
          companySize: validatedData.companySize,
          websiteUrl: validatedData.websiteUrl || null,
          description: validatedData.description || null,
          address: validatedData.address,
          city: validatedData.city,
          province: validatedData.province,
          phone: validatedData.companyPhone,
          email: validatedData.companyEmail,
          foundedYear: validatedData.foundedYear || null,
          verificationStatus: 'PENDING',
        },
      });

      // 3. Link user to company as admin
      await tx.companyUser.create({
        data: {
          companyId: company.id,
          userId: user.id,
          role: 'ADMIN',
          isPrimaryContact: true,
          permissions: {
            canManageJobs: true,
            canManageApplications: true,
            canManageCompany: true,
            canInviteMembers: true,
          },
        },
      });

      // 4. Upload documents
      const uploadPromises = [];

      // Upload business license
      if (files.businessLicenseFile) {
        const businessLicenseBuffer = Buffer.from(await files.businessLicenseFile.arrayBuffer());
        uploadPromises.push(
          uploadService.uploadCompanyDocument(
            businessLicenseBuffer,
            files.businessLicenseFile.name,
            files.businessLicenseFile.type,
            company.id,
            'business-license'
          )
        );
      }

      // Upload authorization letter if provided
      if (files.authorizationLetterFile) {
        const authorizationLetterBuffer = Buffer.from(
          await files.authorizationLetterFile.arrayBuffer()
        );
        uploadPromises.push(
          uploadService.uploadCompanyDocument(
            authorizationLetterBuffer,
            files.authorizationLetterFile.name,
            files.authorizationLetterFile.type,
            company.id,
            'authorization-letter'
          )
        );
      }

      const uploadResults = await Promise.all(uploadPromises);

      // 5. Store document URLs in a separate table or as JSON
      // For now, we'll store in audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'COMPANY_REGISTRATION',
          tableName: 'companies',
          recordId: company.id,
          newValues: {
            documents: uploadResults.map((result) => ({
              url: result.url,
              key: result.key,
              type: result.mimeType,
              size: result.size,
            })),
          },
          ipAddress:
            request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      // 6. Create email verification token
      const emailToken = generateToken();
      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: emailToken,
          expires: getEmailVerificationExpiry(),
        },
      });

      // 7. Create phone verification token
      // const phoneOTP = generateOTP();
      // await tx.phoneVerificationToken.create({
      //   data: {
      //     userId: user.id,
      //     phone: validatedData.userPhone,
      //     token: phoneOTP,
      //     expires: getPhoneVerificationExpiry(),
      //   },
      // });

      return { user, company, emailToken };
    });

    // Send verification email
    await emailService.sendCompanyVerificationEmail(
      validatedData.userEmail,
      result.emailToken,
      validatedData.companyName,
      validatedData.firstName
    );

    // Send SMS verification (if configured)
    // await smsService.sendVerificationSMS(validatedData.userPhone, result.phoneOTP);

    // Notify admins
    await emailService.sendAdminNotificationForNewCompany(
      validatedData.companyName,
      `${validatedData.firstName} ${validatedData.lastName}`,
      result.company.id
    );

    return NextResponse.json({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      userId: result.user.id,
      companyId: result.company.id,
      requiresEmailVerification: true,
      requiresPhoneVerification: true,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Đã xảy ra lỗi trong quá trình đăng ký' }, { status: 500 });
  }
}

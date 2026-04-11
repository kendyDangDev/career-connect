import { randomUUID } from 'crypto';

import { NotificationType, Prisma, UserType, VerificationStatus } from '@/generated/prisma';
import { withAuth, withRole, type AuthenticatedRequest, createAuditLog } from '@/lib/middleware';
import { errorResponse, successResponse, conflictResponse, serverErrorResponse } from '@/utils/api-response';
import {
  candidateEmployerCreateSchema,
  candidateEmployerUpdateSchema,
} from '@/lib/validations/company.validation';
import { emailService } from '@/lib/services/email.service';
import { prisma } from '@/lib/prisma';
import { CandidateEmployerRequestService } from '@/services/candidate/employer-request.service';
import { UploadService } from '@/services/upload.service';

async function notifyAdminsOfEmployerRequest(
  companyId: string,
  companyName: string,
  representativeName: string,
  isResubmission: boolean
) {
  await emailService.sendAdminNotificationForNewCompany(companyName, representativeName, companyId);

  const adminUsers = await prisma.user.findMany({
    where: {
      userType: UserType.ADMIN,
      status: 'ACTIVE',
    },
    select: {
      id: true,
    },
  });

  if (adminUsers.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: adminUsers.map((admin) => ({
      userId: admin.id,
      type: NotificationType.SYSTEM,
      title: isResubmission ? 'Yêu cầu nhà tuyển dụng được nộp lại' : 'Yêu cầu trở thành nhà tuyển dụng mới',
      message: `${companyName} đang chờ admin xét duyệt.`,
      data: {
        companyId,
        url: '/admin/companies',
        notificationKind: 'EMPLOYER_REQUEST',
        isResubmission,
      } satisfies Prisma.InputJsonValue,
    })),
  });
}

async function runPostRequestSideEffects(
  operation: 'create' | 'resubmit',
  requestUserId: string,
  companyId: string,
  companyName: string,
  representativeName: string,
  requestState: Awaited<ReturnType<typeof CandidateEmployerRequestService.getRequestState>>,
  req: AuthenticatedRequest,
  previousState?: {
    verificationStatus: VerificationStatus;
    verificationNotes: string | null;
  }
) {
  try {
    await notifyAdminsOfEmployerRequest(
      companyId,
      companyName,
      representativeName,
      operation === 'resubmit'
    );
  } catch (error) {
    console.error(`Failed to notify admins after ${operation} employer request:`, error);
  }

  await createAuditLog(
    requestUserId,
    operation === 'create' ? 'CREATE_EMPLOYER_REQUEST' : 'RESUBMIT_EMPLOYER_REQUEST',
    'companies',
    companyId,
    previousState ?? null,
    requestState.company,
    req
  );
}

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user) {
      return errorResponse('Unauthorized', 401);
    }

    if (req.user.userType !== UserType.CANDIDATE && req.user.userType !== UserType.EMPLOYER) {
      return errorResponse('You do not have permission to access this resource', 403);
    }

    const requestState = await CandidateEmployerRequestService.getRequestState(req.user.id);

    return successResponse(requestState, 'Employer request retrieved successfully');
  } catch (error) {
    return serverErrorResponse('Failed to load employer request', error);
  }
});

export const POST = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    const formData = (await req.formData()) as unknown as FormData;
    const businessLicenseFile = formData.get('businessLicenseFile');
    const logoFile = formData.get('logoFile');

    const parsedPayload = candidateEmployerCreateSchema.safeParse({
      companyName: formData.get('companyName'),
      industryId: formData.get('industryId'),
      companySize: formData.get('companySize'),
      websiteUrl: formData.get('websiteUrl'),
      description: formData.get('description'),
      businessLicenseFile,
      logoFile,
    });

    if (!parsedPayload.success) {
      return errorResponse('Validation failed', 400, parsedPayload.error.flatten().fieldErrors);
    }

    const existingState = await CandidateEmployerRequestService.getRequestState(req.user!.id);
    if (existingState.status !== 'NONE') {
      return conflictResponse('Bạn đã có yêu cầu trở thành nhà tuyển dụng trong hệ thống.');
    }

    const companyId = randomUUID();
    const uploadedFiles: string[] = [];

    const businessLicenseUpload = await UploadService.uploadBusinessLicense(
      parsedPayload.data.businessLicenseFile,
      companyId
    );

    if (!businessLicenseUpload.success || !businessLicenseUpload.fileUrl) {
      return errorResponse(businessLicenseUpload.error || 'Không thể tải tài liệu xác minh', 400);
    }

    uploadedFiles.push(businessLicenseUpload.fileUrl);

    let logoUrl: string | null = null;
    if (parsedPayload.data.logoFile) {
      const logoUpload = await UploadService.uploadCompanyLogo(parsedPayload.data.logoFile, companyId);

      if (!logoUpload.success || !logoUpload.fileUrl) {
        await Promise.all(uploadedFiles.map((fileUrl) => UploadService.deleteFile(fileUrl)));
        return errorResponse(logoUpload.error || 'Không thể tải logo công ty', 400);
      }

      logoUrl = logoUpload.fileUrl;
      uploadedFiles.push(logoUpload.fileUrl);
    }

    try {
      const requestState = await CandidateEmployerRequestService.createRequest(req.user!.id, {
        companyId,
        companyName: parsedPayload.data.companyName,
        industryId: parsedPayload.data.industryId,
        companySize: parsedPayload.data.companySize,
        websiteUrl: parsedPayload.data.websiteUrl ?? null,
        description: parsedPayload.data.description ?? null,
        logoUrl,
        businessLicenseUrl: businessLicenseUpload.fileUrl,
      });

      const representativeName =
        [req.user?.firstName, req.user?.lastName].filter(Boolean).join(' ') || req.user!.email;

      await runPostRequestSideEffects(
        'create',
        req.user!.id,
        companyId,
        parsedPayload.data.companyName,
        representativeName,
        requestState,
        req
      );

      return successResponse(requestState, 'Đã gửi yêu cầu trở thành nhà tuyển dụng', 201);
    } catch (error) {
      await Promise.all(uploadedFiles.map((fileUrl) => UploadService.deleteFile(fileUrl)));
      throw error;
    }
  } catch (error) {
    return serverErrorResponse('Failed to create employer request', error);
  }
});

export const PUT = withRole([UserType.CANDIDATE], async (req: AuthenticatedRequest) => {
  try {
    const currentCompany = await CandidateEmployerRequestService.getRequestCompany(req.user!.id);
    if (!currentCompany) {
      return errorResponse('Không tìm thấy yêu cầu nhà tuyển dụng', 404);
    }

    if (currentCompany.verificationStatus !== VerificationStatus.REJECTED) {
      return errorResponse('Chỉ có thể cập nhật yêu cầu đã bị từ chối', 400);
    }

    const formData = (await req.formData()) as unknown as FormData;
    const businessLicenseFile = formData.get('businessLicenseFile');
    const logoFile = formData.get('logoFile');

    const parsedPayload = candidateEmployerUpdateSchema.safeParse({
      companyName: formData.get('companyName'),
      industryId: formData.get('industryId'),
      companySize: formData.get('companySize'),
      websiteUrl: formData.get('websiteUrl'),
      description: formData.get('description'),
      businessLicenseFile: businessLicenseFile instanceof File && businessLicenseFile.size > 0
        ? businessLicenseFile
        : undefined,
      logoFile: logoFile instanceof File && logoFile.size > 0 ? logoFile : undefined,
    });

    if (!parsedPayload.success) {
      return errorResponse('Validation failed', 400, parsedPayload.error.flatten().fieldErrors);
    }

    const newlyUploadedFiles: string[] = [];

    let nextBusinessLicenseUrl: string | null = null;
    if (parsedPayload.data.businessLicenseFile) {
      const businessLicenseUpload = await UploadService.uploadBusinessLicense(
        parsedPayload.data.businessLicenseFile,
        currentCompany.id
      );

      if (!businessLicenseUpload.success || !businessLicenseUpload.fileUrl) {
        return errorResponse(
          businessLicenseUpload.error || 'Không thể tải tài liệu xác minh mới',
          400
        );
      }

      nextBusinessLicenseUrl = businessLicenseUpload.fileUrl;
      newlyUploadedFiles.push(businessLicenseUpload.fileUrl);
    }

    let nextLogoUrl: string | null = null;
    if (parsedPayload.data.logoFile) {
      const logoUpload = await UploadService.uploadCompanyLogo(parsedPayload.data.logoFile, currentCompany.id);

      if (!logoUpload.success || !logoUpload.fileUrl) {
        await Promise.all(newlyUploadedFiles.map((fileUrl) => UploadService.deleteFile(fileUrl)));
        return errorResponse(logoUpload.error || 'Không thể tải logo mới', 400);
      }

      nextLogoUrl = logoUpload.fileUrl;
      newlyUploadedFiles.push(logoUpload.fileUrl);
    }

    try {
      const requestState = await CandidateEmployerRequestService.updateRejectedRequest(req.user!.id, {
        companyName: parsedPayload.data.companyName,
        industryId: parsedPayload.data.industryId,
        companySize: parsedPayload.data.companySize,
        websiteUrl: parsedPayload.data.websiteUrl ?? null,
        description: parsedPayload.data.description ?? null,
        logoUrl: nextLogoUrl,
        businessLicenseUrl: nextBusinessLicenseUrl,
      });

      if (nextBusinessLicenseUrl && currentCompany.businessLicenseUrl) {
        try {
          await UploadService.deleteFile(currentCompany.businessLicenseUrl);
        } catch (cleanupError) {
          console.error('Failed to delete previous business license asset:', cleanupError);
        }
      }

      if (nextLogoUrl && currentCompany.logoUrl) {
        try {
          await UploadService.deleteFile(currentCompany.logoUrl);
        } catch (cleanupError) {
          console.error('Failed to delete previous company logo asset:', cleanupError);
        }
      }

      const representativeName =
        [req.user?.firstName, req.user?.lastName].filter(Boolean).join(' ') || req.user!.email;

      await runPostRequestSideEffects(
        'resubmit',
        req.user!.id,
        currentCompany.id,
        parsedPayload.data.companyName,
        representativeName,
        requestState,
        req,
        {
          verificationStatus: currentCompany.verificationStatus,
          verificationNotes: currentCompany.verificationNotes,
        }
      );

      return successResponse(requestState, 'Đã cập nhật và gửi lại yêu cầu xét duyệt');
    } catch (error) {
      await Promise.all(newlyUploadedFiles.map((fileUrl) => UploadService.deleteFile(fileUrl)));
      throw error;
    }
  } catch (error) {
    return serverErrorResponse('Failed to update employer request', error);
  }
});

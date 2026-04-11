import { NextRequest, NextResponse } from 'next/server';
import {
  withPermission,
  AuthenticatedRequest,
  createAuditLog,
  successResponse,
} from '@/lib/middleware';
import { AdminCompanyService } from '@/services/admin/company.service';
import { CompanyVerificationDTO } from '@/types/admin/company';
import { VerificationStatus } from '@/generated/prisma';

interface Params {
  params: {
    id: string;
  };
}

// PATCH: Update company verification status (Admin with company.verify permission)
export const PATCH = withPermission(
  'company.verify',
  async (request: AuthenticatedRequest, { params }: Params) => {
    try {
      const { id } = params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Company ID is required',
          },
          { status: 400 }
        );
      }

      // Parse request body
      const body: CompanyVerificationDTO = await request.json();
      const { verificationStatus, verificationNotes, notifyCompany } = body;

      // Validate status
      if (!verificationStatus || !Object.values(VerificationStatus).includes(verificationStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid verification status',
          },
          { status: 400 }
        );
      }

      if (
        verificationStatus === VerificationStatus.REJECTED &&
        !verificationNotes?.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Verification notes are required when rejecting a company',
          },
          { status: 400 }
        );
      }

      // Get current company data for audit
      const currentCompany = await AdminCompanyService.getCompanyDetail(id);
      if (!currentCompany) {
        return NextResponse.json(
          {
            success: false,
            error: 'Company not found',
          },
          { status: 404 }
        );
      }

      // Check if status is actually changing
      if (currentCompany.verificationStatus === verificationStatus) {
        return NextResponse.json(
          {
            success: false,
            error: 'Company already has this verification status',
          },
          { status: 400 }
        );
      }

      // Update verification status
      const updatedCompany = await AdminCompanyService.updateVerificationStatus(id, body);

      if (!updatedCompany) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to update verification status',
          },
          { status: 500 }
        );
      }

      // Log admin action
      await createAuditLog(
        request.user!.id,
        `UPDATE_VERIFICATION_STATUS_${verificationStatus}`,
        'companies',
        id,
        {
          verificationStatus: currentCompany.verificationStatus,
          verificationNotes: currentCompany.verificationNotes,
        },
        {
          verificationStatus,
          verificationNotes: verificationStatus === VerificationStatus.REJECTED
            ? verificationNotes?.trim() || null
            : null,
        },
        request
      );

      return successResponse(
        updatedCompany,
        `Company verification status updated to ${verificationStatus}`
      );
    } catch (error) {
      console.error('Error updating company verification status:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update verification status',
        },
        { status: 500 }
      );
    }
  }
);

import { NextRequest, NextResponse } from 'next/server';
import {
  withAdmin,
  AuthenticatedRequest,
  createAuditLog,
  successResponse,
  errorResponse,
} from '@/lib/middleware';
import { AdminCompanyService } from '@/services/admin/company.service';
import { AdminCompanyUpdateDTO } from '@/types/admin/company';

interface Params {
  params: {
    id: string;
  };
}

export const GET = withAdmin(async (request: AuthenticatedRequest, { params }: Params) => {
  try {
    const { id } = params;

    if (!id) {
      return errorResponse('INVALID_REQUEST', 'Company ID is required', 400);
    }

    // Get company detail
    const company = await AdminCompanyService.getCompanyDetail(id);

    if (!company) {
      return errorResponse('NOT_FOUND', 'Company not found', 404);
    }

    return successResponse(company);
  } catch (error) {
    console.error('Error fetching company detail:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch company detail',
      },
      { status: 500 }
    );
  }
});

export const PUT = withAdmin(async (request: AuthenticatedRequest, { params }: Params) => {
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
    const body: AdminCompanyUpdateDTO = await request.json();

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

    // Update company
    const updatedCompany = await AdminCompanyService.updateCompany(id, body);

    if (!updatedCompany) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update company',
        },
        { status: 500 }
      );
    }

    // Log admin action
    await createAuditLog(
      request.user!.id,
      'UPDATE_COMPANY',
      'companies',
      id,
      currentCompany,
      updatedCompany,
      request
    );

    return successResponse(updatedCompany, 'Company updated successfully');
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update company',
      },
      { status: 500 }
    );
  }
});

export const DELETE = withAdmin(async (request: AuthenticatedRequest, { params }: Params) => {
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

    // Parse query params to check if hard delete
    const searchParams = request.nextUrl.searchParams;
    const hardDelete = searchParams.get('hard') === 'true';

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

    // Delete company
    await AdminCompanyService.deleteCompany(id, hardDelete);

    // Log admin action
    await createAuditLog(
      request.user!.id,
      hardDelete ? 'HARD_DELETE_COMPANY' : 'SOFT_DELETE_COMPANY',
      'companies',
      id,
      currentCompany,
      null,
      request
    );

    return successResponse(
      null,
      `Company ${hardDelete ? 'permanently deleted' : 'deactivated'} successfully`
    );
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete company',
      },
      { status: 500 }
    );
  }
});

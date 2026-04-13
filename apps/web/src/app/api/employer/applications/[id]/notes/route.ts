export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { EmployerApplicationService } from '@/services/employer/application.service';
import { AddApplicationNoteDTO } from '@/types/employer/application';
import { ErrorCode } from '@/lib/errors/application-errors';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    if (session.user.userType !== 'EMPLOYER') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Employer access only' },
        { status: 403 }
      );
    }

    // Get company ID from session
    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'No company associated with user' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();

    const rawNote = typeof body.note === 'string' ? body.note : body.notes;

    // Validate note
    if (typeof rawNote !== 'string' || rawNote.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Note is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Validate note length
    if (rawNote.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Note cannot exceed 1000 characters' },
        { status: 400 }
      );
    }

    // Create note DTO
    const noteData: AddApplicationNoteDTO = {
      note: rawNote.trim(),
    };

    const { id } = await params;

    // Save note to application
    await EmployerApplicationService.addApplicationNote(id, companyId, noteData);

    return NextResponse.json({
      success: true,
      message: 'Note saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving application note:', error);

    if (error.message === 'Application not found or access denied') {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found or access denied',
        code: ErrorCode.APPLICATION_NOT_FOUND,
      },
      { status: 404 }
    );
  }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save note',
        code: ErrorCode.INTERNAL_ERROR,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { notificationService } from '@/lib/services/notification-service';
import { z } from 'zod';

const notificationQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  unreadOnly: z.coerce.boolean().default(false),
});

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = notificationQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      unreadOnly: searchParams.get('unreadOnly') === 'true',
    });

    const result = await notificationService.getUserNotifications(session.user.id, query);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = markAsReadSchema.parse(body);

    await notificationService.markNotificationsAsRead(session.user.id, data.notificationIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

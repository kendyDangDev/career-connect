import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { generateChatToken } from '@/lib/auth/chat-jwt';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate chat token
    const chatToken = generateChatToken({
      id: session.user.id,
      email: session.user.email!,
      firstName: session.user.firstName || null,
      lastName: session.user.lastName || null,
      userType: session.user.userType,
    });

    return NextResponse.json({
      token: chatToken,
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('Error generating chat token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

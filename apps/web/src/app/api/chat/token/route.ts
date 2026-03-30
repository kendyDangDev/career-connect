export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { generateChatToken } from '@/lib/auth/chat-jwt';
import { verifyAccessToken, extractBearerToken } from '@/lib/jwt-utils';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');

  try {
    let user = null;

    // First, try to get user from Bearer token (React Native)
    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        // Verify user still exists and is active
        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            userType: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        });

        if (dbUser && dbUser.status === 'ACTIVE') {
          user = dbUser;
        }
      }
    }

    // If no Bearer token or invalid, try NextAuth session (Web)
    if (!user) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        user = {
          id: session.user.id,
          email: session.user.email!,
          firstName: session.user.firstName || null,
          lastName: session.user.lastName || null,
          userType: session.user.userType,
        };
      }
    }

    if (!user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      // Add CORS headers for React Native
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return response;
    }

    // Generate chat token
    const chatToken = generateChatToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
    });

    const response = NextResponse.json({
      success: true,
      token: chatToken,
      expiresIn: '24h',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
      },
    });

    // Add CORS headers for React Native
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  } catch (error) {
    console.error('Error generating chat token:', error);

    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });

    // Add CORS headers for React Native
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');

  const response = new NextResponse(null, { status: 200 });

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

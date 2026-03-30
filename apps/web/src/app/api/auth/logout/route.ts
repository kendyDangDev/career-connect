export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Không tìm thấy phiên đăng nhập' }, { status: 401 });
    }

    // Log the logout event
    console.log(`User ${session.user?.email} logged out at ${new Date().toISOString()}`);

    const response = NextResponse.json({
      message: 'Đăng xuất thành công',
      success: true,
    });

    response.cookies.set('next-auth.session-token', '', {
      expires: new Date(0), // Set cookie to expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Lỗi khi đăng xuất' }, { status: 500 });
  }
}

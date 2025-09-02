import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Không tìm thấy phiên đăng nhập' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: session.user,
      expires: session.expires,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Lỗi khi kiểm tra phiên đăng nhập' },
      { status: 500 }
    );
  }
}

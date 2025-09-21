export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, blacklistToken, verifyAccessToken } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = extractBearerToken(authHeader);
    
    // Also check for refresh token in body (optional)
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refreshToken;

    if (!accessToken) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: 'Access token không được cung cấp' 
        },
        { status: 401 }
      );
      
      // Add CORS headers
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    // Verify the access token
    const decoded = verifyAccessToken(accessToken);

    if (!decoded) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: 'Access token không hợp lệ' 
        },
        { status: 401 }
      );
      
      // Add CORS headers
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
      
      return response;
    }

    // Blacklist the access token
    blacklistToken(accessToken);
    
    // Also blacklist refresh token if provided
    if (refreshToken) {
      blacklistToken(refreshToken);
    }
    
    // Log the logout event
    console.log(`User ${decoded.id} logged out successfully`);

    const response = NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công',
      data: {
        userId: decoded.id,
      },
    });
    
    // Add CORS headers
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    return response;

  } catch (error) {
    console.error('Mobile logout error:', error);
    const response = NextResponse.json(
      { 
        success: false, 
        error: 'Đã có lỗi xảy ra' 
      },
      { status: 500 }
    );
    
    // Add CORS headers
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    
    return response;
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  
  // Add CORS headers
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  
  return response;
}

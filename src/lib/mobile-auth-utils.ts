import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface MobileTokenPayload {
  id: string;
  email: string;
  userType: string;
  firstName: string | null;
  lastName: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Verify a JWT token and return the decoded payload
 */
export async function verifyMobileToken(token: string): Promise<MobileTokenPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MobileTokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Generate a new JWT token
 */
export function generateMobileToken(payload: Omit<MobileTokenPayload, 'iat' | 'exp'>, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware helper to verify token from request
 */
export async function verifyMobileRequest(request: Request): Promise<{
  isValid: boolean;
  user?: MobileTokenPayload;
  error?: string;
}> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      isValid: false,
      error: 'Token không được cung cấp',
    };
  }

  const decoded = await verifyMobileToken(token);
  if (!decoded) {
    return {
      isValid: false,
      error: 'Token không hợp lệ hoặc đã hết hạn',
    };
  }

  return {
    isValid: true,
    user: decoded,
  };
}

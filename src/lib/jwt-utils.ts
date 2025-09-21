import jwt, { JwtPayload } from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_ACCESS_TOKEN_EXPIRES = process.env.JWT_ACCESS_TOKEN_EXPIRES || '1h'; // 1 hour
const JWT_REFRESH_TOKEN_EXPIRES = process.env.JWT_REFRESH_TOKEN_EXPIRES || '30d'; // 30 days

export interface TokenPayload {
  id: string;
  email: string;
  userType: string;
  firstName: string | null;
  lastName: string | null;
}

export interface DecodedToken extends TokenPayload, JwtPayload {}

/**
 * Generate access token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRES,
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRES,
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(payload: TokenPayload): {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: string;
  refreshTokenExpires: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    accessTokenExpires: JWT_ACCESS_TOKEN_EXPIRES,
    refreshTokenExpires: JWT_REFRESH_TOKEN_EXPIRES,
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Note: For simplicity, we're using stateless JWT tokens.
 * In a production environment, you should consider storing refresh tokens
 * in a database for better security (ability to revoke tokens).
 */

// Token blacklist (in-memory for development, use Redis or database in production)
const tokenBlacklist = new Set<string>();

/**
 * Add token to blacklist (for logout)
 */
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
}

/**
 * Check if token is blacklisted
 */
export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

/**
 * Clear expired tokens from blacklist (call periodically)
 */
export function clearExpiredFromBlacklist(): void {
  // In a real implementation, you would check token expiry
  // For now, we'll just clear the whole list if it gets too large
  if (tokenBlacklist.size > 10000) {
    tokenBlacklist.clear();
  }
}

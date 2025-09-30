import jwt from 'jsonwebtoken';
import { User } from '@/generated/prisma';

export interface JWTPayload {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: string;
  iat?: number;
  exp?: number;
}

export const generateChatToken = (
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'userType'>
) => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    userType: user.userType,
  };

  return jwt.sign(payload, process.env.NEXTAUTH_SECRET!, {
    expiresIn: '24h',
    issuer: 'career-connect-chat',
  });
};

export const verifyChatToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!, {
      issuer: 'career-connect-chat',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const refreshChatToken = (token: string): string => {
  try {
    const decoded = verifyChatToken(token);

    // Generate new token with same payload but extended expiration
    const newPayload: JWTPayload = {
      userId: decoded.userId,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      userType: decoded.userType,
    };

    return jwt.sign(newPayload, process.env.NEXTAUTH_SECRET!, {
      expiresIn: '24h',
      issuer: 'career-connect-chat',
    });
  } catch (error) {
    throw new Error('Token refresh failed');
  }
};

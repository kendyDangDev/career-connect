import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { Twilio } from 'twilio';

// Initialize services
const resend = new Resend(process.env.RESEND_API_KEY);
const twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcryptjs.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword);
}

// Token utilities
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateNumericToken(length: number = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
}

export function generateJWT(payload: object, expiresIn: string = '24h'): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyJWT(token: string): any {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, secret);
}

// Email utilities
export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName?: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'Acme <dgf@resend.dev>',
    to: email,
    subject: 'Xác thực tài khoản Career Connect',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #2563eb;">Xác thực tài khoản của bạn</h2>
        <p>Xin chào ${firstName || ''},</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại Career Connect. Để hoàn tất quá trình đăng ký, vui lòng click vào nút bên dưới để xác thực email của bạn:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Xác thực Email
          </a>
        </div>

        <p>Hoặc copy và paste link sau vào trình duyệt:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>

        <p>Link này sẽ hết hạn sau 24 giờ.</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
          <br>
          © 2025 Career Connect. All rights reserved.
        </p>
      </div>
    `,
  });
  console.log('Verification email sent to:', email);
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  firstName?: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'no-reply@career-connect.com',
    to: email,
    subject: 'Đặt lại mật khẩu Career Connect',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626;">Đặt lại mật khẩu</h2>
        <p>Xin chào ${firstName || ''},</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Career Connect của mình. Click vào nút bên dưới để tạo mật khẩu mới:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Đặt lại mật khẩu
          </a>
        </div>
        
        <p>Hoặc copy và paste link sau vào trình duyệt:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          <br>
          © 2024 Career Connect. All rights reserved.
        </p>
      </div>
    `,
  });
}

// SMS utilities
export async function sendPhoneVerificationSMS(phone: string, token: string): Promise<void> {
  const message = `Mã xác thực Career Connect của bạn là: ${token}. Mã này có hiệu lực trong 10 phút.`;

  await twilio.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ cái thường');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ cái hoa');
  }

  if (!/\d/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generate expiry dates
export function getEmailVerificationExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
}

export function getPhoneVerificationExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
}

export function getPasswordResetExpiry(): Date {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}

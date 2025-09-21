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
    from: process.env.FROM_EMAIL || 'Career Connect <noreply@career-connect.com>',
    to: email,
    subject: 'Xác thực tài khoản Career Connect',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Logo và Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 20px;">
              <div style="width: 50px; height: 50px; background-color: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold; font-size: 18px;">CC</span>
              </div>
              <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: bold;">Career Connect</h1>
            </div>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">Nền tảng tuyển dụng hàng đầu Việt Nam</p>
          </div>

          <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px; text-align: center;">
            Xác thực tài khoản của bạn
          </h2>
          
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            Xin chào <strong>${firstName || 'bạn'}</strong>,
          </p>
          
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            Cảm ơn bạn đã đăng ký tài khoản tại Career Connect. Để hoàn tất quá trình đăng ký, vui lòng click vào nút bên dưới để xác thực email của bạn:
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationUrl}"
               style="background-color: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
              Xác thực Email
            </a>
          </div>

          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
              <strong>Hoặc copy và paste link sau vào trình duyệt:</strong><br>
              <span style="word-break: break-all; color: #2563eb;">${verificationUrl}</span>
            </p>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 30px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
              <strong>⏰ Lưu ý:</strong> Link xác thực này sẽ hết hạn sau 24 giờ.
            </p>
          </div>

          <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; line-height: 1.5;">
            Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.<br>
            Cần hỗ trợ? Liên hệ: <a href="mailto:support@career-connect.com" style="color: #2563eb;">support@career-connect.com</a><br>
            © 2025 Career Connect. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
  console.log('Verification email sent to:', email);
}

// Hàm gửi email xác thực với mã số
export async function sendVerificationEmailWithCode(
  email: string,
  verificationCode: string,
  token: string,
  firstName?: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'Career Connect <noreply@career-connect.com>',
    to: email,
    subject: 'Mã xác thực tài khoản Career Connect',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9fafb;">
        <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Logo và Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 20px;">
              <div style="width: 50px; height: 50px; background-color: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold; font-size: 18px;">CC</span>
              </div>
              <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: bold;">Career Connect</h1>
            </div>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">Nền tảng tuyển dụng hàng đầu Việt Nam</p>
          </div>

          <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px; text-align: center;">
            🔐 Mã xác thực tài khoản
          </h2>
          
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            Xin chào <strong>${firstName || 'bạn'}</strong>,
          </p>
          
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            Cảm ơn bạn đã đăng ký tài khoản tại Career Connect. Sử dụng mã xác thực bên dưới để hoàn tất quá trình đăng ký:
          </p>

          <!-- Mã xác thực -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
            <p style="color: white; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">MÃ XÁC THỰC CỦA BẠN</p>
            <div style="background-color: white; border-radius: 8px; padding: 20px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <span style="color: #2563eb; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${verificationCode}</span>
            </div>
          </div>

          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📋 Hướng dẫn sử dụng:</h3>
            <ol style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Trở lại trang đăng ký hoặc xác thực email</li>
              <li>Nhập mã <strong>${verificationCode}</strong> vào ô xác thực</li>
              <li>Click nút "Xác thực Email" để hoàn tất</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Hoặc click vào nút bên dưới để xác thực tự động:</p>
            <a href="${verificationUrl}"
               style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
              🚀 Xác thực ngay
            </a>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 30px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
              <strong>⏰ Lưu ý quan trọng:</strong><br>
              • Mã xác thực này có hiệu lực trong <strong>24 giờ</strong><br>
              • Mã chỉ có thể sử dụng <strong>một lần</strong><br>
              • Không chia sẻ mã này với bất kỳ ai
            </p>
          </div>

          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 30px 0;">
            <p style="color: #7f1d1d; margin: 0; font-size: 14px; line-height: 1.5;">
              <strong>🔒 Bảo mật:</strong> Nếu bạn không yêu cầu mã này, có thể ai đó đang cố gắng truy cập tài khoản của bạn. Vui lòng liên hệ với chúng tôi ngay lập tức.
            </p>
          </div>

          <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; line-height: 1.5;">
            Bạn nhận được email này vì đã đăng ký tài khoản tại Career Connect.<br>
            Cần hỗ trợ? Liên hệ: <a href="mailto:support@career-connect.com" style="color: #2563eb;">support@career-connect.com</a> | Hotline: 1900-1234<br>
            © 2025 Career Connect. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
  console.log('Verification email with code sent to:', email, 'Code:', verificationCode);
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

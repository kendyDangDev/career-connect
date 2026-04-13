import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'Career Connect <noreply@career-connect.com>';
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  private formatInterviewDateTime(interviewScheduledAt: string | Date): string {
    const date =
      interviewScheduledAt instanceof Date ? interviewScheduledAt : new Date(interviewScheduledAt);

    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(date);
  }

  async sendCompanyVerificationEmail(
    email: string,
    token: string,
    companyName: string,
    firstName?: string
  ): Promise<void> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/employer/auth/verify-email?token=${token}`;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Career Connect</h1>
          <p style="color: #6b7280; margin-top: 10px;">Nền tảng tuyển dụng hàng đầu Việt Nam</p>
        </div>

        <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">
          Xác thực tài khoản nhà tuyển dụng
        </h2>

        <p style="color: #374151; line-height: 1.6;">
          Xin chào ${firstName || ''},
        </p>

        <p style="color: #374151; line-height: 1.6;">
          Cảm ơn bạn đã đăng ký tài khoản nhà tuyển dụng cho <strong>${companyName}</strong> tại Career Connect.
          Để hoàn tất quá trình đăng ký, vui lòng xác thực email của bạn bằng cách click vào nút bên dưới:
        </p>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${verificationUrl}"
             style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none;
                    border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
            Xác thực Email
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Hoặc copy và paste link sau vào trình duyệt:
        </p>
        <p style="word-break: break-all; color: #2563eb; font-size: 14px;">
          ${verificationUrl}
        </p>

        <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 30px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>Lưu ý:</strong> Link xác thực này sẽ hết hạn sau 24 giờ.
            Sau khi xác thực email, tài khoản của bạn sẽ được gửi đến bộ phận kiểm duyệt.
          </p>
        </div>

        <h3 style="color: #111827; font-size: 18px; margin-top: 30px;">Các bước tiếp theo:</h3>
        <ol style="color: #374151; line-height: 1.8;">
          <li>Xác thực email (bước hiện tại)</li>
          <li>Xác thực số điện thoại</li>
          <li>Chờ phê duyệt từ admin</li>
          <li>Nhận thông báo kích hoạt tài khoản</li>
        </ol>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">

        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.<br>
          © 2026 Career Connect. All rights reserved.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Xác thực tài khoản nhà tuyển dụng - Career Connect',
      html,
    });
  }

  async sendAdminNotificationForNewCompany(
    companyName: string,
    representativeName: string,
    companyId: string
  ): Promise<void> {
    // Get admin emails
    const admins = await prisma.user.findMany({
      where: {
        userType: 'ADMIN',
        status: 'ACTIVE',
      },
      select: {
        email: true,
      },
    });

    if (admins.length === 0) {
      console.warn('No admin users found to notify');
      return;
    }

    const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/companies`;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">
          Có công ty mới đăng ký
        </h2>

        <p style="color: #374151; line-height: 1.6;">
          Một công ty mới vừa hoàn tất đăng ký và đang chờ phê duyệt:
        </p>

        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Tên công ty:</strong> ${companyName}</p>
          <p style="margin: 0 0 10px 0;"><strong>Người đại diện:</strong> ${representativeName}</p>
          <p style="margin: 0;"><strong>Thời gian đăng ký:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewUrl}"
             style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none;
                    border-radius: 8px; font-weight: 600; display: inline-block;">
            Xem chi tiết & Phê duyệt
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          Vui lòng kiểm tra thông tin và tài liệu của công ty để phê duyệt tài khoản.
        </p>
      </div>
    `;

    // Send email to all admins
    await Promise.all(
      admins.map((admin) =>
        this.sendEmail({
          to: admin.email,
          subject: `[Admin] Công ty mới đăng ký: ${companyName}`,
          html,
        })
      )
    );
  }

  async sendCompanyApprovalEmail(
    email: string,
    companyName: string,
    firstName?: string
  ): Promise<void> {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin`;

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #10b981; font-size: 24px; margin-bottom: 20px;">
          🎉 Tài khoản đã được phê duyệt!
        </h2>

        <p style="color: #374151; line-height: 1.6;">
          Xin chào ${firstName || ''},
        </p>

        <p style="color: #374151; line-height: 1.6;">
          Chúng tôi vui mừng thông báo tài khoản nhà tuyển dụng cho <strong>${companyName}</strong>
          đã được phê duyệt thành công. Bây giờ bạn có thể đăng nhập và bắt đầu tuyển dụng.
        </p>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${loginUrl}"
             style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none;
                    border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
            Đăng nhập ngay
          </a>
        </div>

        <h3 style="color: #111827; font-size: 18px; margin-top: 30px;">
          Bạn có thể làm gì với tài khoản nhà tuyển dụng?
        </h3>
        <ul style="color: #374151; line-height: 1.8;">
          <li>Đăng tin tuyển dụng không giới hạn</li>
          <li>Quản lý hồ sơ ứng viên</li>
          <li>Tìm kiếm ứng viên phù hợp</li>
          <li>Xây dựng thương hiệu tuyển dụng</li>
          <li>Theo dõi hiệu quả tuyển dụng</li>
        </ul>

        <p style="color: #374151; line-height: 1.6;">
          Nếu bạn cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi.
        </p>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">

        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          © 2026 Career Connect. All rights reserved.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: '✅ Tài khoản nhà tuyển dụng đã được phê duyệt - Career Connect',
      html,
    });
  }

  async sendCompanyRejectionEmail(
    email: string,
    companyName: string,
    reason: string,
    firstName?: string
  ): Promise<void> {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #dc2626; font-size: 24px; margin-bottom: 20px;">
          Thông báo về đơn đăng ký
        </h2>

        <p style="color: #374151; line-height: 1.6;">
          Xin chào ${firstName || ''},
        </p>

        <p style="color: #374151; line-height: 1.6;">
          Cảm ơn bạn đã quan tâm đến Career Connect. Sau khi xem xét, chúng tôi rất tiếc phải thông báo rằng
          đơn đăng ký tài khoản nhà tuyển dụng cho <strong>${companyName}</strong> chưa được phê duyệt.
        </p>

        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="color: #7f1d1d; margin: 0;">
            <strong>Lý do:</strong> ${reason}
          </p>
        </div>

        <p style="color: #374151; line-height: 1.6;">
          Bạn có thể đăng ký lại sau khi đã khắc phục các vấn đề trên. Nếu bạn có thắc mắc,
          vui lòng liên hệ với chúng tôi qua email support@career-connect.com.
        </p>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">

        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          © 2026 Career Connect. All rights reserved.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Thông báo về đơn đăng ký nhà tuyển dụng - Career Connect',
      html,
    });
  }
  async sendInterviewInvitationEmail(options: {
    email: string;
    candidateName: string;
    companyName: string;
    jobTitle: string;
    interviewScheduledAt: string | Date;
    isRescheduled?: boolean;
  }): Promise<void> {
    const applicationsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/candidate/applications`;
    const formattedInterviewTime = this.formatInterviewDateTime(options.interviewScheduledAt);
    const greetingName = options.candidateName.trim() || 'bạn';
    const statusCopy = options.isRescheduled
      ? 'Lịch phỏng vấn của bạn vừa được cập nhật.'
      : 'Bạn đã nhận được thư mời phỏng vấn mới từ nhà tuyển dụng.';

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Career Connect</h1>
          <p style="color: #6b7280; margin-top: 10px;">Thông báo lịch phỏng vấn</p>
        </div>

        <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">
          ${options.isRescheduled ? 'Cập nhật lịch phỏng vấn' : 'Thư mời phỏng vấn'}
        </h2>

        <p style="color: #374151; line-height: 1.6;">
          Xin chào <strong>${greetingName}</strong>,
        </p>

        <p style="color: #374151; line-height: 1.6;">
          ${statusCopy}
        </p>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 12px 0; color: #1f2937;"><strong>Công ty:</strong> ${options.companyName}</p>
          <p style="margin: 0 0 12px 0; color: #1f2937;"><strong>Vị trí:</strong> ${options.jobTitle}</p>
          <p style="margin: 0; color: #1f2937;"><strong>Thời gian phỏng vấn:</strong> ${formattedInterviewTime}</p>
        </div>

        <p style="color: #374151; line-height: 1.6;">
          Vui lòng truy cập trang quản lý đơn ứng tuyển để theo dõi trạng thái hồ sơ và chuẩn bị cho buổi phỏng vấn.
        </p>

        <div style="text-align: center; margin: 36px 0;">
          <a href="${applicationsUrl}"
             style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none;
                    border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
            Xem đơn ứng tuyển
          </a>
        </div>

        <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
          Nếu bạn có câu hỏi thêm, hãy phản hồi trực tiếp với nhà tuyển dụng trong hệ thống Career Connect.
        </p>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;">

        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          © 2026 Career Connect. All rights reserved.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: options.email,
      subject: options.isRescheduled
        ? `Cập nhật lịch phỏng vấn - ${options.jobTitle}`
        : `Thư mời phỏng vấn - ${options.jobTitle}`,
      html,
    });
  }
}

export const emailService = new EmailService();

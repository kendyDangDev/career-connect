import { z } from 'zod';

// Company registration schema
export const companyRegistrationSchema = z.object({
  // Company information
  companyName: z.string()
    .min(3, 'Tên công ty phải có ít nhất 3 ký tự')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự'),
  
  taxCode: z.string()
    .regex(/^\d{10}(-\d{3})?$/, 'Mã số thuế không hợp lệ (định dạng: 10 số hoặc 10 số-3 số)'),
  
  industryId: z.string().optional(),
  
  companySize: z.enum([
    'STARTUP_1_10',
    'SMALL_11_50',
    'MEDIUM_51_200',
    'LARGE_201_500',
    'ENTERPRISE_500_PLUS'
  ]).optional(),
  
  websiteUrl: z.string().url('Website URL không hợp lệ').optional().or(z.literal('')),
  
  description: z.string()
    .max(5000, 'Mô tả không được vượt quá 5000 ký tự')
    .optional(),
  
  // Address
  address: z.string()
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(255, 'Địa chỉ không được vượt quá 255 ký tự'),
  
  city: z.string()
    .min(2, 'Tên thành phố phải có ít nhất 2 ký tự')
    .max(100, 'Tên thành phố không được vượt quá 100 ký tự'),
  
  province: z.string()
    .min(2, 'Tên tỉnh/thành phố phải có ít nhất 2 ký tự')
    .max(100, 'Tên tỉnh/thành phố không được vượt quá 100 ký tự'),
  
  // Contact information
  companyPhone: z.string()
    .regex(/^(\+84|0)(3|5|7|8|9)\d{8}$/, 'Số điện thoại không hợp lệ'),
  
  companyEmail: z.string()
    .email('Email không hợp lệ'),
  
  foundedYear: z.number()
    .int('Năm thành lập phải là số nguyên')
    .min(1800, 'Năm thành lập không hợp lệ')
    .max(new Date().getFullYear(), 'Năm thành lập không thể ở tương lai')
    .optional(),
  
  // Representative information
  firstName: z.string()
    .min(2, 'Họ phải có ít nhất 2 ký tự')
    .max(50, 'Họ không được vượt quá 50 ký tự'),
  
  lastName: z.string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được vượt quá 50 ký tự'),
  
  position: z.string()
    .min(2, 'Chức vụ phải có ít nhất 2 ký tự')
    .max(100, 'Chức vụ không được vượt quá 100 ký tự'),
  
  userEmail: z.string()
    .email('Email không hợp lệ'),
  
  userPhone: z.string()
    .regex(/^(\+84|0)(3|5|7|8|9)\d{8}$/, 'Số điện thoại không hợp lệ'),
  
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ cái thường')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ cái hoa')
    .regex(/\d/, 'Mật khẩu phải có ít nhất 1 số')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
  
  confirmPassword: z.string(),
  
  // Documents
  businessLicenseFile: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File không được vượt quá 10MB')
    .refine(
      file => ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      'Chỉ chấp nhận file PDF, JPG, JPEG hoặc PNG'
    ),
  
  authorizationLetterFile: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File không được vượt quá 10MB')
    .refine(
      file => ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      'Chỉ chấp nhận file PDF, JPG, JPEG hoặc PNG'
    )
    .optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string()
    .min(1, 'Token không được để trống'),
});

// Phone verification schema
export const phoneVerificationSchema = z.object({
  phone: z.string()
    .regex(/^(\+84|0)(3|5|7|8|9)\d{8}$/, 'Số điện thoại không hợp lệ'),
  otp: z.string()
    .length(6, 'Mã OTP phải có 6 số')
    .regex(/^\d+$/, 'Mã OTP chỉ được chứa số'),
});

// Company update schema
export const companyUpdateSchema = z.object({
  companyName: z.string()
    .min(3, 'Tên công ty phải có ít nhất 3 ký tự')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự')
    .optional(),
  
  description: z.string()
    .max(5000, 'Mô tả không được vượt quá 5000 ký tự')
    .optional(),
  
  websiteUrl: z.string().url('Website URL không hợp lệ').optional().or(z.literal('')),
  
  address: z.string()
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(255, 'Địa chỉ không được vượt quá 255 ký tự')
    .optional(),
  
  city: z.string()
    .min(2, 'Tên thành phố phải có ít nhất 2 ký tự')
    .max(100, 'Tên thành phố không được vượt quá 100 ký tự')
    .optional(),
  
  province: z.string()
    .min(2, 'Tên tỉnh/thành phố phải có ít nhất 2 ký tự')
    .max(100, 'Tên tỉnh/thành phố không được vượt quá 100 ký tự')
    .optional(),
  
  phone: z.string()
    .regex(/^(\+84|0)(3|5|7|8|9)\d{8}$/, 'Số điện thoại không hợp lệ')
    .optional(),
  
  email: z.string()
    .email('Email không hợp lệ')
    .optional(),
  
  companySize: z.enum([
    'STARTUP_1_10',
    'SMALL_11_50',
    'MEDIUM_51_200',
    'LARGE_201_500',
    'ENTERPRISE_500_PLUS'
  ]).optional(),
  
  industryId: z.string().optional(),
  
  foundedYear: z.number()
    .int('Năm thành lập phải là số nguyên')
    .min(1800, 'Năm thành lập không hợp lệ')
    .max(new Date().getFullYear(), 'Năm thành lập không thể ở tương lai')
    .optional(),
});

// Company member invitation schema
export const companyMemberInviteSchema = z.object({
  email: z.string()
    .email('Email không hợp lệ'),
  
  role: z.enum(['ADMIN', 'RECRUITER', 'HR_MANAGER']),
  
  permissions: z.object({
    canManageJobs: z.boolean().optional(),
    canManageApplications: z.boolean().optional(),
    canManageCompany: z.boolean().optional(),
    canInviteMembers: z.boolean().optional(),
  }).optional(),
});

// Type exports
export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type PhoneVerificationInput = z.infer<typeof phoneVerificationSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
export type CompanyMemberInviteInput = z.infer<typeof companyMemberInviteSchema>;

import { z } from 'zod';

import { CompanySize } from '@/generated/prisma';
import { mediaConstraints } from '@/types/company';

const BUSINESS_LICENSE_ERROR = 'Vui lòng tải giấy phép đăng ký kinh doanh hoặc giấy tờ liên quan.';
const LOGO_ERROR = 'Logo công ty không hợp lệ.';

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

function getFileExtension(file: File) {
  const segments = file.name.toLowerCase().split('.');
  return segments.length > 1 ? `.${segments.pop()}` : '';
}

function optionalTrimmedString(maxLength?: number, message?: string) {
  return z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length === 0 ? undefined : trimmedValue;
  }, maxLength ? z.string().max(maxLength, message).optional() : z.string().optional());
}

const websiteUrlSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length === 0 ? undefined : trimmedValue;
}, z.string().url('Website không hợp lệ').optional());

const businessLicenseFileSchema = z.custom<File>((value) => isFile(value), {
  message: BUSINESS_LICENSE_ERROR,
}).superRefine((file, ctx) => {
  if (!isFile(file)) {
    return;
  }

  if (file.size > mediaConstraints.document.maxSize) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tài liệu không được vượt quá 5MB.',
    });
  }

  const extension = getFileExtension(file);
  if (
    !mediaConstraints.document.allowedTypes.includes(file.type) &&
    !mediaConstraints.document.allowedExtensions.includes(extension)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Chỉ chấp nhận file PDF, JPG, JPEG hoặc PNG.',
    });
  }
});

const logoFileSchema = z
  .custom<File>((value) => value === undefined || value === null || isFile(value), {
    message: LOGO_ERROR,
  })
  .optional()
  .superRefine((file, ctx) => {
    if (!file || !isFile(file)) {
      return;
    }

    if (file.size > mediaConstraints.logo.maxSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Logo không được vượt quá 5MB.',
      });
    }

    if (!mediaConstraints.logo.allowedTypes.includes(file.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Logo chỉ chấp nhận định dạng JPG, PNG hoặc WEBP.',
      });
    }
  });

export const candidateEmployerRequestBaseSchema = z.object({
  companyName: z
    .string({ error: 'Vui lòng nhập tên công ty.' })
    .trim()
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự.')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự.'),
  industryId: z
    .string({ error: 'Vui lòng chọn ngành nghề.' })
    .trim()
    .min(1, 'Vui lòng chọn ngành nghề.'),
  companySize: z.nativeEnum(CompanySize, {
    error: 'Vui lòng chọn quy mô công ty.',
  }),
  websiteUrl: websiteUrlSchema,
  description: optionalTrimmedString(5000, 'Mô tả không được vượt quá 5000 ký tự.'),
  logoFile: logoFileSchema,
});

export const candidateEmployerRequestClientSchema =
  candidateEmployerRequestBaseSchema.extend({
    businessLicenseFile: businessLicenseFileSchema.optional(),
  });

export const candidateEmployerCreateSchema = candidateEmployerRequestBaseSchema.extend({
  businessLicenseFile: businessLicenseFileSchema,
});

export const candidateEmployerUpdateSchema = candidateEmployerRequestBaseSchema.extend({
  businessLicenseFile: businessLicenseFileSchema.optional(),
});

export type CandidateEmployerRequestClientInput = z.input<
  typeof candidateEmployerRequestClientSchema
>;
export type CandidateEmployerRequestClientValues = z.infer<
  typeof candidateEmployerRequestClientSchema
>;
export type CandidateEmployerRequestCreateInput = z.infer<
  typeof candidateEmployerCreateSchema
>;
export type CandidateEmployerRequestUpdateInput = z.infer<
  typeof candidateEmployerUpdateSchema
>;

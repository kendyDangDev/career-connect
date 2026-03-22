import { z } from 'zod';

export const genderValues = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'] as const;
export const availabilityStatusValues = ['AVAILABLE', 'NOT_AVAILABLE', 'PASSIVE'] as const;
export const preferredWorkTypeValues = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE'] as const;
export const preferredLocationTypeValues = ['ONSITE', 'REMOTE', 'HYBRID'] as const;

export type GenderValue = (typeof genderValues)[number];
export type AvailabilityStatusValue = (typeof availabilityStatusValues)[number];
export type PreferredWorkTypeValue = (typeof preferredWorkTypeValues)[number];
export type PreferredLocationTypeValue = (typeof preferredLocationTypeValues)[number];

export const GENDER_LABELS: Record<GenderValue, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
  PREFER_NOT_TO_SAY: 'Không muốn chia sẻ',
};

export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatusValue, string> = {
  AVAILABLE: 'Sẵn sàng nhận việc',
  NOT_AVAILABLE: 'Chưa sẵn sàng',
  PASSIVE: 'Chỉ cân nhắc cơ hội tốt',
};

export const PREFERRED_WORK_TYPE_LABELS: Record<PreferredWorkTypeValue, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  FREELANCE: 'Freelance',
};

export const PREFERRED_LOCATION_TYPE_LABELS: Record<PreferredLocationTypeValue, string> = {
  ONSITE: 'Onsite',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
};

const normalizeNullableString = (value: unknown) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return value;
};

const nullableText = (max: number) =>
  z.preprocess(normalizeNullableString, z.union([z.string().max(max), z.null()]));

export const candidatePhoneRegex = /^0\d{9}$/;

const nullableUrl = z.preprocess(
  normalizeNullableString,
  z.union([z.string().url('URL không hợp lệ'), z.null()])
);

const nullableDate = z.preprocess(
  normalizeNullableString,
  z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ'), z.null()])
);

const nullableNumber = z.preprocess(
  (value) => {
    if (value === '' || value === undefined || value === null) {
      return null;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    }

    return value;
  },
  z.union([z.number().finite().nonnegative(), z.null()])
);

const nullableInteger = z.preprocess(
  (value) => {
    if (value === '' || value === undefined || value === null) {
      return null;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    }

    return value;
  },
  z.union([z.number().int().min(0).max(50), z.null()])
);

const nullablePhone = z.preprocess(
  normalizeNullableString,
  z.union([
    z
      .string()
      .regex(candidatePhoneRegex, 'So dien thoai phai gom 10 chu so va bat dau bang so 0'),
    z.null(),
  ])
);

export const candidateProfileUpdateSchema = z
  .object({
    user: z.object({
      firstName: z.string().trim().min(1, 'Vui lòng nhập tên').max(50),
      lastName: z.string().trim().min(1, 'Vui lòng nhập họ').max(50),
      phone: nullablePhone,
      avatarUrl: nullableUrl,
    }),
    profile: z.object({
      dateOfBirth: nullableDate,
      gender: z.enum(genderValues).nullable(),
      address: nullableText(200),
      city: nullableText(100),
      province: nullableText(100),
      country: nullableText(100),
      bio: nullableText(1000),
      websiteUrl: nullableUrl,
      linkedinUrl: nullableUrl,
      githubUrl: nullableUrl,
      portfolioUrl: nullableUrl,
    }),
    candidate: z.object({
      currentPosition: nullableText(120),
      experienceYears: nullableInteger,
      expectedSalaryMin: nullableNumber,
      expectedSalaryMax: nullableNumber,
      currency: z.string().trim().min(1).max(10),
      availabilityStatus: z.enum(availabilityStatusValues),
      preferredWorkType: z.enum(preferredWorkTypeValues).nullable(),
      preferredLocationType: z.enum(preferredLocationTypeValues).nullable(),
      cvFileUrl: nullableUrl,
    }),
    stats: z.object({
      skills: z.number().int().nonnegative(),
      experience: z.number().int().nonnegative(),
      education: z.number().int().nonnegative(),
      certifications: z.number().int().nonnegative(),
      cvs: z.number().int().nonnegative(),
    }),
  })
  .superRefine((data, ctx) => {
    const { expectedSalaryMin, expectedSalaryMax } = data.candidate;

    if (
      expectedSalaryMin !== null &&
      expectedSalaryMax !== null &&
      expectedSalaryMin > expectedSalaryMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu',
        path: ['candidate', 'expectedSalaryMax'],
      });
    }
  });

export type CandidateProfileUpdateInput = z.infer<typeof candidateProfileUpdateSchema>;

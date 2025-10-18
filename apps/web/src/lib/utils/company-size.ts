import { CompanySize } from '@/generated/prisma';

/**
 * Map CompanySize enum to display text
 */
export const companySizeLabels: Record<CompanySize, string> = {
  STARTUP_1_10: '1-10 nhân viên (Startup)',
  SMALL_11_50: '11-50 nhân viên (Nhỏ)',
  MEDIUM_51_200: '51-200 nhân viên (Trung bình)',
  LARGE_201_500: '201-500 nhân viên (Lớn)',
  ENTERPRISE_500_PLUS: '500+ nhân viên (Doanh nghiệp)',
};

/**
 * Get display label for company size
 */
export function getCompanySizeLabel(size: CompanySize): string {
  return companySizeLabels[size];
}

/**
 * Get all company size options for select dropdown
 */
export function getCompanySizeOptions(): Array<{ value: CompanySize; label: string }> {
  return Object.entries(companySizeLabels).map(([value, label]) => ({
    value: value as CompanySize,
    label,
  }));
}

/**
 * Get short label for company size (without description)
 */
export const companySizeShortLabels: Record<CompanySize, string> = {
  STARTUP_1_10: '1-10',
  SMALL_11_50: '11-50',
  MEDIUM_51_200: '51-200',
  LARGE_201_500: '201-500',
  ENTERPRISE_500_PLUS: '500+',
};

export function getCompanySizeShortLabel(size: CompanySize): string {
  return companySizeShortLabels[size];
}

/**
 * Parse company size from string (for backward compatibility)
 */
export function parseCompanySize(sizeString: string | null | undefined): CompanySize | null {
  if (!sizeString) return null;

  // Direct enum match
  if (Object.values(CompanySize).includes(sizeString as CompanySize)) {
    return sizeString as CompanySize;
  }

  // Backward compatibility - parse from old format
  const mapping: Record<string, CompanySize> = {
    '1-10': CompanySize.STARTUP_1_10,
    '1-50': CompanySize.SMALL_11_50,
    '11-50': CompanySize.SMALL_11_50,
    '50-100': CompanySize.MEDIUM_51_200,
    '51-200': CompanySize.MEDIUM_51_200,
    '100-500': CompanySize.LARGE_201_500,
    '201-500': CompanySize.LARGE_201_500,
    '500-1000': CompanySize.ENTERPRISE_500_PLUS,
    '1000+': CompanySize.ENTERPRISE_500_PLUS,
    '500+': CompanySize.ENTERPRISE_500_PLUS,
  };

  return mapping[sizeString] || null;
}

import { Company, CompanySize, VerificationStatus, Industry } from "@/generated/prisma";

// DTO for updating company information
export interface CompanyUpdateDTO {
  companyName?: string;
  industryId?: string | null;
  companySize?: CompanySize | null;
  websiteUrl?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  foundedYear?: number | null;
}

// DTO for company media upload
export interface CompanyMediaDTO {
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  videoUrls?: string[];
  imageUrls?: string[];
}

// Response types
export interface CompanyResponse extends Company {
  industry?: Industry | null;
  employeeCount?: number;
  activeJobCount?: number;
  followerCount?: number;
}

// Extended company profile with relations
export interface CompanyProfile extends CompanyResponse {
  socialLinks?: CompanySocialLinks;
  offices?: CompanyOffice[];
  benefits?: CompanyBenefit[];
}

// Additional company information types
export interface CompanySocialLinks {
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface CompanyOffice {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  country: string;
  isPrimary: boolean;
}

export interface CompanyBenefit {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

// Request/Response for public company profile
export interface PublicCompanyProfile {
  id: string;
  companyName: string;
  companySlug: string;
  industry?: {
    id: string;
    name: string;
  } | null;
  companySize?: CompanySize | null;
  websiteUrl?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  foundedYear?: number | null;
  verificationStatus: VerificationStatus;
  activeJobCount: number;
  followerCount: number;
  reviewStats?: {
    totalReviews: number;
    averageRating: number;
  };
}

// Validation schemas
export const companyUpdateSchema = {
  companyName: {
    min: 2,
    max: 200,
    pattern: /^[a-zA-Z0-9\s\-.,&()]+$/
  },
  description: {
    min: 50,
    max: 5000
  },
  websiteUrl: {
    pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    pattern: /^(\+84|0)[0-9]{9,10}$/
  },
  foundedYear: {
    min: 1900,
    max: new Date().getFullYear()
  }
};

// File upload constraints
export const mediaConstraints = {
  logo: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    dimensions: {
      minWidth: 200,
      minHeight: 200,
      maxWidth: 1000,
      maxHeight: 1000
    }
  },
  coverImage: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    dimensions: {
      minWidth: 1200,
      minHeight: 400,
      maxWidth: 3000,
      maxHeight: 1000
    }
  },
  video: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxDuration: 300 // 5 minutes
  },
  gallery: {
    maxSize: 10 * 1024 * 1024, // 10MB per image
    maxFiles: 20,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  document: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png']
  }
};

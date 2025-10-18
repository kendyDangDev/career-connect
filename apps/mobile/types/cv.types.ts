

export interface LanguageContent {
  type: 'languages';
  languages: Language[];
}

export interface Language {
  id?: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'professional' | 'native';
}

export interface ReferenceContent {
  type: 'references';
  references: Reference[];
}

export interface Reference {
  id?: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  relationship?: string;
}

export interface CustomContent {
  type: 'custom';
  [key: string]: any;
}

// API Response types
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: any[];
}

// Request types
export interface CreateCVRequest {
  templateId?: string;
  cv_name: string;
  cvData?: any;
}

export interface UpdateCVRequest {
  templateId?: string;
  cv_name?: string;
  cvData?: any;
}


// Query parameter types
export interface CVQueryParams {
  userId?: string;
  templateId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'cv_name';
  sortOrder?: 'asc' | 'desc';
}

export interface SectionQueryParams {
  cvId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'order' | 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface TemplateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isPremium?: boolean;
  sortBy?: 'name' | 'createdAt' | 'category';
  sortOrder?: 'asc' | 'desc';
}
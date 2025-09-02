// Types for System Categories Management

export interface SystemCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
  createdAt: Date;
  updatedAt?: Date;
}

// Industry Type
export interface Industry extends SystemCategory {
  _count?: {
    companies: number;
  };
}

// Category Type with hierarchy support
export interface Category extends SystemCategory {
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    jobCategories: number;
    children: number;
  };
}

// Skill Type
export interface Skill extends SystemCategory {
  category: SkillCategory;
  _count?: {
    candidateSkills: number;
    jobSkills: number;
  };
}

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  SOFT = 'SOFT',
  LANGUAGE = 'LANGUAGE',
  TOOL = 'TOOL'
}

// Location Type with hierarchy
export interface Location {
  id: string;
  name: string;
  type: LocationType;
  parentId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  createdAt: Date;
  parent?: Location | null;
  children?: Location[];
  _count?: {
    children: number;
  };
}

export enum LocationType {
  COUNTRY = 'COUNTRY',
  PROVINCE = 'PROVINCE',
  CITY = 'CITY',
  DISTRICT = 'DISTRICT'
}

// Request/Response types
export interface CreateIndustryDto {
  name: string;
  description?: string;
  iconUrl?: string;
  sortOrder?: number;
}

export interface UpdateIndustryDto extends Partial<CreateIndustryDto> {
  isActive?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  parentId?: string;
  description?: string;
  iconUrl?: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  isActive?: boolean;
}

export interface CreateSkillDto {
  name: string;
  category: SkillCategory;
  description?: string;
  iconUrl?: string;
}

export interface UpdateSkillDto extends Partial<CreateSkillDto> {
  isActive?: boolean;
}

export interface CreateLocationDto {
  name: string;
  type: LocationType;
  parentId?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateLocationDto extends Partial<CreateLocationDto> {
  isActive?: boolean;
}

// Query parameters
export interface SystemCategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryQuery extends SystemCategoryQuery {
  parentId?: string;
  includeChildren?: boolean;
}

export interface LocationQuery extends SystemCategoryQuery {
  type?: LocationType;
  parentId?: string;
  includeChildren?: boolean;
}

export interface SkillQuery extends SystemCategoryQuery {
  category?: SkillCategory;
}

// Response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Bulk operation types
export interface BulkOperationDto {
  ids: string[];
}

export interface BulkUpdateStatusDto extends BulkOperationDto {
  isActive: boolean;
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

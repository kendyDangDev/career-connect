import { axiosInstance } from '@/lib/axios';
import {
  Category,
  CategoryQuery,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/types/system-categories';

// Matches the actual server response shape from paginatedResponse() helper
export interface CategoriesPagedResponse {
  success: boolean;
  data: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Query Keys factory
export const categoriesKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesKeys.all, 'list'] as const,
  list: (filters: CategoryQuery) => [...categoriesKeys.lists(), filters] as const,
  details: () => [...categoriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoriesKeys.details(), id] as const,
  tree: () => [...categoriesKeys.all, 'tree'] as const,
};

// API Functions
export const getCategories = async (params: CategoryQuery): Promise<CategoriesPagedResponse> => {
  const response = await axiosInstance.get<CategoriesPagedResponse>(
    '/api/admin/system-categories/categories',
    { params }
  );
  return response.data;
};

export const getCategoryTree = async (params?: Partial<CategoryQuery>): Promise<Category[]> => {
  const response = await axiosInstance.get<CategoriesPagedResponse>(
    '/api/admin/system-categories/categories',
    { params: { ...params, parentId: 'null', includeChildren: true, limit: 100 } }
  );
  return response.data.data;
};

export const getCategoryDetails = async (id: string): Promise<Category> => {
  const response = await axiosInstance.get<{ data: Category }>(
    `/api/admin/system-categories/categories/${id}`
  );
  return response.data.data;
};

export const createCategory = async (data: CreateCategoryDto): Promise<Category> => {
  const response = await axiosInstance.post<{ data: Category; message: string }>(
    '/api/admin/system-categories/categories',
    data
  );
  return response.data.data;
};

export const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<Category> => {
  const response = await axiosInstance.put<{ data: Category; message: string }>(
    `/api/admin/system-categories/categories/${id}`,
    data
  );
  return response.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/admin/system-categories/categories/${id}`);
};

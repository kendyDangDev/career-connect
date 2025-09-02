'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Category,
  CategoryQuery,
  CreateCategoryDto,
  UpdateCategoryDto,
  PaginatedResponse,
} from '@/types/system-categories';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  filters: CategoryQuery;
  categoryTree: Category[];
  parentCategories: Category[];
  fetchCategories: (query?: CategoryQuery) => Promise<void>;
  getCategory: (id: string) => Promise<Category | null>;
  createCategory: (data: CreateCategoryDto) => Promise<boolean>;
  updateCategory: (id: string, data: UpdateCategoryDto) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  updateFilters: (newFilters: Partial<CategoryQuery>) => void;
  resetFilters: () => void;
  refreshData: () => Promise<void>;
}

const defaultFilters: CategoryQuery = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  isActive: undefined,
  search: '',
  parentId: undefined,
  includeChildren: false,
};

export function useCategories(): UseCategoriesReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Parse filters from URL
  const filters = useMemo<CategoryQuery>(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined;
    const search = searchParams.get('search') || '';
    const parentId = searchParams.get('parentId') || undefined;
    const includeChildren = searchParams.get('includeChildren') === 'true';

    return {
      page,
      limit,
      sortBy,
      sortOrder,
      isActive,
      search,
      parentId,
      includeChildren,
    };
  }, [searchParams]);

  const currentPage = filters.page || 1;
  const pageSize = filters.limit || 10;

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: Partial<CategoryQuery>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, value.toString());
        } else {
          params.delete(key);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  // Fetch categories
  const fetchCategories = useCallback(async (query?: CategoryQuery) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      const finalQuery = query || filters;

      Object.entries(finalQuery).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/system-categories/categories?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch categories');
      }

      const result: PaginatedResponse<Category> = await response.json();
      
      setCategories(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);

      // Fetch category tree for parent selection
      if (!query || query.parentId !== 'null') {
        const treeResponse = await fetch('/api/admin/system-categories/categories?parentId=null&includeChildren=true&limit=100', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (treeResponse.ok) {
          const treeResult: PaginatedResponse<Category> = await treeResponse.json();
          setCategoryTree(treeResult.data);
          
          // Flatten tree for parent selection
          const flattenCategories = (cats: Category[], level = 0): Category[] => {
            return cats.reduce((acc: Category[], cat) => {
              acc.push({ ...cat, name: '  '.repeat(level) + cat.name });
              if (cat.children && cat.children.length > 0) {
                acc.push(...flattenCategories(cat.children, level + 1));
              }
              return acc;
            }, []);
          };
          
          setParentCategories(flattenCategories(treeResult.data));
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get single category
  const getCategory = useCallback(async (id: string): Promise<Category | null> => {
    try {
      const response = await fetch(`/api/admin/system-categories/categories/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch category');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error('Error fetching category:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to fetch category');
      return null;
    }
  }, []);

  // Create category
  const createCategory = useCallback(async (data: CreateCategoryDto): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/system-categories/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create category');
      }

      toast.success(result.message || 'Category created successfully');
      await fetchCategories();
      return true;
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create category');
      return false;
    }
  }, [fetchCategories]);

  // Update category
  const updateCategory = useCallback(async (id: string, data: UpdateCategoryDto): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/system-categories/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update category');
      }

      toast.success(result.message || 'Category updated successfully');
      await fetchCategories();
      return true;
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update category');
      return false;
    }
  }, [fetchCategories]);

  // Delete category
  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/system-categories/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete category');
      }

      toast.success(result.message || 'Category deleted successfully');
      await fetchCategories();
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete category');
      return false;
    }
  }, [fetchCategories]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    totalPages,
    totalItems,
    currentPage,
    pageSize,
    filters,
    categoryTree,
    parentCategories,
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFilters,
    resetFilters,
    refreshData,
  };
}

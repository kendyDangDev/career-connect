'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  Category,
  CategoryQuery,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/types/system-categories';
import {
  categoriesKeys,
  getCategories,
  getCategoryTree,
  getCategoryDetails,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
  type CategoriesPagedResponse,
} from '@/api/admin/system-categories/categories.api';

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
  const queryClient = useQueryClient();

  // Parse filters from URL
  const filters = useMemo<CategoryQuery>(() => {
    if (!searchParams) return defaultFilters;

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const isActive =
      searchParams.get('isActive') === 'true'
        ? true
        : searchParams.get('isActive') === 'false'
          ? false
          : undefined;
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

  // Query for categories list
  const {
    data: categoriesResponse,
    isLoading: loading,
    error,
    refetch: refetchCategories,
  } = useQuery<CategoriesPagedResponse>({
    queryKey: categoriesKeys.list(filters),
    queryFn: () => getCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for category tree
  const { data: categoryTree = [] } = useQuery({
    queryKey: categoriesKeys.tree(),
    queryFn: () => getCategoryTree(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Extract data
  const categories = categoriesResponse?.data || [];
  const totalPages = categoriesResponse?.pagination.totalPages || 0;
  const totalItems = categoriesResponse?.pagination.total || 0;

  // Flatten tree for parent selection
  const parentCategories = useMemo(() => {
    const flattenCategories = (cats: Category[], level = 0): Category[] => {
      return cats.reduce((acc: Category[], cat) => {
        acc.push({ ...cat, name: '  '.repeat(level) + cat.name });
        if (cat.children && cat.children.length > 0) {
          acc.push(...flattenCategories(cat.children, level + 1));
        }
        return acc;
      }, []);
    };
    return flattenCategories(categoryTree);
  }, [categoryTree]);

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: Partial<CategoryQuery>) => {
      const params = new URLSearchParams(searchParams?.toString() || '');

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
    if (pathname) {
      router.push(pathname);
    }
  }, [pathname, router]);

  // Fetch categories (for compatibility)
  const fetchCategories = useCallback(
    async (query?: CategoryQuery) => {
      if (query) {
        // If custom query, refetch with new params
        await queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      } else {
        await refetchCategories();
      }
    },
    [queryClient, refetchCategories]
  );

  // Mutation for getting category details
  const getCategoryMutation = useMutation({
    mutationFn: (id: string): Promise<Category> => getCategoryDetails(id),
  });

  // Mutation for creating category
  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryDto): Promise<Category> => createCategoryApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.tree() });
    },
  });

  // Mutation for updating category
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }): Promise<Category> =>
      updateCategoryApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.tree() });
    },
  });

  // Mutation for deleting category
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string): Promise<void> => deleteCategoryApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.tree() });
    },
  });

  // Wrapper functions
  const getCategory = async (id: string): Promise<Category | null> => {
    try {
      return await getCategoryMutation.mutateAsync(id);
    } catch (err) {
      console.error('Error fetching category:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to fetch category');
      return null;
    }
  };

  const createCategory = async (data: CreateCategoryDto): Promise<boolean> => {
    try {
      await createCategoryMutation.mutateAsync(data);
      toast.success('Category created successfully');
      return true;
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create category');
      return false;
    }
  };

  const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<boolean> => {
    try {
      await updateCategoryMutation.mutateAsync({ id, data });
      toast.success('Category updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update category');
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      await deleteCategoryMutation.mutateAsync(id);
      toast.success('Category deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete category');
      return false;
    }
  };

  // Refresh data
  const refreshData = useCallback(async () => {
    await refetchCategories();
  }, [refetchCategories]);

  return {
    categories,
    loading,
    error: error ? (error as Error).message : null,
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

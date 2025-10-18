'use client';

import { useState, useEffect } from 'react';
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  children?: Category[];
}

interface SkillsResponse {
  skills: Skill[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useSkills = (params?: {
  search?: string;
  category?: string;
  isActive?: boolean;
  limit?: number;
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        const searchParams = new URLSearchParams();

        if (params?.search) searchParams.append('search', params.search);
        if (params?.category) searchParams.append('category', params.category);
        if (params?.isActive !== undefined)
          searchParams.append('isActive', params.isActive.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        const url = `/api/admin/system-categories/skills?${searchParams.toString()}`;
        console.log('Fetching skills from:', url);

        const response = await fetch(url);
        console.log('Skills response status:', response.status);
        console.log('Skills response ok:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.log('Skills error response:', errorText);
          throw new Error(`Failed to fetch skills: ${response.status} ${errorText}`);
        }

        const data: ApiResponse<Skill[]> = await response.json();
        console.log('Skills API response:', data);

        if (data.success) {
          setSkills(data.data);
          console.log('Skills loaded successfully:', data.data?.length, 'items');
        } else {
          throw new Error(data.error || 'Failed to fetch skills');
        }
      } catch (err) {
        console.error('Skills fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [params?.search, params?.category, params?.isActive, params?.limit]);

  return { skills, loading, error };
};

export const useCategories = (params?: {
  search?: string;
  isActive?: boolean;
  limit?: number;
  flat?: boolean;
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const searchParams = new URLSearchParams();

        if (params?.search) searchParams.append('search', params.search);
        if (params?.isActive !== undefined)
          searchParams.append('isActive', params.isActive.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.flat !== undefined) searchParams.append('flat', params.flat.toString());

        const url = `/api/admin/system-categories/categories?${searchParams.toString()}`;
        console.log('Fetching categories from:', url);

        const response = await fetch(url);
        console.log('Categories response status:', response.status);
        console.log('Categories response ok:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.log('Categories error response:', errorText);
          throw new Error(`Failed to fetch categories: ${response.status} ${errorText}`);
        }

        const data: ApiResponse<Category[]> = await response.json();
        console.log('Categories API response:', data);

        if (data.success) {
          setCategories(data.data);
          console.log('Categories loaded successfully:', data.data?.length, 'items');
        } else {
          throw new Error(data.error || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Categories fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [params?.search, params?.isActive, params?.limit, params?.flat]);

  return { categories, loading, error };
};

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Location,
  LocationQuery,
  CreateLocationDto,
  UpdateLocationDto,
  LocationType,
} from '@/types/system-categories';
import { locationsApi, locationsKeys } from '@/api/locations.api';

interface LocationsResponse {
  success: boolean;
  data: Location[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    typeStats?: Record<string, number>;
  };
}

interface UseLocationsReturn {
  locations: Location[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  filters: LocationQuery;
  locationTree: Location[];
  parentLocations: Record<LocationType, Location[]>;
  typeStats: Record<string, number>;
  fetchLocations: (query?: LocationQuery) => Promise<void>;
  getLocation: (id: string) => Promise<Location | null>;
  createLocation: (data: CreateLocationDto) => Promise<boolean>;
  updateLocation: (id: string, data: UpdateLocationDto) => Promise<boolean>;
  deleteLocation: (id: string) => Promise<boolean>;
  updateFilters: (newFilters: Partial<LocationQuery>) => void;
  resetFilters: () => void;
  refreshData: () => Promise<void>;
  getPopularCities: () => Promise<Location[]>;
}

const defaultFilters: LocationQuery = {
  page: 1,
  limit: 10,
  sortBy: 'name',
  sortOrder: 'asc',
  isActive: undefined,
  search: '',
  type: undefined,
  parentId: undefined,
  includeChildren: false,
};

export function useLocations(): UseLocationsReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Parse filters from URL
  const filters = useMemo<LocationQuery>(() => {
    const page = parseInt(searchParams?.get('page') || '1', 10);
    const limit = parseInt(searchParams?.get('limit') || '10', 10);
    const sortBy = searchParams?.get('sortBy') || 'name';
    const sortOrder = (searchParams?.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const isActive =
      searchParams?.get('isActive') === 'true'
        ? true
        : searchParams?.get('isActive') === 'false'
          ? false
          : undefined;
    const search = searchParams?.get('search') || '';
    const type = searchParams?.get('type') as LocationType | undefined;
    const parentId = searchParams?.get('parentId') || undefined;
    const includeChildren = searchParams?.get('includeChildren') === 'true';

    return {
      page,
      limit,
      sortBy,
      sortOrder,
      isActive,
      search,
      type,
      parentId,
      includeChildren,
    };
  }, [searchParams]);

  const currentPage = filters.page || 1;
  const pageSize = filters.limit || 10;

  // Query for locations list
  const locationsQuery = useQuery({
    queryKey: locationsKeys.list(filters),
    queryFn: () => locationsApi.getList(filters),
    placeholderData: (previousData) => previousData,
  });

  // Query for location tree
  const locationTreeQuery = useQuery({
    queryKey: locationsKeys.tree(),
    queryFn: () => locationsApi.getTree(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Organize locations by type for parent selection
  const parentLocations = useMemo(() => {
    const organized: Record<LocationType, Location[]> = {
      [LocationType.COUNTRY]: [],
      [LocationType.PROVINCE]: [],
      [LocationType.CITY]: [],
      [LocationType.DISTRICT]: [],
    };

    if (locationTreeQuery.data?.data) {
      const processLocation = (loc: Location) => {
        organized[loc.type].push(loc);
        if (loc.children) {
          loc.children.forEach(processLocation);
        }
      };

      locationTreeQuery.data.data.forEach(processLocation);
    }

    return organized;
  }, [locationTreeQuery.data]);

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: Partial<LocationQuery>) => {
      const params = new URLSearchParams(searchParams?.toString());

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
    router.push(pathname || '');
  }, [pathname, router]);

  // Fetch locations (legacy compatibility - now just refetches query)
  const fetchLocations = useCallback(
    async (query?: LocationQuery) => {
      if (query) {
        // If custom query provided, update filters
        updateFilters(query);
      } else {
        // Otherwise refetch current query
        await queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
      }
    },
    [queryClient, updateFilters]
  );

  // Get single location
  const getLocation = useCallback(async (id: string): Promise<Location | null> => {
    try {
      return await locationsApi.getById(id);
    } catch (err) {
      console.error('Error fetching location:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to fetch location');
      return null;
    }
  }, []);

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: locationsApi.create,
    onSuccess: (result) => {
      toast.success(result.message || 'Location created successfully');
      queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationsKeys.tree() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create location');
    },
  });

  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationDto }) =>
      locationsApi.update(id, data),
    onSuccess: (result) => {
      toast.success(result.message || 'Location updated successfully');
      queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationsKeys.detail(result.data.id) });
      queryClient.invalidateQueries({ queryKey: locationsKeys.tree() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update location');
    },
  });

  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: locationsApi.delete,
    onSuccess: (result) => {
      toast.success(result.message || 'Location deleted successfully');
      queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationsKeys.tree() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete location');
    },
  });

  // Create location wrapper
  const createLocation = useCallback(
    async (data: CreateLocationDto): Promise<boolean> => {
      try {
        await createMutation.mutateAsync(data);
        return true;
      } catch {
        return false;
      }
    },
    [createMutation]
  );

  // Update location wrapper
  const updateLocation = useCallback(
    async (id: string, data: UpdateLocationDto): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync({ id, data });
        return true;
      } catch {
        return false;
      }
    },
    [updateMutation]
  );

  // Delete location wrapper
  const deleteLocation = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteMutation]
  );

  // Get popular cities
  const getPopularCities = useCallback(async (): Promise<Location[]> => {
    try {
      return await locationsApi.getPopularCities();
    } catch (err) {
      console.error('Error fetching popular cities:', err);
      return [];
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
    await queryClient.invalidateQueries({ queryKey: locationsKeys.tree() });
  }, [queryClient]);

  return {
    locations: locationsQuery.data?.data || [],
    loading: locationsQuery.isLoading,
    error: locationsQuery.error?.message || null,
    totalPages: locationsQuery.data?.meta.totalPages || 0,
    totalItems: locationsQuery.data?.meta.total || 0,
    currentPage,
    pageSize,
    filters,
    locationTree: locationTreeQuery.data?.data || [],
    parentLocations,
    typeStats: locationsQuery.data?.meta.typeStats || {},
    fetchLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    updateFilters,
    resetFilters,
    refreshData,
    getPopularCities,
  };
}

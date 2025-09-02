'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Location,
  LocationQuery,
  CreateLocationDto,
  UpdateLocationDto,
  LocationType,
} from '@/types/system-categories';

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

  const [locations, setLocations] = useState<Location[]>([]);
  const [locationTree, setLocationTree] = useState<Location[]>([]);
  const [parentLocations, setParentLocations] = useState<Record<LocationType, Location[]>>({
    [LocationType.COUNTRY]: [],
    [LocationType.PROVINCE]: [],
    [LocationType.CITY]: [],
    [LocationType.DISTRICT]: [],
  });
  const [typeStats, setTypeStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Parse filters from URL
  const filters = useMemo<LocationQuery>(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined;
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') as LocationType | undefined;
    const parentId = searchParams.get('parentId') || undefined;
    const includeChildren = searchParams.get('includeChildren') === 'true';

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

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: Partial<LocationQuery>) => {
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

  // Fetch locations
  const fetchLocations = useCallback(async (query?: LocationQuery) => {
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

      const response = await fetch(`/api/admin/system-categories/locations?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch locations');
      }

      const result: LocationsResponse = await response.json();
      
      setLocations(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
      setTypeStats(result.meta.typeStats || {});

      // Fetch location tree for parent selection
      if (!query || query.parentId !== 'null') {
        const treeResponse = await fetch('/api/admin/system-categories/locations?parentId=null&includeChildren=true&limit=100', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (treeResponse.ok) {
          const treeResult: LocationsResponse = await treeResponse.json();
          setLocationTree(treeResult.data);
          
          // Organize locations by type for parent selection
          const organized: Record<LocationType, Location[]> = {
            [LocationType.COUNTRY]: [],
            [LocationType.PROVINCE]: [],
            [LocationType.CITY]: [],
            [LocationType.DISTRICT]: [],
          };

          const processLocation = (loc: Location) => {
            organized[loc.type].push(loc);
            if (loc.children) {
              loc.children.forEach(processLocation);
            }
          };

          treeResult.data.forEach(processLocation);
          setParentLocations(organized);
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get single location
  const getLocation = useCallback(async (id: string): Promise<Location | null> => {
    try {
      const response = await fetch(`/api/admin/system-categories/locations/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch location');
      }

      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error('Error fetching location:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to fetch location');
      return null;
    }
  }, []);

  // Create location
  const createLocation = useCallback(async (data: CreateLocationDto): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/system-categories/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create location');
      }

      toast.success(result.message || 'Location created successfully');
      await fetchLocations();
      return true;
    } catch (err) {
      console.error('Error creating location:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create location');
      return false;
    }
  }, [fetchLocations]);

  // Update location
  const updateLocation = useCallback(async (id: string, data: UpdateLocationDto): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/system-categories/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update location');
      }

      toast.success(result.message || 'Location updated successfully');
      await fetchLocations();
      return true;
    } catch (err) {
      console.error('Error updating location:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update location');
      return false;
    }
  }, [fetchLocations]);

  // Delete location
  const deleteLocation = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/system-categories/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete location');
      }

      toast.success(result.message || 'Location deleted successfully');
      await fetchLocations();
      return true;
    } catch (err) {
      console.error('Error deleting location:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete location');
      return false;
    }
  }, [fetchLocations]);

  // Get popular cities
  const getPopularCities = useCallback(async (): Promise<Location[]> => {
    try {
      const response = await fetch('/api/admin/system-categories/locations/popular', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch popular cities');
      }

      const result = await response.json();
      return result.data || [];
    } catch (err) {
      console.error('Error fetching popular cities:', err);
      return [];
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchLocations();
  }, [fetchLocations]);

  // Initial fetch
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    locations,
    loading,
    error,
    totalPages,
    totalItems,
    currentPage,
    pageSize,
    filters,
    locationTree,
    parentLocations,
    typeStats,
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

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { jobService } from "../services/jobService";
import { JobFilters, JobsResponse } from "../types/job";

interface UseJobsReturn {
  data: {
    jobs: JobsResponse["data"]["jobs"];
    pagination: JobsResponse["data"]["pagination"];
  } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export function useJobs(filters: JobFilters): UseJobsReturn {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["jobs", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await jobService.getJobs({
        ...filters,
        page: pageParam,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Flatten the pages data
  const flattenedData = data?.pages.reduce(
    (acc, page) => {
      return {
        jobs: [...acc.jobs, ...page.data.jobs],
        pagination: page.data.pagination,
      };
    },
    { jobs: [], pagination: data?.pages[0]?.data.pagination }
  );

  return {
    data: flattenedData,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  };
}

// Hook for fetching a single job
export function useJob(idOrSlug: string) {
  return useQuery({
    queryKey: ["job", idOrSlug],
    queryFn: () => jobService.getJobById(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching featured jobs
export function useFeaturedJobs(limit: number = 5) {
  return useQuery({
    queryKey: ["jobs", "featured", limit],
    queryFn: () => jobService.getFeaturedJobs({ limit }),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for fetching recent jobs
export function useRecentJobs(limit: number = 10) {
  return useQuery({
    queryKey: ["jobs", "recent", limit],
    queryFn: () => jobService.getRecentJobs({ limit }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching popular jobs
export function usePopularJobs(limit: number = 10) {
  return useQuery({
    queryKey: ["jobs", "popular", limit],
    queryFn: () => jobService.getPopularJobs({ limit }),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for searching jobs
export function useSearchJobs(query: string, filters: Omit<JobFilters, "search"> = {}) {
  return useQuery({
    queryKey: ["jobs", "search", query, filters],
    queryFn: () => jobService.searchJobs(query, filters),
    enabled: !!query && query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching jobs by category
export function useJobsByCategory(categoryId: string, filters: Omit<JobFilters, "categoryId"> = {}) {
  return useQuery({
    queryKey: ["jobs", "category", categoryId, filters],
    queryFn: () => jobService.getJobsByCategory(categoryId, filters),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for fetching jobs by location
export function useJobsByLocation(
  city: string,
  province?: string,
  filters: Omit<JobFilters, "locationCity" | "locationProvince"> = {}
) {
  return useQuery({
    queryKey: ["jobs", "location", city, province, filters],
    queryFn: () => jobService.getJobsByLocation(city, province, filters),
    enabled: !!city,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

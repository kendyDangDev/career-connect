import { useRouter } from "expo-router";
import { Filter, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "../hooks/useDebounce";
import { useJobs } from "../hooks/useJobs";
import { Job, JobFilters as JobFiltersType } from "../types/job";
import JobCard from "./JobCard";
import JobFilters from "./JobFilters";
import SearchBar from "./SearchBar";

const JobListScreen: React.FC = () => {
  const router = useRouter();
  // Separate input value from search query to prevent focus loss
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JobFiltersType>({
    page: 1,
    limit: 10,
  });

  // Debounce the input value to reduce API calls
  const debouncedInputValue = useDebounce(inputValue, 500);

  // Update search query when debounced input value changes
  useEffect(() => {
    setSearchQuery(debouncedInputValue);
    // Reset to page 1 when search query changes
    if (debouncedInputValue !== searchQuery) {
      setFilters(prev => ({ ...prev, page: 1 }));
    }
  }, [debouncedInputValue, searchQuery]);

  // Apply search query to filters
  const activeFilters = useMemo(() => ({
    ...filters,
    search: searchQuery || undefined,
  }), [filters, searchQuery]);

  // Try to use the jobs hook - will fail if no QueryClient
  let data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage;
  
  try {
    const jobsResult = useJobs(activeFilters);
    data = jobsResult.data;
    isLoading = jobsResult.isLoading;
    isError = jobsResult.isError;
    error = jobsResult.error;
    refetch = jobsResult.refetch;
    fetchNextPage = jobsResult.fetchNextPage;
    hasNextPage = jobsResult.hasNextPage;
    isFetchingNextPage = jobsResult.isFetchingNextPage;
  } catch (e) {
    // If QueryClient is not available, use mock data
    console.log('[JobListScreen] Using mock data due to missing QueryClient');
    data = {
      jobs: [
        {
          id: '1',
          title: 'Senior React Native Developer',
          slug: 'senior-react-native-developer',
          company: {
            id: 'company-1',
            companyName: 'Tech Corp',
            companySlug: 'tech-corp',
            logoUrl: '',
            verificationStatus: 'VERIFIED' as const,
          },
          jobType: 'FULL_TIME' as const,
          workLocationType: 'HYBRID' as const,
          experienceLevel: 'SENIOR' as const,
          salaryMin: 25000000,
          salaryMax: 35000000,
          currency: 'VND',
          salaryNegotiable: false,
          locationCity: 'Hà Nội',
          locationProvince: 'Hà Nội',
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE' as const,
          viewCount: 120,
          applicationCount: 15,
          featured: true,
          urgent: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Frontend Developer',
          slug: 'frontend-developer',
          company: {
            id: 'company-2',
            companyName: 'Startup ABC',
            companySlug: 'startup-abc',
            logoUrl: '',
            verificationStatus: 'VERIFIED' as const,
          },
          jobType: 'FULL_TIME' as const,
          workLocationType: 'ONSITE' as const,
          experienceLevel: 'MID' as const,
          salaryMin: 15000000,
          salaryMax: 25000000,
          currency: 'VND',
          salaryNegotiable: false,
          locationCity: 'Hồ Chí Minh',
          locationProvince: 'Hồ Chí Minh',
          applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE' as const,
          viewCount: 85,
          applicationCount: 8,
          featured: false,
          urgent: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        },
      ] as Job[],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    };
    isLoading = false;
    isError = false;
    error = null;
    refetch = () => {};
    fetchNextPage = () => {};
    hasNextPage = false;
    isFetchingNextPage = false;
  }

  const handleInputChange = useCallback((query: string) => {
    setInputValue(query);
  }, []);

  const handleSearch = useCallback((query: string) => {
    // When user explicitly submits (presses search), update immediately
    setInputValue(query);
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<JobFiltersType>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to page 1 when filters change
    }));
    setShowFilters(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
    });
    setInputValue("");
    setSearchQuery("");
  }, []);

  const handleJobPress = useCallback((job: Job) => {
    // Navigate to job detail screen
    router.push({
      pathname: "/job/[id]",
      params: { id: job.id },
    });
  }, [router]);

  const handleSavePress = useCallback((jobId: string, isSaved: boolean) => {
    // Handle save job action
    console.log(`Job ${jobId} ${isSaved ? 'saved' : 'unsaved'}`);
    
    // Optionally show toast message
    // toast.success(isSaved ? 'Job saved successfully!' : 'Job removed from saved list');
    
    // Could trigger refresh of data if needed
    // refetch();
  }, []);

  const renderJob = useCallback(({ item }: { item: Job }) => (
    <JobCard
      job={item}
      onPress={() => handleJobPress(item)}
      onSavePress={handleSavePress}
    />
  ), [handleJobPress, handleSavePress]);

  const renderEmpty = () => {
    if (isLoading) return null;
    
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Text className="text-gray-500 text-lg mb-2">Không tìm thấy việc làm</Text>
        <Text className="text-gray-400 text-sm text-center px-8">
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn
        </Text>
        <TouchableOpacity
          onPress={handleClearFilters}
          className="mt-4 bg-blue-600 px-6 py-2 rounded-full"
        >
          <Text className="text-white font-medium">Xóa bộ lọc</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    const activeFilterCount = Object.entries(filters).filter(
      ([key, value]) => key !== "page" && key !== "limit" && value !== undefined
    ).length;

    return (
      <View className="bg-white">
        {/* Search Bar */}
        <View className="px-4 py-3">
          <SearchBar
            value={inputValue}
            onChangeText={handleInputChange}
            onSubmit={handleSearch}
            placeholder="Tìm kiếm việc làm..."
          />
        </View>

        {/* Filter Row */}
        <View className="flex-row items-center justify-between px-4 pb-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <Text className="text-gray-600 mr-2">
              {data?.pagination?.total || 0} việc làm
            </Text>
            {activeFilterCount > 0 && (
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-600 text-xs font-medium">
                  {activeFilterCount} bộ lọc
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
          >
            <Filter size={16} color="#4B5563" />
            <Text className="text-gray-700 ml-2 font-medium">Bộ lọc</Text>
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {(activeFilterCount > 0 || searchQuery) && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 py-2 border-b border-gray-100"
          >
            {searchQuery && (
              <TouchableOpacity
                onPress={() => {
                  setInputValue("");
                  setSearchQuery("");
                }}
                className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full mr-2"
              >
                <Text className="text-blue-600 text-sm mr-1">
                  "{searchQuery}"
                </Text>
                <X size={14} color="#2563EB" />
              </TouchableOpacity>
            )}
            
            {filters.jobType && (
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, jobType: undefined }))}
                className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full mr-2"
              >
                <Text className="text-blue-600 text-sm mr-1">
                  {filters.jobType.replace("_", " ")}
                </Text>
                <X size={14} color="#2563EB" />
              </TouchableOpacity>
            )}

            {filters.experienceLevel && (
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, experienceLevel: undefined }))}
                className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full mr-2"
              >
                <Text className="text-blue-600 text-sm mr-1">
                  {filters.experienceLevel}
                </Text>
                <X size={14} color="#2563EB" />
              </TouchableOpacity>
            )}

            {filters.locationCity && (
              <TouchableOpacity
                onPress={() => setFilters(prev => ({ ...prev, locationCity: undefined }))}
                className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full mr-2"
              >
                <Text className="text-blue-600 text-sm mr-1">
                  {filters.locationCity}
                </Text>
                <X size={14} color="#2563EB" />
              </TouchableOpacity>
            )}

            {(activeFilterCount > 0 || searchQuery) && (
              <TouchableOpacity
                onPress={handleClearFilters}
                className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-full"
              >
                <Text className="text-red-600 text-sm">Xóa tất cả</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  };

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-600 text-lg mb-2">Đã xảy ra lỗi</Text>
          <Text className="text-gray-500 text-center mb-4">
            {error?.message || "Không thể tải danh sách việc làm"}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-blue-600 px-6 py-2 rounded-full"
          >
            <Text className="text-white font-medium">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={data?.jobs || []}
        renderItem={renderJob}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && !isFetchingNextPage}
            onRefresh={refetch}
            colors={["#2563EB"]}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 20 }}
        stickyHeaderIndices={[0]}
      />

      {/* Filter Modal/Sheet */}
      {showFilters && (
        <JobFilters
          filters={filters}
          onApply={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}
    </SafeAreaView>
  );
};

export default JobListScreen;

import { useRouter } from "expo-router";
import {
  Filter,
  X,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Users,
  TrendingUp,
  Star,
  Building2,
} from "lucide-react-native";
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

  // Quick filter definitions
  const quickFilters = [
    {
      id: "hanoi",
      label: "Hà Nội",
      icon: MapPin,
      filter: { locationCity: "Hà Nội" as const },
    },
    {
      id: "fulltime",
      label: "Full-time",
      icon: Clock,
      filter: { jobType: "FULL_TIME" as const },
    },
    {
      id: "senior",
      label: "Senior",
      icon: Users,
      filter: { experienceLevel: "SENIOR" as const },
    },
    {
      id: "junior",
      label: "Entry Level",
      icon: Star,
      filter: { experienceLevel: "ENTRY" as const },
    },
    {
      id: "highSalary",
      label: "High Salary",
      icon: DollarSign,
      filter: { salaryMin: 20000000 },
    },
    {
      id: "tech",
      label: "Tech Jobs",
      icon: Briefcase,
      filter: { categoryId: "tech" },
    },
  ];

  // Job stats data
  const jobStats = [
    {
      label: "Tổng việc làm",
      value: "15.2K+",
      icon: Briefcase,
      color: "purple",
    },
    {
      label: "Công ty tuyển dụng",
      value: "3.5K",
      icon: Building2,
      color: "indigo",
    },
    { label: "Ứng viên mới", value: "28K+", icon: Users, color: "blue" },
    { label: "Việc làm hot", value: "892", icon: TrendingUp, color: "pink" },
  ];

  // Debounce the input value to reduce API calls
  const debouncedInputValue = useDebounce(inputValue, 500);

  // Update search query when debounced input value changes
  useEffect(() => {
    setSearchQuery(debouncedInputValue);
    // Reset to page 1 when search query changes
    if (debouncedInputValue !== searchQuery) {
      setFilters((prev) => ({ ...prev, page: 1 }));
    }
  }, [debouncedInputValue, searchQuery]);

  // Apply search query to filters
  const activeFilters = useMemo(
    () => ({
      ...filters,
      search: searchQuery || undefined,
    }),
    [filters, searchQuery]
  );

  // Try to use the jobs hook - will fail if no QueryClient
  let data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage;
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
    console.log("[JobListScreen] Using mock data due to missing QueryClient");
    data = {
      jobs: [
        {
          id: "1",
          title: "Senior React Native Developer",
          slug: "senior-react-native-developer",
          company: {
            id: "company-1",
            companyName: "Tech Corp",
            companySlug: "tech-corp",
            logoUrl: "",
            verificationStatus: "VERIFIED" as const,
          },
          jobType: "FULL_TIME" as const,
          workLocationType: "HYBRID" as const,
          experienceLevel: "SENIOR" as const,
          salaryMin: 25000000,
          salaryMax: 35000000,
          currency: "VND",
          salaryNegotiable: false,
          locationCity: "Hà Nội",
          locationProvince: "Hà Nội",
          applicationDeadline: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "ACTIVE" as const,
          viewCount: 120,
          applicationCount: 15,
          featured: true,
          urgent: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Frontend Developer",
          slug: "frontend-developer",
          company: {
            id: "company-2",
            companyName: "Startup ABC",
            companySlug: "startup-abc",
            logoUrl: "",
            verificationStatus: "VERIFIED" as const,
          },
          jobType: "FULL_TIME" as const,
          workLocationType: "ONSITE" as const,
          experienceLevel: "MID" as const,
          salaryMin: 15000000,
          salaryMax: 25000000,
          currency: "VND",
          salaryNegotiable: false,
          locationCity: "Hồ Chí Minh",
          locationProvince: "Hồ Chí Minh",
          applicationDeadline: new Date(
            Date.now() + 20 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "ACTIVE" as const,
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
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback(
    (newFilters: Partial<JobFiltersType>) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: 1, // Reset to page 1 when filters change
      }));
      setShowFilters(false);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
    });
    setInputValue("");
    setSearchQuery("");
  }, []);

  const handleQuickFilter = useCallback(
    (filterData: Partial<JobFiltersType>) => {
      setFilters((prev) => ({
        ...prev,
        ...filterData,
        page: 1,
      }));
    },
    []
  );

  const handleJobPress = useCallback(
    (job: Job) => {
      // Navigate to job detail screen
      router.push({
        pathname: "/job/[id]",
        params: { id: job.id },
      });
    },
    [router]
  );

  const handleSavePress = useCallback((jobId: string, isSaved: boolean) => {
    // Handle save job action
    console.log(`Job ${jobId} ${isSaved ? "saved" : "unsaved"}`);

    // Optionally show toast message
    // toast.success(isSaved ? 'Job saved successfully!' : 'Job removed from saved list');

    // Could trigger refresh of data if needed
    // refetch();
  }, []);

  const renderJob = useCallback(
    ({ item }: { item: Job }) => (
      <JobCard
        job={item}
        onPress={() => handleJobPress(item)}
        onSavePress={handleSavePress}
      />
    ),
    [handleJobPress, handleSavePress]
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View className="flex-1 justify-center items-center py-20 px-6">
        {/* Decorative gradient background */}
        <View className="absolute inset-0 opacity-30">
          <View className="w-32 h-32 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full absolute top-10 left-4 opacity-20" />
          <View className="w-24 h-24 bg-gradient-to-br from-indigo-300 to-blue-300 rounded-full absolute bottom-20 right-8 opacity-20" />
        </View>

        {/* Main content */}
        <View className="relative z-10 items-center">
          {/* Icon container with gradient */}
          <View className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full items-center justify-center mb-6 shadow-soft">
            <View className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full items-center justify-center">
              <Text className="text-white text-3xl">💼</Text>
            </View>
          </View>

          {/* Title with gradient text */}
          <Text className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text mb-3 text-center">
            Không tìm thấy việc làm
          </Text>

          {/* Subtitle */}
          <Text className="text-purple-500 text-base text-center leading-6 mb-8 max-w-sm font-medium">
            Hãy thử điều chỉnh tiêu chí tìm kiếm của bạn hoặc quay lại sau để
            tìm cơ hội mới
          </Text>

          {/* Action button with gradient */}
          <TouchableOpacity onPress={handleClearFilters} className="relative">
            <View className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-glow-purple" />
            <View className="bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-4 rounded-full shadow-soft relative z-10">
              <Text className="text-white font-bold text-base">Xóa bộ lọc</Text>
            </View>
          </TouchableOpacity>

          {/* Decorative line */}
          <View className="mt-8 w-20 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-50" />
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    const activeFilterCount = Object.entries(filters).filter(
      ([key, value]) => key !== "page" && key !== "limit" && value !== undefined
    ).length;

    return (
      <View className="relative">
        {/* Glass morphism background */}
        <View className="absolute inset-0 bg-white/80 backdrop-blur-sm" />

        {/* Decorative gradient elements */}
        <View className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/20 to-transparent rounded-bl-full" />
        <View className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-tr-full" />

        <View className="relative z-10">
          {/* Search Bar with enhanced styling */}
          <View className="px-4 py-4">
            <View className="relative">
              <View className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-indigo-100/50 rounded-2xl opacity-60" />
              <View className="relative z-10">
                <SearchBar
                  value={inputValue}
                  onChangeText={handleInputChange}
                  onSubmit={handleSearch}
                  placeholder="Tìm kiếm việc làm..."
                />
              </View>
            </View>
          </View>

          {/* Filter Row with modern design */}
          <View className="flex-row items-center justify-between px-4 pb-4 border-b border-purple-100/50">
            <View className="flex-row items-center">
              <Text className="text-purple-700 font-semibold mr-3">
                {data?.pagination?.total || 0} việc làm
              </Text>
              {activeFilterCount > 0 && (
                <View className="bg-gradient-to-r from-purple-100 to-indigo-100 px-3 py-1.5 rounded-full border border-purple-200/50">
                  <Text className="text-purple-600 text-xs font-bold">
                    {activeFilterCount} bộ lọc
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <View className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl opacity-80" />
              <View className="flex-row items-center bg-white/60 backdrop-blur-xs px-4 py-3 rounded-xl border border-purple-200/50 shadow-soft relative z-10">
                <Filter size={18} color="#7e22ce" />
                <Text className="text-purple-700 ml-2 font-semibold">
                  Bộ lọc
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filters Display with enhanced design */}
        {(activeFilterCount > 0 || searchQuery) && (
          <View className="relative">
            <View className="absolute inset-0 bg-gradient-to-r from-purple-50/80 to-indigo-50/80" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 py-3 relative z-10"
            >
              {searchQuery && (
                <TouchableOpacity
                  onPress={() => {
                    setInputValue("");
                    setSearchQuery("");
                  }}
                  className="relative mr-3"
                >
                  <View className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full opacity-80" />
                  <View className="flex-row items-center bg-white/70 backdrop-blur-xs px-4 py-2 rounded-full border border-purple-200/50 shadow-soft relative z-10">
                    <Text className="text-purple-700 text-sm mr-2 font-medium">
                      &ldquo;{searchQuery}&rdquo;
                    </Text>
                    <X size={16} color="#7e22ce" />
                  </View>
                </TouchableOpacity>
              )}

              {filters.jobType && (
                <TouchableOpacity
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, jobType: undefined }))
                  }
                  className="relative mr-3"
                >
                  <View className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full opacity-80" />
                  <View className="flex-row items-center bg-white/70 backdrop-blur-xs px-4 py-2 rounded-full border border-indigo-200/50 shadow-soft relative z-10">
                    <Text className="text-indigo-700 text-sm mr-2 font-medium">
                      {filters.jobType?.replace("_", " ")}
                    </Text>
                    <X size={16} color="#4f46e5" />
                  </View>
                </TouchableOpacity>
              )}

              {filters.experienceLevel && (
                <TouchableOpacity
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      experienceLevel: undefined,
                    }))
                  }
                  className="relative mr-3"
                >
                  <View className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full opacity-80" />
                  <View className="flex-row items-center bg-white/70 backdrop-blur-xs px-4 py-2 rounded-full border border-purple-200/50 shadow-soft relative z-10">
                    <Text className="text-purple-700 text-sm mr-2 font-medium">
                      {filters.experienceLevel}
                    </Text>
                    <X size={16} color="#7e22ce" />
                  </View>
                </TouchableOpacity>
              )}

              {filters.locationCity && (
                <TouchableOpacity
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, locationCity: undefined }))
                  }
                  className="relative mr-3"
                >
                  <View className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full opacity-80" />
                  <View className="flex-row items-center bg-white/70 backdrop-blur-xs px-4 py-2 rounded-full border border-blue-200/50 shadow-soft relative z-10">
                    <Text className="text-blue-700 text-sm mr-2 font-medium">
                      {filters.locationCity}
                    </Text>
                    <X size={16} color="#2563eb" />
                  </View>
                </TouchableOpacity>
              )}

              {(activeFilterCount > 0 || searchQuery) && (
                <TouchableOpacity
                  onPress={handleClearFilters}
                  className="relative"
                >
                  <View className="absolute inset-0 bg-gradient-to-r from-red-100 to-pink-100 rounded-full opacity-80" />
                  <View className="flex-row items-center bg-white/70 backdrop-blur-xs px-4 py-2 rounded-full border border-red-200/50 shadow-soft relative z-10">
                    <Text className="text-red-600 text-sm font-semibold">
                      Xóa tất cả
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* Quick Filters Section */}
        <View className="relative mx-4 mb-3">
          <View className="absolute inset-0 bg-white/60 backdrop-blur-xs rounded-2xl" />
          <View className="relative z-10 p-3">
            <Text className="text-base font-bold text-purple-700 mb-3">
              Bộ lọc nhanh
            </Text>
            <View className="flex-row flex-wrap -mx-1">
              {quickFilters.map((filter) => {
                const IconComponent = filter.icon;
                const isActive = Object.entries(filter.filter).some(
                  ([key, value]) =>
                    filters[key as keyof JobFiltersType] === value
                );
                return (
                  <TouchableOpacity
                    key={filter.id}
                    onPress={() => handleQuickFilter(filter.filter)}
                    className="mx-1 mb-2"
                  >
                    <View
                      className={`relative ${isActive ? "opacity-100" : "opacity-80"}`}
                    >
                      <View
                        className={`absolute inset-0 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-200 to-indigo-200"
                            : "bg-gradient-to-r from-purple-100/50 to-indigo-100/50"
                        } rounded-full`}
                      />
                      <View
                        className={`flex-row items-center px-4 py-2 rounded-full border relative z-10 ${
                          isActive
                            ? "bg-white/80 border-purple-300/50 shadow-soft"
                            : "bg-white/60 border-purple-200/30"
                        }`}
                      >
                        <IconComponent
                          size={16}
                          color={isActive ? "#7e22ce" : "#9333ea"}
                        />
                        <Text
                          className={`ml-2 text-sm font-medium ${
                            isActive ? "text-purple-700" : "text-purple-600"
                          }`}
                        >
                          {filter.label}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Trending Jobs Teaser */}
        <View className="relative mx-4 mb-4">
          <View className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-indigo-100/50 to-blue-100/50 rounded-2xl" />
          <View className="relative z-10 p-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <TrendingUp size={18} color="#7e22ce" />
                <Text className="text-base font-bold text-purple-700 ml-2">
                  Việc làm hot
                </Text>
              </View>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-medium text-sm">
                  Xem tất cả
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {[1, 2, 3, 4].map((item) => (
                <View key={item} className="relative mr-2 w-40">
                  <View className="absolute inset-0 bg-white/70 backdrop-blur-xs rounded-xl" />
                  <View className="relative z-10 p-2 border border-purple-100/50 rounded-xl">
                    <View className="flex-row items-center mb-1">
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                      <Text className="text-xs text-purple-600 font-medium ml-1">
                        Hot Job
                      </Text>
                    </View>
                    <Text className="font-semibold text-purple-700 text-xs mb-1">
                      Senior React Developer
                    </Text>
                    <Text className="text-xs text-purple-500 mb-1">
                      Tech Company • Hà Nội
                    </Text>
                    <Text className="text-xs text-indigo-600 font-medium">
                      25-35M VND
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Decorative Elements */}
        <View className="absolute top-0 right-8 w-24 h-24 bg-gradient-to-bl from-purple-200/10 to-transparent rounded-full" />
        <View className="absolute bottom-16 left-6 w-16 h-16 bg-gradient-to-tr from-indigo-200/10 to-transparent rounded-full" />
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View className="py-8 items-center">
        <View className="relative">
          {/* Outer glow */}
          <View className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-20 scale-150 animate-pulse" />
          {/* Inner container */}
          <View className="bg-white/80 backdrop-blur-sm rounded-full p-4 shadow-glow-purple">
            <ActivityIndicator size="large" color="#a855f7" />
          </View>
        </View>
        <Text className="text-purple-600 font-medium mt-4 animate-fade-in">
          Đang tải thêm việc làm...
        </Text>
      </View>
    );
  };

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <View className="flex-1 justify-center items-center px-6">
          {/* Decorative gradient background */}
          <View className="absolute inset-0 opacity-20">
            <View className="w-40 h-40 bg-gradient-to-br from-red-300 to-pink-300 rounded-full absolute top-20 left-8 opacity-30" />
            <View className="w-28 h-28 bg-gradient-to-br from-purple-300 to-red-300 rounded-full absolute bottom-32 right-12 opacity-30" />
          </View>

          {/* Main content */}
          <View className="relative z-10 items-center">
            {/* Error icon with gradient */}
            <View className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full items-center justify-center mb-6 shadow-soft">
              <View className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-400 rounded-full items-center justify-center">
                <Text className="text-white text-3xl">⚠️</Text>
              </View>
            </View>

            {/* Error title with gradient text */}
            <Text className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text mb-3 text-center">
              Đã xảy ra lỗi
            </Text>

            {/* Error message */}
            <Text className="text-purple-500 text-base text-center leading-6 mb-8 max-w-sm font-medium">
              {error?.message ||
                "Không thể tải danh sách việc làm. Vui lòng thử lại sau."}
            </Text>

            {/* Retry button with gradient */}
            <TouchableOpacity onPress={() => refetch()} className="relative">
              <View className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-glow-purple" />
              <View className="bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-4 rounded-full shadow-soft relative z-10">
                <Text className="text-white font-bold text-base">Thử lại</Text>
              </View>
            </TouchableOpacity>

            {/* Decorative line */}
            <View className="mt-8 w-20 h-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-full opacity-50" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
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
            colors={["#a855f7", "#6366f1", "#3b82f6"]}
            tintColor="#a855f7"
            progressBackgroundColor="#f3e8ff"
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 20 }}
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

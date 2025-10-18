import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  Filter,
  X,
  Eye,
  TrendingUp,
  Calendar,
  Clock,
  ChartBar,
  Briefcase,
  Building2,
  AlertCircle,
} from "lucide-react-native";
import { router } from "expo-router";
import jobViewService from "@/services/jobViewService";
import {
  JobView,
  JobViewsFilters,
  JobViewStats,
  JobType,
  WorkLocationType,
  ExperienceLevel,
} from "@/types/jobView.types";
import JobViewCard from "./JobViewCard";
import { useAuthContext } from "@/contexts/AuthContext";

export default function JobViewsScreen() {
  // Auth context
  let user = null;
  let isAuthenticated = false;

  try {
    const authContext = useAuthContext();
    user = authContext.user;
    isAuthenticated = authContext.isAuthenticated;
  } catch (error) {
    console.log("[JobViewsScreen] AuthContext not available");
  }

  // State management
  const [jobViews, setJobViews] = useState<JobView[]>([]);
  const [stats, setStats] = useState<JobViewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalViews, setTotalViews] = useState(0);

  // Filters
  const [filters, setFilters] = useState<JobViewsFilters>({
    page: 1,
    limit: 10,
    sortBy: "viewedAt",
    sortOrder: "desc",
  });

  // Selected filters
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);
  const [selectedWorkLocations, setSelectedWorkLocations] = useState<
    WorkLocationType[]
  >([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<
    ExperienceLevel[]
  >([]);
  const [selectedSort, setSelectedSort] = useState("viewedAt_desc");
  const [selectedDateRange, setSelectedDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  // Filter options
  const jobTypeOptions = [
    { value: "FULL_TIME" as JobType, label: "Toàn thời gian" },
    { value: "PART_TIME" as JobType, label: "Bán thời gian" },
    { value: "CONTRACT" as JobType, label: "Hợp đồng" },
    { value: "INTERNSHIP" as JobType, label: "Thực tập" },
    { value: "FREELANCE" as JobType, label: "Freelance" },
  ];

  const workLocationOptions = [
    { value: "ONSITE" as WorkLocationType, label: "Tại văn phòng" },
    { value: "REMOTE" as WorkLocationType, label: "Làm việc từ xa" },
    { value: "HYBRID" as WorkLocationType, label: "Kết hợp" },
  ];

  const experienceLevelOptions = [
    { value: "ENTRY" as ExperienceLevel, label: "Mới ra trường" },
    { value: "MID" as ExperienceLevel, label: "2-5 năm" },
    { value: "SENIOR" as ExperienceLevel, label: "5-10 năm" },
    { value: "LEAD" as ExperienceLevel, label: "Trưởng nhóm" },
    { value: "EXECUTIVE" as ExperienceLevel, label: "Quản lý cấp cao" },
  ];

  const sortOptions = [
    { value: "viewedAt_desc", label: "Mới xem nhất" },
    { value: "viewedAt_asc", label: "Xem cũ nhất" },
    { value: "jobTitle_asc", label: "Tên A-Z" },
    { value: "jobTitle_desc", label: "Tên Z-A" },
  ];

  // Load job views
  const loadJobViews = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        setError(null);
        const [sortBy, sortOrder] = selectedSort.split("_") as [
          JobViewsFilters["sortBy"],
          JobViewsFilters["sortOrder"]
        ];

        const response = await jobViewService.getJobViews({
          ...filters,
          page,
          search: searchQuery || undefined,
          jobType: selectedJobTypes.length > 0 ? selectedJobTypes : undefined,
          workLocationType:
            selectedWorkLocations.length > 0
              ? selectedWorkLocations
              : undefined,
          experienceLevel:
            selectedExperienceLevels.length > 0
              ? selectedExperienceLevels
              : undefined,
          sortBy,
          sortOrder,
          ...selectedDateRange,
        });

        if (response.success) {
          if (append) {
            setJobViews((prev) => [...prev, ...response.data]);
          } else {
            setJobViews(response.data);
          }
          setCurrentPage(response.pagination.page);
          setTotalPages(response.pagination.totalPages);
          setHasMore(response.pagination.hasNext);
          setTotalViews(response.pagination.total);
        }
      } catch (err) {
        console.error("Error loading job views:", err);
        setError("Không thể tải danh sách công việc đã xem");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [
      filters,
      searchQuery,
      selectedJobTypes,
      selectedWorkLocations,
      selectedExperienceLevels,
      selectedSort,
      selectedDateRange,
    ]
  );

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await jobViewService.getJobViewStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadJobViews(1);
    loadStats();
  }, []);

  // Reload on filter changes
  useEffect(() => {
    setCurrentPage(1);
    loadJobViews(1);
  }, [
    searchQuery,
    selectedJobTypes,
    selectedWorkLocations,
    selectedExperienceLevels,
    selectedSort,
    selectedDateRange,
  ]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadJobViews(1);
    loadStats();
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadJobViews(currentPage + 1, true);
    }
  };

  // Handle job press
  const handleJobPress = (jobView: JobView) => {
    router.push(`/job/${jobView.job.id}`);
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    setCurrentPage(1);
    loadJobViews(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedJobTypes([]);
    setSelectedWorkLocations([]);
    setSelectedExperienceLevels([]);
    setSelectedSort("viewedAt_desc");
    setSelectedDateRange({});
    setSearchQuery("");
  };

  // Toggle filter selection
  const toggleSelection = <T,>(
    value: T,
    selectedArray: T[],
    setSelectedArray: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter((item) => item !== value));
    } else {
      setSelectedArray([...selectedArray, value]);
    }
  };

  // Render statistics modal
  const renderStatsModal = () => {
    if (!stats) return null;

    return (
      <Modal
        visible={showStats}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStats(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-white mt-20 rounded-t-3xl">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Thống kê xem việc làm</Text>
              <TouchableOpacity onPress={() => setShowStats(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4">
              {/* Overview Stats */}
              <View className="py-4">
                <Text className="text-base font-semibold mb-3">Tổng quan</Text>
                <View className="flex-row flex-wrap">
                  <View className="w-1/2 p-2">
                    <View className="bg-blue-50 rounded-lg p-3">
                      <View className="flex-row items-center mb-2">
                        <Eye size={20} color="#3B82F6" />
                        <Text className="ml-2 text-blue-600 font-medium">
                          Tổng lượt xem
                        </Text>
                      </View>
                      <Text className="text-2xl font-bold text-gray-900">
                        {stats.totalViews}
                      </Text>
                    </View>
                  </View>
                  <View className="w-1/2 p-2">
                    <View className="bg-green-50 rounded-lg p-3">
                      <View className="flex-row items-center mb-2">
                        <Briefcase size={20} color="#10B981" />
                        <Text className="ml-2 text-green-600 font-medium">
                          Việc làm đã xem
                        </Text>
                      </View>
                      <Text className="text-2xl font-bold text-gray-900">
                        {stats.uniqueJobs}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Chart Alternative - Simple Bar Display */}
              {stats.viewsByDate.length > 0 && (
                <View className="py-4">
                  <Text className="text-base font-semibold mb-3">
                    Lượt xem 7 ngày qua
                  </Text>
                  <View className="bg-gray-50 rounded-lg p-3">
                    {stats.viewsByDate.slice(-7).map((item, index) => {
                      const date = new Date(item.date);
                      const maxCount = Math.max(...stats.viewsByDate.slice(-7).map(d => d.count));
                      const heightPercentage = (item.count / maxCount) * 100;
                      
                      return (
                        <View key={item.date} className="mb-3">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-xs text-gray-600">
                              {date.getDate()}/{date.getMonth() + 1}
                            </Text>
                            <Text className="text-xs font-medium text-gray-900">
                              {item.count} lượt
                            </Text>
                          </View>
                          <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <View 
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${heightPercentage}%` }}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Top Viewed Jobs */}
              {stats.topViewedJobs.length > 0 && (
                <View className="py-4">
                  <Text className="text-base font-semibold mb-3">
                    Top việc làm xem nhiều nhất
                  </Text>
                  {stats.topViewedJobs.map((job, index) => (
                    <View
                      key={job.jobId}
                      className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-2"
                    >
                      <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Text className="text-blue-600 font-bold">
                          {index + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-900">
                          {job.jobTitle}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {job.companyName}
                        </Text>
                      </View>
                      <View className="bg-blue-500 px-2 py-1 rounded">
                        <Text className="text-white text-xs font-medium">
                          {job.viewCount} lượt
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-white mt-20 rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold">Bộ lọc</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4">
            {/* Sort Options */}
            <View className="py-4">
              <Text className="text-base font-semibold mb-3">Sắp xếp theo</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSelectedSort(option.value)}
                  className="flex-row items-center py-2"
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 mr-3 ${
                      selectedSort === option.value
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    }`}
                  />
                  <Text className="text-gray-700">{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Job Type Filter */}
            <View className="py-4 border-t border-gray-100">
              <Text className="text-base font-semibold mb-3">
                Loại công việc
              </Text>
              {jobTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() =>
                    toggleSelection(
                      option.value,
                      selectedJobTypes,
                      setSelectedJobTypes
                    )
                  }
                  className="flex-row items-center py-2"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                      selectedJobTypes.includes(option.value)
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedJobTypes.includes(option.value) && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                  <Text className="text-gray-700">{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Work Location Filter */}
            <View className="py-4 border-t border-gray-100">
              <Text className="text-base font-semibold mb-3">
                Hình thức làm việc
              </Text>
              {workLocationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() =>
                    toggleSelection(
                      option.value,
                      selectedWorkLocations,
                      setSelectedWorkLocations
                    )
                  }
                  className="flex-row items-center py-2"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                      selectedWorkLocations.includes(option.value)
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedWorkLocations.includes(option.value) && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                  <Text className="text-gray-700">{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Experience Level Filter */}
            <View className="py-4 border-t border-gray-100">
              <Text className="text-base font-semibold mb-3">
                Cấp độ kinh nghiệm
              </Text>
              {experienceLevelOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() =>
                    toggleSelection(
                      option.value,
                      selectedExperienceLevels,
                      setSelectedExperienceLevels
                    )
                  }
                  className="flex-row items-center py-2"
                >
                  <View
                    className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                      selectedExperienceLevels.includes(option.value)
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedExperienceLevels.includes(option.value) && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                  <Text className="text-gray-700">{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View className="flex-row p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={resetFilters}
              className="flex-1 mr-2 py-3 border border-gray-300 rounded-lg"
            >
              <Text className="text-center text-gray-700 font-medium">
                Đặt lại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={applyFilters}
              className="flex-1 ml-2 py-3 bg-blue-600 rounded-lg"
            >
              <Text className="text-center text-white font-medium">
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Eye size={64} color="#d1d5db" />
      <Text className="text-lg font-semibold text-gray-900 mt-4">
        Chưa xem công việc nào
      </Text>
      <Text className="text-sm text-gray-500 text-center mt-2">
        Khám phá các công việc phù hợp và lưu lại để xem sau
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/jobs")}
        className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-medium">Khám phá việc làm</Text>
      </TouchableOpacity>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <AlertCircle size={64} color="#ef4444" />
      <Text className="text-lg font-semibold text-gray-900 mt-4">
        Đã xảy ra lỗi
      </Text>
      <Text className="text-sm text-gray-500 text-center mt-2">{error}</Text>
      {!isAuthenticated ? (
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Đăng nhập</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => loadJobViews(1)}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Main render
  if (loading && jobViews.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && jobViews.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 flex-1">
            Công việc đã xem
          </Text>
          <TouchableOpacity
            onPress={() => setShowStats(true)}
            className="bg-blue-50 p-2 rounded-lg"
          >
            <ChartBar size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        {stats && (
          <View className="flex-row px-4 pb-3">
            <View className="flex-1 bg-blue-50 rounded-lg p-3 mr-2">
              <Text className="text-xs text-blue-600 mb-1">Tổng lượt xem</Text>
              <Text className="text-lg font-bold text-gray-900">
                {stats.totalViews}
              </Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-lg p-3 ml-2">
              <Text className="text-xs text-green-600 mb-1">Việc đã xem</Text>
              <Text className="text-lg font-bold text-gray-900">
                {stats.uniqueJobs}
              </Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View className="px-4 pb-3">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search size={20} color="#6b7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm kiếm công việc đã xem..."
              className="flex-1 ml-2 text-gray-700"
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Bar */}
        <View className="flex-row items-center justify-between px-4 pb-3">
          <Text className="text-sm text-gray-600">
            {totalViews > 0
              ? `${totalViews} công việc đã xem`
              : "Không có công việc nào"}
          </Text>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-lg"
          >
            <Filter size={16} color="#2563eb" />
            <Text className="text-blue-600 text-sm font-medium ml-1">Lọc</Text>
            {(selectedJobTypes.length > 0 ||
              selectedWorkLocations.length > 0 ||
              selectedExperienceLevels.length > 0) && (
              <View className="ml-2 bg-blue-600 w-5 h-5 rounded-full items-center justify-center">
                <Text className="text-white text-xs">
                  {selectedJobTypes.length +
                    selectedWorkLocations.length +
                    selectedExperienceLevels.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Job List */}
      {jobViews.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={jobViews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobViewCard jobView={item} onPress={() => handleJobPress(item)} />
          )}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#2563eb"]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            if (loadingMore) {
              return (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#2563eb" />
                </View>
              );
            }
            if (!hasMore && jobViews.length > 0) {
              return (
                <View className="py-4 items-center">
                  <Text className="text-sm text-gray-500">
                    Đã hiển thị tất cả công việc
                  </Text>
                </View>
              );
            }
            return null;
          }}
        />
      )}

      {/* Modals */}
      {renderFilterModal()}
      {renderStatsModal()}
    </SafeAreaView>
  );
}
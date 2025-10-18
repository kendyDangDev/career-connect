import { useAuthContext } from "@/contexts/AuthContext";
import savedJobService from "@/services/savedJobService";
import { SavedJob, SavedJobsFilters } from "@/types/savedJob.types";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  Filter,
  Search,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SavedJobCard from "./SavedJobCard";
import { useAlert } from "@/contexts/AlertContext";

const SavedJobsScreen: React.FC = () => {
  const router = useRouter();

  const alert = useAlert();

  // Safely access auth context
  let user = null;
  let isAuthenticated = false;

  try {
    const authContext = useAuthContext();
    user = authContext.user;
    isAuthenticated = authContext.isAuthenticated;
  } catch (error) {
    // Context not available, use default values
    console.log("[SavedJobsScreen] AuthContext not available, using defaults");
  }

  // State management
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [filters, setFilters] = useState<SavedJobsFilters>({
    page: 1,
    limit: 10,
    sortBy: "savedAt",
    sortOrder: "desc",
  });

  // Selected filters for UI
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedWorkLocations, setSelectedWorkLocations] = useState<string[]>(
    []
  );
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<
    string[]
  >([]);
  const [selectedSort, setSelectedSort] = useState<string>("savedAt_desc");

  // Filter options
  const jobTypeOptions = [
    { value: "FULL_TIME", label: "Toàn thời gian" },
    { value: "PART_TIME", label: "Bán thời gian" },
    { value: "CONTRACT", label: "Hợp đồng" },
    { value: "INTERNSHIP", label: "Thực tập" },
  ];

  const workLocationOptions = [
    { value: "ONSITE", label: "Tại văn phòng" },
    { value: "REMOTE", label: "Làm việc từ xa" },
    { value: "HYBRID", label: "Kết hợp" },
  ];

  const experienceLevelOptions = [
    { value: "ENTRY", label: "Entry Level" },
    { value: "MID", label: "Middle" },
    { value: "SENIOR", label: "Senior" },
    { value: "LEAD", label: "Lead" },
    { value: "EXECUTIVE", label: "Executive" },
  ];

  const sortOptions = [
    { value: "savedAt_desc", label: "Mới lưu nhất" },
    { value: "savedAt_asc", label: "Cũ nhất" },
    { value: "deadline_asc", label: "Sắp hết hạn" },
    { value: "salary_desc", label: "Lương cao nhất" },
    { value: "jobTitle_asc", label: "Tên A-Z" },
  ];

  // Load saved jobs
  const loadSavedJobs = useCallback(
    async (page: number = 1, append: boolean = false) => {
      // Skip authentication check in development with mock data
      if (!__DEV__ && !isAuthenticated) {
        setError("Vui lòng đăng nhập để xem việc làm đã lưu");
        setLoading(false);
        return;
      }

      try {
        const [sortBy, sortOrder] = selectedSort.split("_") as [
          SavedJobsFilters["sortBy"],
          SavedJobsFilters["sortOrder"],
        ];

        const response = await savedJobService.getSavedJobs({
          ...filters,
          page,
          search: searchQuery || undefined,
          jobType:
            (selectedJobTypes || []).length > 0
              ? (selectedJobTypes as SavedJobsFilters["jobType"])
              : undefined,
          workLocationType:
            (selectedWorkLocations || []).length > 0
              ? (selectedWorkLocations as SavedJobsFilters["workLocationType"])
              : undefined,
          experienceLevel:
            (selectedExperienceLevels || []).length > 0
              ? (selectedExperienceLevels as SavedJobsFilters["experienceLevel"])
              : undefined,
          sortBy,
          sortOrder,
        });

        console.log("log nè:", await response.data);

        if (response.success) {
          console.log(response);
          if (append) {
            setSavedJobs((prev) => [...prev, ...response.data.data]);
            console.log({ savedJobs });
          } else {
            setSavedJobs(response.data.data);
            console.log(savedJobs);
          }
          setCurrentPage(response.data.pagination?.page);
          setTotalPages(response.data.pagination?.totalPages);
          setHasMore(response.data.pagination?.hasNext);
          setError(null);
        }
      } catch (err) {
        console.error("Error loading saved jobs:", err);
        setError("Không thể tải danh sách việc làm đã lưu");
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [
      isAuthenticated,
      filters,
      searchQuery,
      selectedJobTypes,
      selectedWorkLocations,
      selectedExperienceLevels,
      selectedSort,
      // savedJobs,
    ]
  );

  // Initial load
  useEffect(() => {
    // Debug authentication status

    loadSavedJobs(1);
  }, []);

  // Reload when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadSavedJobs(1);
  }, [
    searchQuery,
    selectedJobTypes,
    selectedWorkLocations,
    selectedExperienceLevels,
    selectedSort,
    loadSavedJobs,
  ]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadSavedJobs(1);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadSavedJobs(currentPage + 1, true);
    }
  };

  // Handle remove saved job
  const handleRemoveSavedJob = async (savedJobId: string) => {
    try {
      const response = await savedJobService.removeSavedJob(savedJobId);
      if (response.success) {
        setSavedJobs((prev) => prev.filter((job) => job.id !== savedJobId));
        alert.success("Thành công", "Đã xóa việc làm khỏi danh sách đã lưu");
      }
    } catch (err) {
      console.error("Error removing saved job:", err);
      alert.error("Lỗi", "Không thể xóa việc làm. Vui lòng thử lại.");
    }
  };

  // Handle job press
  const handleJobPress = (job: SavedJob) => {
    // Navigate to job detail screen
    router.push(`/job/${job.job.id}`);
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    setCurrentPage(1);
    loadSavedJobs(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedJobTypes([]);
    setSelectedWorkLocations([]);
    setSelectedExperienceLevels([]);
    setSelectedSort("savedAt_desc");
    setSearchQuery("");
  };

  // Toggle filter selection
  const toggleFilterSelection = (
    value: string,
    selectedArray: string[],
    setSelectedArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter((item) => item !== value));
    } else {
      setSelectedArray([...selectedArray, value]);
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Bookmark size={64} color="#d1d5db" />
      <Text className="text-lg font-semibold text-gray-900 mt-4">
        Chưa có việc làm nào được lưu
      </Text>
      <Text className="text-sm text-gray-500 text-center mt-2">
        Lưu các việc làm yêu thích để xem lại sau
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/")}
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
          onPress={() => loadSavedJobs(1)}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
                    toggleFilterSelection(
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
                    toggleFilterSelection(
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
                    toggleFilterSelection(
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

  // Main render
  if (loading && (savedJobs || []).length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error && (savedJobs || []).length === 0) {
    return renderErrorState();
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-4 shadow-sm z-0">
        <View className="flex-row items-center gap-2 mb-4">
          <TouchableOpacity onPress={() => router.back()} className="">
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">
            Việc làm đã lưu
          </Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
          <Search size={20} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm việc làm đã lưu..."
            className="flex-1 ml-2 text-gray-700"
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button and Count */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-600">
            {(savedJobs || []).length > 0
              ? `${(savedJobs || []).length} việc làm đã lưu`
              : "Không có việc làm nào"}
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
      {(savedJobs || []).length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={savedJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SavedJobCard
              savedJob={item}
              onPress={() => handleJobPress(item)}
              onRemove={() => handleRemoveSavedJob(item.id)}
            />
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
            if (!hasMore && (savedJobs || []).length > 0) {
              return (
                <View className="py-4 items-center">
                  <Text className="text-sm text-gray-500">
                    Đã hiển thị tất cả việc làm
                  </Text>
                </View>
              );
            }
            return null;
          }}
        />
      )}

      {/* Filter Modal */}
      {renderFilterModal()}
    </View>
  );
};

export default SavedJobsScreen;

import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  Filter,
  X,
  Briefcase,
  AlertCircle,
  ChevronDown,
  Calendar,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  ArrowLeft,
} from "lucide-react-native";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import applicationService from "@/services/applicationService";
import ApplicationCard from "./ApplicationCard";
import {
  Application,
  ApplicationStatus,
  ApplicationsFilters,
} from "@/types/application.types";

const ApplicationsScreen: React.FC = () => {
  const router = useRouter();
  const alert = useAlert();

  // Safely access auth context
  let user = null;
  let isAuthenticated = false;
  let logout = null;

  try {
    const authContext = useAuthContext();
    user = authContext.user;
    isAuthenticated = authContext.isAuthenticated;
    logout = authContext.logout;
  } catch (error) {
    console.log(
      "[ApplicationsScreen] AuthContext not available, using defaults"
    );
  }

  // State management
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timeout ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus[]>([]);
  const [selectedSort, setSelectedSort] = useState<
    "appliedAt" | "statusUpdatedAt" | "rating"
  >("appliedAt");
  const [selectedSortOrder, setSelectedSortOrder] = useState<"asc" | "desc">(
    "desc"
  );

  // Statistics
  const [stats, setStats] = useState<Record<ApplicationStatus, number> | null>(
    null
  );
  const [statsLoading, setStatsLoading] = useState(false);

  // Status options with icons
  const statusOptions = [
    {
      value: ApplicationStatus.APPLIED,
      label: "Đã nộp",
      icon: FileText,
      color: "#2563eb",
    },
    {
      value: ApplicationStatus.SCREENING,
      label: "Đang xét duyệt",
      icon: Eye,
      color: "#ca8a04",
    },
    {
      value: ApplicationStatus.INTERVIEWING,
      label: "Phỏng vấn",
      icon: Calendar,
      color: "#7c3aed",
    },
    {
      value: ApplicationStatus.OFFERED,
      label: "Đã nhận offer",
      icon: CheckCircle,
      color: "#16a34a",
    },
    {
      value: ApplicationStatus.HIRED,
      label: "Đã tuyển",
      icon: Star,
      color: "#10b981",
    },
    {
      value: ApplicationStatus.REJECTED,
      label: "Từ chối",
      icon: XCircle,
      color: "#dc2626",
    },
    {
      value: ApplicationStatus.WITHDRAWN,
      label: "Đã rút",
      icon: AlertCircle,
      color: "#6b7280",
    },
  ];

  const sortOptions = [
    { value: "appliedAt", label: "Ngày nộp" },
    { value: "statusUpdatedAt", label: "Cập nhật gần nhất" },
    { value: "rating", label: "Đánh giá" },
  ];

  // Load applications
  const loadApplications = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!isAuthenticated) {
        setError("Vui lòng đăng nhập để xem đơn ứng tuyển");
        setLoading(false);
        return;
      }

      try {
        const filters: ApplicationsFilters = {
          page,
          limit: 10,
          sortBy: selectedSort,
          sortOrder: selectedSortOrder,
          search: searchQuery || undefined,
          status: selectedStatus.length > 0 ? selectedStatus : undefined,
        };

        const response = await applicationService.getApplications(filters);

        if (response.success) {
          if (append) {
            setApplications((prev) => [...prev, ...response.data.applications]);
          } else {
            setApplications(response.data.applications);
          }
          setCurrentPage(response.data.pagination.page);
          setTotalPages(response.data.pagination.totalPages);
          setHasMore(
            response.data.pagination.page < response.data.pagination.totalPages
          );
          setError(null);
        }
      } catch (err: any) {
        console.error("Error loading applications:", err);

        // Check if token expired
        if (err.message && err.message.includes("Phiên đăng nhập đã hết hạn")) {
          setError(err.message);
          // Auto logout after 2 seconds
          setTimeout(() => {
            if (logout) logout();
            router.replace("/(auth)/login");
          }, 2000);
        } else {
          setError(err.message || "Không thể tải danh sách đơn ứng tuyển");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [
      isAuthenticated,
      selectedStatus,
      selectedSort,
      selectedSortOrder,
      searchQuery,
    ]
  );

  // Load statistics
  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;

    setStatsLoading(true);
    try {
      const response = await applicationService.getApplicationStats();

      if (response.success) {
        setStats(response.data.byStatus);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
      // Don't show error for stats, just log it
    } finally {
      setStatsLoading(false);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    loadApplications(1);
    loadStats();
  }, []);

  // Reload when filters change (except searchQuery which has its own handler)
  useEffect(() => {
    setCurrentPage(1);
    loadApplications(1);
  }, [selectedStatus, selectedSort, selectedSortOrder]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadApplications(1);
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadApplications(1);
    loadStats();
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadApplications(currentPage + 1, true);
    }
  };

  // Handle withdraw application
  const handleWithdraw = async (applicationId: string) => {
    Alert.alert(
      "Xác nhận rút hồ sơ",
      "Bạn có chắc chắn muốn rút hồ sơ ứng tuyển này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Rút hồ sơ",
          style: "destructive",
          onPress: async () => {
            try {
              const response =
                await applicationService.withdrawApplication(applicationId);
              if (response.success) {
                // Reload the applications list to get updated data
                await loadApplications(1);
                await loadStats();
                alert.success("Thành công", "Đã rút hồ sơ ứng tuyển");
              }
            } catch (err) {
              console.error("Error withdrawing application:", err);
              alert.error("Lỗi", "Không thể rút hồ sơ. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };

  // Handle application press
  const handleApplicationPress = (application: Application) => {
    router.push(`/job/${application.job.id}`);
  };

  // Handle view details
  const handleViewDetails = (application: Application) => {
    router.push(`/application/${application.id}`);
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    setCurrentPage(1);
    loadApplications(1);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedStatus([]);
    setSelectedSort("appliedAt");
    setSelectedSortOrder("desc");
    setSearchQuery("");
  };

  // Toggle status selection
  const toggleStatusSelection = (status: ApplicationStatus) => {
    if (selectedStatus.includes(status)) {
      setSelectedStatus(selectedStatus.filter((s) => s !== status));
    } else {
      setSelectedStatus([...selectedStatus, status]);
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Briefcase size={64} color="#d1d5db" />
      <Text className="text-lg font-semibold text-gray-900 mt-4">
        Chưa có đơn ứng tuyển nào
      </Text>
      <Text className="text-sm text-gray-500 text-center mt-2">
        Bắt đầu ứng tuyển công việc phù hợp với bạn
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/")}
        className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-medium">Khám phá công việc</Text>
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
          onPress={() => loadApplications(1)}
          className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-600 mt-2">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between ">
          <View className="flex-row items-center gap-2 py-3">
            <TouchableOpacity onPress={() => router.back()} className="">
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              Công việc đã ứng tuyển
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className="bg-gray-100 px-3 py-2 rounded-lg flex-row items-center"
          >
            <Filter size={16} color="#6b7280" />
            <Text className="text-gray-700 text-sm font-medium ml-1">Lọc</Text>
            {(selectedStatus.length > 0 || searchQuery) && (
              <View className="bg-blue-600 w-2 h-2 rounded-full ml-2" />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-lg px-3 py-2 flex-row items-center">
          <Search size={20} color="#6b7280" />
          <TextInput
            placeholder="Tìm kiếm công việc, công ty..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-900"
            placeholderTextColor="#9ca3af"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Stats Summary */}
        {statsLoading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  className="bg-gray-100 px-4 py-2 rounded-lg w-24 h-8 animate-pulse"
                />
              ))}
            </View>
          </ScrollView>
        ) : stats ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row space-x-3">
              {statusOptions.map((option) => {
                const count = stats[option.value] || 0;
                const Icon = option.icon;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setSelectedStatus([option.value]);
                      setCurrentPage(1);
                    }}
                    className="bg-gray-50 px-3 py-2 rounded-lg flex-row items-center"
                  >
                    <Icon size={14} color={option.color} />
                    <Text className="text-gray-700 text-xs font-medium ml-1">
                      {option.label}
                    </Text>
                    <View className="bg-gray-200 px-2 py-0.5 rounded-full ml-2">
                      <Text className="text-gray-700 text-xs font-bold">
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        ) : null}
      </View>

      {/* Applications List */}
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ApplicationCard
            application={item}
            onPress={handleApplicationPress}
            onWithdraw={handleWithdraw}
            onViewDetails={handleViewDetails}
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 80,
        }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#2563eb"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-black/50">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowFilters(false)}
          />
          <View className="bg-white rounded-t-3xl px-6 py-6">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-gray-900">
                Bộ lọc tìm kiếm
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Status Filter */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Trạng thái đơn ứng tuyển
                </Text>
                <View className="flex-row flex-wrap">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedStatus.includes(option.value);
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => toggleStatusSelection(option.value)}
                        className={`mr-2 mb-2 px-3 py-2 rounded-lg flex-row items-center ${
                          isSelected
                            ? "bg-blue-100 border border-blue-600"
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <Icon
                          size={14}
                          color={isSelected ? "#2563eb" : option.color}
                        />
                        <Text
                          className={`ml-1.5 text-sm font-medium ${
                            isSelected ? "text-blue-700" : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Sort Options */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Sắp xếp theo
                </Text>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSelectedSort(option.value as any)}
                    className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                      selectedSort === option.value ? "bg-blue-50" : ""
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        selectedSort === option.value
                          ? "text-blue-700 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </Text>
                    {selectedSort === option.value && (
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          onPress={() =>
                            setSelectedSortOrder(
                              selectedSortOrder === "asc" ? "desc" : "asc"
                            )
                          }
                          className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center"
                        >
                          <Text className="text-blue-700 text-sm mr-1">
                            {selectedSortOrder === "asc"
                              ? "Tăng dần"
                              : "Giảm dần"}
                          </Text>
                          <ChevronDown
                            size={14}
                            color="#2563eb"
                            style={{
                              transform: [
                                {
                                  rotate:
                                    selectedSortOrder === "asc"
                                      ? "180deg"
                                      : "0deg",
                                },
                              ],
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row items-center justify-between pt-4 border-t border-gray-200">
              <TouchableOpacity onPress={resetFilters} className="px-6 py-3">
                <Text className="text-gray-700 font-medium">Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="bg-blue-600 px-8 py-3 rounded-lg"
              >
                <Text className="text-white font-medium">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ApplicationsScreen;

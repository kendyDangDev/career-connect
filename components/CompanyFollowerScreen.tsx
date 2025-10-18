import companyFollowerService from "@/services/companyFollowerService";
import type {
  CompanyFollower,
  CompanyFollowersFilters,
  CompanySize,
  VerificationStatus,
} from "@/types/companyFollower.types";
import { router } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Filter,
  Search,
  WifiOff,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CompanyFollowerCard from "./CompanyFollowerCard";

export default function CompanyFollowerScreen() {
  const [followers, setFollowers] = useState<CompanyFollower[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Filter states
  const [selectedSizes, setSelectedSizes] = useState<CompanySize[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus[]>(
    []
  );
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [sortBy, setSortBy] = useState<
    "followedAt" | "companyName" | "jobCount"
  >("followedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const loadFollowers = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        setError(null);
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const filters: CompanyFollowersFilters = {
          page,
          limit: 10,
          search: searchQuery || undefined,
          companySize: selectedSizes.length > 0 ? selectedSizes : undefined,
          verificationStatus:
            selectedStatus.length > 0 ? selectedStatus : undefined,
          city: selectedCity || undefined,
          province: selectedProvince || undefined,
          sortBy,
          sortOrder,
        };

        const response =
          await companyFollowerService.getFollowedCompanies(filters);

        if (response.success) {
          if (append) {
            setFollowers((prev) => [...prev, ...response.data.data]);
          } else {
            setFollowers(response.data.data);
          }
          setTotalPages(response.data.pagination.totalPages);
          setTotalFollowers(response.data.pagination.total);
          setCurrentPage(page);
          setRetryCount(0);
        }
      } catch (error: any) {
        console.error("Error loading followers:", error);

        // Determine error type and set appropriate message
        let errorMessage = "Không thể tải danh sách công ty";

        if (error.message?.includes("No authentication token")) {
          errorMessage =
            "Vui lòng đăng nhập để xem danh sách công ty đang theo dõi";
        } else if (error.message?.includes("timeout")) {
          errorMessage = "Kết nối mạng chậm, vui lòng thử lại";
        } else if (
          error.message?.includes("network") ||
          error.message?.includes("fetch")
        ) {
          errorMessage = "Không có kết nối mạng";
        } else if (error.status === 401) {
          errorMessage = "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại";
        } else if (error.status === 403) {
          errorMessage = "Bạn không có quyền truy cập tính năng này";
        } else if (error.status === 404) {
          errorMessage = "Không tìm thấy thông tin hồ sơ ứng viên";
        }

        setError(errorMessage);

        // Clear data on error if it's the first page
        if (page === 1 && !append) {
          setFollowers([]);
          setTotalPages(0);
          setTotalFollowers(0);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [
      searchQuery,
      selectedSizes,
      selectedStatus,
      selectedCity,
      selectedProvince,
      sortBy,
      sortOrder,
    ]
  );

  useEffect(() => {
    loadFollowers();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadFollowers(1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFollowers(1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && currentPage < totalPages) {
      loadFollowers(currentPage + 1, true);
    }
  };

  const handleUnfollow = (companyId: string) => {
    setFollowers((prev) => prev.filter((f) => f.company.id !== companyId));
    setTotalFollowers((prev) => prev - 1);
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    loadFollowers(currentPage);
  };

  const applyFilters = () => {
    setShowFilters(false);
    loadFollowers(1);
  };

  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedStatus([]);
    setSelectedCity("");
    setSelectedProvince("");
    setSortBy("followedAt");
    setSortOrder("desc");
    setShowFilters(false);
    loadFollowers(1);
  };

  const toggleSize = (size: CompanySize) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleStatus = (status: VerificationStatus) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const renderEmpty = () => {
    // Show error state if there's an error
    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          {error.includes("kết nối") ? (
            <WifiOff size={64} color="#EF4444" />
          ) : (
            <AlertCircle size={64} color="#EF4444" />
          )}
          <Text className="text-lg font-semibold text-gray-900 mt-4">
            Đã xảy ra lỗi
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center px-8">
            {error}
          </Text>
          <TouchableOpacity
            className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
            onPress={handleRetry}
          >
            <Text className="text-white font-semibold">Thử lại</Text>
          </TouchableOpacity>
          {error.includes("đăng nhập") && (
            <TouchableOpacity
              className="mt-3 border border-blue-600 px-6 py-3 rounded-lg"
              onPress={() => router.push("/login")}
            >
              <Text className="text-blue-600 font-semibold">Đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // Show empty state if no followers
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Building2 size={64} color="#D1D5DB" />
        <Text className="text-lg font-semibold text-gray-900 mt-4">
          Chưa theo dõi công ty nào
        </Text>
        <Text className="text-sm text-gray-500 mt-2 text-center px-8">
          Khám phá và theo dõi các công ty yêu thích để nhận thông báo về việc
          làm mới
        </Text>
        <TouchableOpacity
          className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
          onPress={() => router.push("/companies")}
        >
          <Text className="text-white font-semibold">Khám phá công ty</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilters = () => (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-white z-50">
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* Filter Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <ArrowLeft size={24} color="#111827" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold ml-3">Bộ lọc</Text>
            </View>
            <TouchableOpacity onPress={resetFilters}>
              <Text className="text-blue-600 font-medium">Đặt lại</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4">
            {/* Company Size */}
            <View className="py-4 border-b border-gray-100">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Quy mô công ty
              </Text>
              <View className="flex-row flex-wrap">
                {(
                  [
                    "STARTUP_1_10",
                    "SMALL_11_50",
                    "MEDIUM_51_200",
                    "LARGE_201_500",
                    "ENTERPRISE_501_PLUS",
                  ] as CompanySize[]
                ).map((size) => (
                  <TouchableOpacity
                    key={size}
                    className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                      selectedSizes.includes(size)
                        ? "bg-blue-50 border-blue-600"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => toggleSize(size)}
                  >
                    <Text
                      className={
                        selectedSizes.includes(size)
                          ? "text-blue-600 font-medium"
                          : "text-gray-700"
                      }
                    >
                      {size === "STARTUP_1_10" && "1-10 người"}
                      {size === "SMALL_11_50" && "11-50 người"}
                      {size === "MEDIUM_51_200" && "51-200 người"}
                      {size === "LARGE_201_500" && "201-500 người"}
                      {size === "ENTERPRISE_501_PLUS" && "500+ người"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Verification Status */}
            <View className="py-4 border-b border-gray-100">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Trạng thái xác thực
              </Text>
              <View className="flex-row flex-wrap">
                {(
                  ["VERIFIED", "PENDING", "REJECTED"] as VerificationStatus[]
                ).map((status) => (
                  <TouchableOpacity
                    key={status}
                    className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                      selectedStatus.includes(status)
                        ? "bg-blue-50 border-blue-600"
                        : "bg-white border-gray-300"
                    }`}
                    onPress={() => toggleStatus(status)}
                  >
                    <Text
                      className={
                        selectedStatus.includes(status)
                          ? "text-blue-600 font-medium"
                          : "text-gray-700"
                      }
                    >
                      {status === "VERIFIED" && "Đã xác thực"}
                      {status === "PENDING" && "Chờ xác thực"}
                      {status === "REJECTED" && "Từ chối"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location */}
            <View className="py-4 border-b border-gray-100">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Địa điểm
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
                placeholder="Thành phố"
                value={selectedCity}
                onChangeText={setSelectedCity}
              />
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Tỉnh/Thành phố"
                value={selectedProvince}
                onChangeText={setSelectedProvince}
              />
            </View>

            {/* Sort Options */}
            <View className="py-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Sắp xếp theo
              </Text>
              <View className="mb-3">
                {[
                  { value: "followedAt", label: "Ngày theo dõi" },
                  { value: "companyName", label: "Tên công ty" },
                  { value: "jobCount", label: "Số lượng việc làm" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`flex-row items-center py-2 ${
                      sortBy === option.value ? "opacity-100" : "opacity-50"
                    }`}
                    onPress={() => setSortBy(option.value as typeof sortBy)}
                  >
                    <View
                      className={`w-5 h-5 rounded-full border-2 mr-3 ${
                        sortBy === option.value
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-400"
                      }`}
                    >
                      {sortBy === option.value && (
                        <View className="w-2 h-2 rounded-full bg-white m-auto" />
                      )}
                    </View>
                    <Text className="text-gray-700">{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  className={`flex-1 mr-2 py-2 rounded-lg border ${
                    sortOrder === "asc"
                      ? "bg-blue-50 border-blue-600"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => setSortOrder("asc")}
                >
                  <Text
                    className={`text-center ${
                      sortOrder === "asc"
                        ? "text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    Tăng dần
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 ml-2 py-2 rounded-lg border ${
                    sortOrder === "desc"
                      ? "bg-blue-50 border-blue-600"
                      : "bg-white border-gray-300"
                  }`}
                  onPress={() => setSortOrder("desc")}
                >
                  <Text
                    className={`text-center ${
                      sortOrder === "desc"
                        ? "text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    Giảm dần
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-lg"
              onPress={applyFilters}
            >
              <Text className="text-white text-center font-semibold">
                Áp dụng bộ lọc
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  if (loading && followers.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-3">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold ml-3 flex-1">
            Công ty đang theo dõi
          </Text>
          {totalFollowers > 0 && (
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-600 font-semibold text-sm">
                {totalFollowers}
              </Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View className="px-4 pb-3">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-900"
              placeholder="Tìm kiếm công ty..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Button */}
        <View className="px-4 pb-3">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-300 rounded-lg py-2"
            onPress={() => setShowFilters(true)}
          >
            <Filter size={18} color="#6B7280" />
            <Text className="ml-2 text-gray-700 font-medium">Bộ lọc</Text>
            {(selectedSizes.length > 0 ||
              selectedStatus.length > 0 ||
              selectedCity ||
              selectedProvince) && (
              <View className="ml-2 bg-blue-600 w-2 h-2 rounded-full" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {followers.length === 0 && !loading ? (
        renderEmpty()
      ) : error && followers.length > 0 ? (
        // Show error banner if there's an error but we have cached data
        <View style={{ flex: 1 }}>
          <View className="bg-red-50 border border-red-200 mx-4 mt-2 p-3 rounded-lg flex-row items-center">
            <AlertCircle size={20} color="#EF4444" />
            <Text className="text-red-800 text-sm ml-2 flex-1">{error}</Text>
            <TouchableOpacity onPress={handleRetry}>
              <Text className="text-red-600 font-semibold text-sm">
                Thử lại
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={followers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CompanyFollowerCard
                follower={item}
                onUnfollow={handleUnfollow}
              />
            )}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#3B82F6"]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#3B82F6" />
                </View>
              ) : null
            }
          />
        </View>
      ) : followers.length > 0 ? (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CompanyFollowerCard follower={item} onUnfollow={handleUnfollow} />
          )}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#3B82F6"]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            ) : null
          }
        />
      ) : null}
      {/* Filters Modal */}
      {showFilters && renderFilters()}
    </SafeAreaView>
  );
}

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryFilter from "./CategoryFilter";
import Header from "./Header";
import JobCard from "./JobCard";
import JobMatchSection from "./JobMatchSection";
import TopCompaniesSection from "./TopCompaniesSection";
import UserReviewsSection from "./UserReviewsSection";
// import JobCategoriesSection from './JobCategoriesSection';
import savedJobService from "@/services/savedJobService";
import { router } from "expo-router";
import jobService from "../services/jobService";
import { Job, JobFilters } from "../types/job";
import StatsSection from "./StatsSection";
import { useAlert } from "@/contexts/AlertContext";

interface HomePageProps {
  onJobPress?: (job: Job) => void;
  onNotificationPress?: () => void;
  onSeeAllPress?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onJobPress,
  onNotificationPress,
  onSeeAllPress,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const alert = useAlert();

  // Fetch jobs data
  const fetchJobs = async (
    filters: JobFilters = {},
    resetData: boolean = true
  ) => {
    try {
      const response = await jobService.getJobs({
        page: 1,
        limit: 10,
        ...filters,
        ...(selectedCategory !== "all" && { categoryId: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      });

      if (response.success || response.data) {
        const responseData = response.data || response;
        const newJobs = responseData.jobs || [];
        setJobs(resetData ? newJobs : [...jobs, ...newJobs]);
        setPagination({
          page: responseData.page || responseData.pagination?.page || 1,
          totalPages: responseData.totalPages || responseData.pagination?.totalPages || 1,
          total: responseData.total || responseData.pagination?.total || newJobs.length,
        });
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      // Use mock data as fallback
      console.log("Using mock data as fallback");
    }
  };

  // Load more jobs for pagination
  const loadMoreJobs = async () => {
    if (loadingMore || pagination.page >= pagination.totalPages) return;

    setLoadingMore(true);
    try {
      const response = await jobService.getJobs({
        page: pagination.page + 1,
        limit: 10,
        ...(selectedCategory !== "all" && { categoryId: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      });

      if (response.success || response.data) {
        const responseData = response.data || response;
        const newJobs = responseData.jobs || [];
        setJobs([...jobs, ...newJobs]);
        setPagination({
          page: responseData.page || responseData.pagination?.page || 1,
          totalPages: responseData.totalPages || responseData.pagination?.totalPages || 1,
          total: responseData.total || responseData.pagination?.total || newJobs.length,
        });
      }
    } catch (error) {
      console.error("Error loading more jobs:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialJobs = async () => {
      setLoading(true);
      await fetchJobs({}, true);
      setLoading(false);
    };

    loadInitialJobs();
  }, []);

  // Handle search and category changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchJobs({}, true);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory]);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs({}, true);
    setRefreshing(false);
  };

  // Handle search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Handle job card press
  const handleJobPress = (job: Job) => {
    onJobPress?.(job);
    console.log("pressed:", job);
    router.push(`/job/${job.id}`); // Navigate to JobDetailScreen with job ID
  };

  // Handle favorite press
  const handleFavoritePress = async (jobId: string, isFavorited: boolean) => {
    // const {saved} = await savedJobService.toggleSaveJob(jobId)

    console.log("saved:", isFavorited)
    if(isFavorited){
      alert.success("Thành công", "Đã lưu công việc")
    }else{
      alert.success("", "Đã bỏ lưu công việc")
    }
  };

  // Render job item
  const renderJobItem = ({ item }: { item: Job }) => (
    <JobCard
      job={item}
      onPress={() => handleJobPress(item)}
      onSavePress={handleFavoritePress}
    />
  );

  // Render footer for loading more
  const renderFooter = () => {
    return (
      <View>
        {/* User Reviews Section at the bottom */}
        <UserReviewsSection />

        {/* Loading indicator for pagination */}
        {loadingMore && (
          <View className="py-4">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Text className="text-gray-500 text-lg mb-2">No jobs found</Text>
      <Text className="text-gray-400 text-sm text-center px-8">
        Try adjusting your search criteria or check back later for new
        opportunities
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-500 mt-4">Loading jobs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJobItem}
        ListHeaderComponent={() => (
          <View>
            <Header
              searchValue={searchQuery}
              onSearchChange={handleSearchChange}
              onNotificationPress={onNotificationPress}
              onMicPress={() => {
                // TODO: Implement voice search
                console.log("Voice search pressed");
              }}
              onFilterPress={() => {
                // TODO: Implement advanced filter
                console.log("Filter pressed");
              }}
            />

            {/* Top Companies Section */}
            <TopCompaniesSection
              onCompanyPress={(company) =>
              {
                if(company.companySlug) {
                  router.push(`/company/${company.companySlug}`);
                } else {
                  console.log("Company slug not available:", company.companyName);
                }
              }
              }
              onSeeAllPress={() => console.log("See all companies")}
            />

            {/* Job Categories Section */}
            {/* <JobCategoriesSection
              onCategoryPress={(categoryId) => {
                setSelectedCategory(categoryId);
                console.log('Category pressed:', categoryId);
              }}
              onSeeAllPress={() => console.log('See all categories')}
            /> */}

            {/* Stats Section */}
            <StatsSection />

            {/* Category Filter Tabs */}
            <CategoryFilter
              selectedCategoryId={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />

            {/* Job Match Section */}
            <JobMatchSection onSeeAllPress={onSeeAllPress} />
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        onEndReached={loadMoreJobs}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={jobs.length === 0 ? { flexGrow: 1 } : undefined}
      />
    </SafeAreaView>
  );
};

export default HomePage;

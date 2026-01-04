import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryFilter from './CategoryFilter';
import Header from './Header';
import JobCard from './JobCard';
import JobMatchSection from './JobMatchSection';
import TopCompaniesSection from './TopCompaniesSection';
import UserReviewsSection from './UserReviewsSection';
// import JobCategoriesSection from './JobCategoriesSection';
import savedJobService from '@/services/savedJobService';
import { router } from 'expo-router';
import jobService from '../services/jobService';
import { Job, JobFilters } from '../types/job';
import StatsSection from './StatsSection';
import { useAlert } from '@/contexts/AlertContext';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
        ...(selectedCategory !== 'all' && { categoryId: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      });

      if (response.success || response.data) {
        const responseData = response.data || response;
        const newJobs = responseData.jobs || [];
        setJobs(resetData ? newJobs : [...jobs, ...newJobs]);
        setPagination({
          page: responseData.page || responseData.pagination?.page || 1,
          totalPages:
            responseData.totalPages || responseData.pagination?.totalPages || 1,
          total:
            responseData.total ||
            responseData.pagination?.total ||
            newJobs.length,
        });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Use mock data as fallback
      console.log('Using mock data as fallback');
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
        ...(selectedCategory !== 'all' && { categoryId: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      });

      if (response.success || response.data) {
        const responseData = response.data || response;
        const newJobs = responseData.jobs || [];
        setJobs([...jobs, ...newJobs]);
        setPagination({
          page: responseData.page || responseData.pagination?.page || 1,
          totalPages:
            responseData.totalPages || responseData.pagination?.totalPages || 1,
          total:
            responseData.total ||
            responseData.pagination?.total ||
            newJobs.length,
        });
      }
    } catch (error) {
      console.error('Error loading more jobs:', error);
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
    console.log('pressed:', job);
    router.push(`/job/${job.id}`); // Navigate to JobDetailScreen with job ID
  };

  // Handle favorite press
  const handleFavoritePress = async (jobId: string, isFavorited: boolean) => {
    // const {saved} = await savedJobService.toggleSaveJob(jobId)

    console.log('saved:', isFavorited);
    if (isFavorited) {
      alert.success('Thành công', 'Đã lưu công việc');
    } else {
      alert.success('', 'Đã bỏ lưu công việc');
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
        {/* User Reviews Section at the bottom with glass effect */}
        <View className="relative">
          <View className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-indigo-100/20 backdrop-blur-xs" />
          <UserReviewsSection />
        </View>

        {/* Loading indicator for pagination with modern design */}
        {loadingMore && (
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
              Đang tải thêm công việc...
            </Text>
          </View>
        )}

        {/* Bottom spacing with gradient fade */}
        <View className="h-4 bg-gradient-to-t from-purple-50/50 to-transparent" />
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20 px-6">
      {/* Decorative gradient background */}
      <View className="absolute inset-0 opacity-30">
        <View className="w-32 h-32 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full absolute top-10 left-4 opacity-20" />
        <View className="w-24 h-24 bg-gradient-to-br from-indigo-300 to-blue-300 rounded-full absolute bottom-20 right-8 opacity-20" />
      </View>

      {/* Main content */}
      <View className="relative z-10 items-center">
        {/* Icon container with gradient */}
        <View className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full items-center justify-center mb-6 shadow-soft">
          <View className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full items-center justify-center">
            <Text className="text-white text-2xl">💼</Text>
          </View>
        </View>

        {/* Title with gradient text */}
        <Text className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text mb-3 text-center">
          Không tìm thấy công việc
        </Text>

        {/* Subtitle */}
        <Text className="text-purple-500 text-base text-center leading-6 mb-6 max-w-sm">
          Hãy thử điều chỉnh tiêu chí tìm kiếm của bạn hoặc quay lại sau để tìm
          cơ hội mới
        </Text>

        {/* Decorative line */}
        <View className="w-20 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-50" />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
        <View className="flex-1 justify-center items-center">
          <View className="relative">
            <View className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-20 animate-pulse" />
            <ActivityIndicator size="large" color="#a855f7" />
          </View>
          <Text className="text-purple-700 font-semibold mt-6 text-lg animate-fade-in">
            Đang tải công việc...
          </Text>
          <Text className="text-purple-500 text-sm mt-2 animate-fade-in">
            Vui lòng đợi trong giây lát
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <FlatList
        data={jobs.slice(0, 8)}
        keyExtractor={item => item.id}
        renderItem={renderJobItem}
        ListHeaderComponent={() => (
          <View className="relative">
            {/* Decorative background elements */}
            <View className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-100/30 to-transparent" />
            <View className="absolute top-10 right-4 w-20 h-20 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full" />
            <View className="absolute top-20 left-8 w-12 h-12 bg-gradient-to-br from-indigo-300/20 to-blue-300/20 rounded-full" />

            <Header
              searchValue={searchQuery}
              onSearchChange={handleSearchChange}
              onNotificationPress={onNotificationPress}
              onMicPress={() => {
                // TODO: Implement voice search
                console.log('Voice search pressed');
              }}
              onFilterPress={() => {
                // TODO: Implement advanced filter
                console.log('Filter pressed');
              }}
            />

            {/* Top Companies Section with glass effect */}
            <View className="relative mx-2 mb-4">
              <View className="absolute inset-0 bg-white/60 backdrop-blur-xs rounded-xl" />
              <View className="relative z-10">
                <TopCompaniesSection
                  onCompanyPress={company => {
                    if (company.companySlug) {
                      router.push(`/company/${company.companySlug}`);
                    } else {
                      console.log(
                        'Company slug not available:',
                        company.companyName
                      );
                    }
                  }}
                  onSeeAllPress={() => console.log('See all companies')}
                />
              </View>
            </View>

            {/* Job Categories Section */}
            {/* <JobCategoriesSection
              onCategoryPress={(categoryId) => {
                setSelectedCategory(categoryId);
                console.log('Category pressed:', categoryId);
              }}
              onSeeAllPress={() => console.log('See all categories')}
            /> */}

            {/* Stats Section with enhanced styling */}
            <View className="relative mx-2 mb-4">
              <View className="absolute inset-0 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-xs rounded-xl shadow-soft" />
              <View className="relative z-10">
                <StatsSection />
              </View>
            </View>

            {/* Category Filter Tabs with glass effect */}
            <View className="relative mx-2 mb-4">
              <View className="absolute inset-0 bg-white/70 backdrop-blur-xs rounded-xl" />
              <View className="relative z-10 p-1">
                <CategoryFilter
                  selectedCategoryId={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                />
              </View>
            </View>

            {/* Job Match Section with gradient background */}
            <View className="relative mx-2 mb-6">
              <View className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-indigo-100/50 to-blue-100/50 backdrop-blur-xs rounded-xl shadow-soft" />
              <View className="relative z-10">
                <JobMatchSection onSeeAllPress={onSeeAllPress} />
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#a855f7', '#6366f1', '#3b82f6']}
            tintColor="#a855f7"
            progressBackgroundColor="#f3e8ff"
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

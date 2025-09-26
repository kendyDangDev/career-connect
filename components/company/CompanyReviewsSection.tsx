import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import CompanyReviewCard from './CompanyReviewCard';
import AddReviewModal from './AddReviewModal';
import ReviewStatistics from './ReviewStatistics';
import reviewService, { 
  CompanyReview, 
  ReviewStatistics as ReviewStats,
  CreateReviewDto 
} from '../../services/reviewService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAlert } from '@/contexts/AlertContext';

interface CompanyReviewsSectionProps {
  companyId: string;
  companySlug: string;
  companyName: string;
}

type FilterType = 'all' | 'CURRENT' | 'FORMER';
type SortType = 'createdAt' | 'rating';

const CompanyReviewsSection: React.FC<CompanyReviewsSectionProps> = ({
  companyId,
  companySlug,
  companyName
}) => {
  const router = useRouter();
  const alert = useAlert();
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [statistics, setStatistics] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedSort, setSelectedSort] = useState<SortType>('createdAt');
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Get current user ID on mount
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [selectedFilter, selectedSort]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setCurrentPage(1);
    
    try {
      // Fetch reviews
      const reviewsResponse = await reviewService.getCompanyReviews(companySlug, {
        page: 1,
        limit: 10,
        sortBy: selectedSort,
        sortOrder: selectedSort === 'rating' ? 'desc' : 'desc',
        employmentStatus: selectedFilter === 'all' ? undefined : selectedFilter
      });

      if (reviewsResponse.success && reviewsResponse.data) {
        setReviews(reviewsResponse.data.reviews);
        setStatistics(reviewsResponse.data.statistics || null);
        setHasMore(reviewsResponse.data.hasMore);
        
        // Check if current user has reviewed
        if (currentUserId) {
          const userReview = reviewsResponse.data.reviews.find(
            r => r.reviewerId === currentUserId
          );
          setUserHasReviewed(!!userReview);
        }
      }

      // Fetch statistics if not included in reviews response
      if (!reviewsResponse.data?.statistics) {
        const statsResponse = await reviewService.getCompanyStatistics(companySlug);
        if (statsResponse.success && statsResponse.data) {
          setStatistics(statsResponse.data.statistics);
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      alert.error('Lỗi', 'Không thể tải đánh giá. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreReviews = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    
    try {
      const nextPage = currentPage + 1;
      const response = await reviewService.getCompanyReviews(companySlug, {
        page: nextPage,
        limit: 10,
        sortBy: selectedSort,
        sortOrder: selectedSort === 'rating' ? 'desc' : 'desc',
        employmentStatus: selectedFilter === 'all' ? undefined : selectedFilter
      });

      if (response.success && response.data) {
        setReviews(prev => [...prev, ...response.data!.reviews]);
        setCurrentPage(nextPage);
        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadInitialData();
    setIsRefreshing(false);
  }, [selectedFilter, selectedSort]);

  const handleAddReview = () => {
    if (!currentUserId) {
      alert.warning(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để viết đánh giá',
        () => router.push('/(auth)/login')
      );
      return;
    }

    if (userHasReviewed) {
      alert.info(
        'Thông báo',
        'Bạn đã đánh giá công ty này rồi. Mỗi người chỉ được đánh giá một lần.'
      );
      return;
    }

    setShowAddReviewModal(true);
  };

  const handleSubmitReview = async (reviewData: CreateReviewDto) => {
    try {
      const response = await reviewService.createReview({
        ...reviewData,
        companyId
      });

      if (response.success) {
        alert.success(
          'Thành công',
          'Đánh giá của bạn đã được gửi và đang chờ phê duyệt.',
          () => handleRefresh()
        );
        setShowAddReviewModal(false);
        setUserHasReviewed(true);
      } else {
        alert.error('Lỗi', response.message || 'Không thể gửi đánh giá');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert.error('Lỗi', 'Đã xảy ra lỗi khi gửi đánh giá');
    }
  };

  const handleEditReview = (reviewId: string) => {
    // Navigate to edit review screen or show edit modal
    alert.info('Thông báo', 'Tính năng chỉnh sửa đánh giá đang được phát triển');
  };

  const handleDeleteReview = (reviewId: string) => {
    alert.confirm(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa đánh giá này?',
      async () => {
        try {
          const response = await reviewService.deleteReview(reviewId);
          if (response.success) {
            alert.success('Thành công', 'Đã xóa đánh giá');
            handleRefresh();
            setUserHasReviewed(false);
          } else {
            alert.error('Lỗi', response.message || 'Không thể xóa đánh giá');
          }
        } catch (error) {
          console.error('Error deleting review:', error);
          alert.error('Lỗi', 'Đã xảy ra lỗi khi xóa đánh giá');
        }
      }
    );
  };

  const renderFilterButton = (filter: FilterType, label: string, icon: string) => (
    <TouchableOpacity
      onPress={() => setSelectedFilter(filter)}
      className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
        selectedFilter === filter
          ? 'bg-blue-600'
          : 'bg-white border border-gray-300'
      }`}
    >
      <MaterialIcons 
        name={icon as any} 
        size={16} 
        color={selectedFilter === filter ? '#FFFFFF' : '#6B7280'} 
      />
      <Text
        className={`ml-2 text-sm font-medium ${
          selectedFilter === filter ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = () => (
    <TouchableOpacity
      onPress={() => {
        setSelectedSort(selectedSort === 'createdAt' ? 'rating' : 'createdAt');
      }}
      className="flex-row items-center px-4 py-2 rounded-full bg-white border border-gray-300"
    >
      <MaterialIcons name="sort" size={16} color="#6B7280" />
      <Text className="ml-2 text-sm font-medium text-gray-700">
        {selectedSort === 'createdAt' ? 'Mới nhất' : 'Đánh giá cao'}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="bg-white rounded-2xl p-6 mb-4 mx-4">
        <View className="flex-row items-center mb-4">
          <Ionicons name="star" size={24} color="#2563EB" />
          <Text className="text-lg font-bold text-gray-900 ml-2">
            Đánh giá công ty
          </Text>
        </View>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <View className="bg-white rounded-2xl mb-4 mx-4 overflow-hidden">
        {/* Section Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center">
              <Ionicons name="star" size={20} color="#2563EB" />
            </View>
            <View className="ml-3">
              <Text className="text-lg font-bold text-gray-900">
                Đánh giá công ty
              </Text>
              <Text className="text-sm text-gray-600">
                {statistics?.totalReviews || 0} đánh giá
              </Text>
            </View>
          </View>
          
          {!userHasReviewed && (
            <TouchableOpacity
              onPress={handleAddReview}
              className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center"
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
              <Text className="text-white font-medium ml-1">Viết đánh giá</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Statistics */}
        {statistics && (
          <ReviewStatistics 
            statistics={statistics}
            totalReviews={reviews.length}
          />
        )}

        {/* Filters */}
        <View className="p-4 border-t border-gray-100">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {renderFilterButton('all', 'Tất cả', 'groups')}
            {renderFilterButton('CURRENT', 'NV hiện tại', 'person')}
            {renderFilterButton('FORMER', 'Cựu NV', 'person-outline')}
            {renderSortButton()}
          </ScrollView>
        </View>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <View className="p-4">
            {reviews.map((review, index) => (
              <View key={review.id}>
                <CompanyReviewCard
                  review={review}
                  isOwner={review.reviewerId === currentUserId}
                  onEdit={() => handleEditReview(review.id)}
                  onDelete={() => handleDeleteReview(review.id)}
                />
                {index < reviews.length - 1 && (
                  <View className="h-px bg-gray-100 my-2" />
                )}
              </View>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <TouchableOpacity
                onPress={loadMoreReviews}
                disabled={isLoadingMore}
                className="mt-4 py-3 bg-gray-50 rounded-xl items-center"
              >
                {isLoadingMore ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text className="text-blue-600 font-medium">
                    Xem thêm đánh giá
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View className="p-8 items-center">
            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
              <MaterialIcons name="rate-review" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-semibold text-base mb-1">
              Chưa có đánh giá
            </Text>
            <Text className="text-gray-600 text-sm text-center mb-4">
              Hãy là người đầu tiên đánh giá về {companyName}
            </Text>
            {!userHasReviewed && (
              <TouchableOpacity
                onPress={handleAddReview}
                className="bg-blue-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-medium">Viết đánh giá đầu tiên</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Add Review Modal */}
      <AddReviewModal
        visible={showAddReviewModal}
        onClose={() => setShowAddReviewModal(false)}
        onSubmit={handleSubmitReview}
        companyName={companyName}
      />
    </>
  );
};

export default CompanyReviewsSection;
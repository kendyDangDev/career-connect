import React from 'react';
import {
  View,
  Text
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ReviewStatistics as ReviewStats } from '../../services/reviewService';

interface ReviewStatisticsProps {
  statistics: ReviewStats;
  totalReviews: number;
}

const ReviewStatistics: React.FC<ReviewStatisticsProps> = ({
  statistics,
  totalReviews
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color="#FFC107" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFC107" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#D1D5DB" />
        );
      }
    }
    return stars;
  };

  const getRatingPercentage = (count: number) => {
    if (statistics.totalReviews === 0) return 0;
    return (count / statistics.totalReviews) * 100;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  return (
    <View className="p-4">
      {/* Main Stats Row */}
      <View className="flex-row items-center justify-between mb-6">
        {/* Average Rating */}
        <View className="flex-1 items-center">
          <Text className="text-3xl font-bold text-gray-900">
            {statistics.averageRating.toFixed(1)}
          </Text>
          <View className="flex-row mt-1">
            {renderStars(statistics.averageRating)}
          </View>
          <Text className="text-sm text-gray-600 mt-1">
            {statistics.totalReviews} đánh giá
          </Text>
        </View>

        {/* Divider */}
        <View className="w-px h-16 bg-gray-200 mx-4" />

        {/* Recommendation Rate */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center">
            <MaterialIcons name="thumb-up" size={24} color="#10B981" />
            <Text className="text-2xl font-bold text-gray-900 ml-2">
              {formatPercentage(statistics.recommendationRate)}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mt-1">
            Đề xuất cho bạn bè
          </Text>
        </View>
      </View>

      {/* Rating Breakdown */}
      <View className="border-t border-gray-100 pt-4">
        <Text className="text-sm font-semibold text-gray-700 mb-3">
          Phân bổ đánh giá
        </Text>
        
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = statistics.ratingDistribution[rating] || 0;
          const percentage = getRatingPercentage(count);
          
          return (
            <View key={rating} className="flex-row items-center mb-2">
              <View className="flex-row items-center w-12">
                <Text className="text-sm text-gray-600 mr-1">{rating}</Text>
                <Ionicons name="star" size={12} color="#FFC107" />
              </View>
              
              <View className="flex-1 mx-3">
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </View>
              </View>
              
              <Text className="text-xs text-gray-600 w-12 text-right">
                {count}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Additional Stats Grid */}
      <View className="border-t border-gray-100 pt-4 mt-4">
        <View className="flex-row flex-wrap">
          {/* Current Employees */}
          <View className="w-1/2 pr-2 mb-3">
            <View className="bg-blue-50 p-3 rounded-xl">
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="person" size={16} color="#2563EB" />
                <Text className="text-xs text-gray-600 ml-1">NV hiện tại</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                {statistics.byEmploymentStatus?.CURRENT || 0}
              </Text>
            </View>
          </View>

          {/* Former Employees */}
          <View className="w-1/2 pl-2 mb-3">
            <View className="bg-orange-50 p-3 rounded-xl">
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="person-outline" size={16} color="#EA580C" />
                <Text className="text-xs text-gray-600 ml-1">Cựu NV</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                {statistics.byEmploymentStatus?.FORMER || 0}
              </Text>
            </View>
          </View>

          {/* Average Work-Life Balance */}
          <View className="w-1/2 pr-2">
            <View className="bg-green-50 p-3 rounded-xl">
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="balance" size={16} color="#10B981" />
                <Text className="text-xs text-gray-600 ml-1">Cân bằng</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                {statistics.averageWorkLifeBalance?.toFixed(1) || '-'}
              </Text>
            </View>
          </View>

          {/* Average Salary & Benefits */}
          <View className="w-1/2 pl-2">
            <View className="bg-purple-50 p-3 rounded-xl">
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="attach-money" size={16} color="#7C3AED" />
                <Text className="text-xs text-gray-600 ml-1">Lương & PL</Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                {statistics.averageSalaryBenefit?.toFixed(1) || '-'}
              </Text>
            </View>
          </View>
        </View>
      </View>

    </View>
  );
};

export default ReviewStatistics;
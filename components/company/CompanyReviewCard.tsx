import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { CompanyReview } from '../../services/reviewService';

interface CompanyReviewCardProps {
  review: CompanyReview;
  onPress?: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CompanyReviewCard: React.FC<CompanyReviewCardProps> = ({ 
  review, 
  onPress,
  isOwner = false,
  onEdit,
  onDelete
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

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

  const renderRatingBar = (label: string, rating?: number) => {
    if (!rating) return null;
    
    const percentage = (rating / 5) * 100;

    return (
      <View className="mb-3">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-xs text-gray-600">{label}</Text>
          <Text className="text-xs font-medium text-gray-900">{rating.toFixed(1)}</Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View 
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>
    );
  };

  const getEmploymentStatusBadge = () => {
    if (review.employmentStatus === 'CURRENT') {
      return (
        <View className="bg-green-100 px-2 py-1 rounded-md">
          <Text className="text-xs font-medium text-green-800">Nhân viên hiện tại</Text>
        </View>
      );
    } else {
      return (
        <View className="bg-gray-100 px-2 py-1 rounded-md">
          <Text className="text-xs font-medium text-gray-700">Cựu nhân viên</Text>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100"
    >
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            {/* Reviewer Info */}
            <View className="flex-row items-center mb-2">
              {review.reviewer?.avatarUrl ? (
                <Image
                  source={{ uri: review.reviewer.avatarUrl }}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                  <Ionicons name="person" size={20} color="#6B7280" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">
                  {review.reviewer?.isAnonymous ? 'Ẩn danh' : review.reviewer?.displayName}
                </Text>
                <View className="flex-row items-center mt-1">
                  {review.positionTitle && (
                    <Text className="text-xs text-gray-600 mr-2">
                      {review.positionTitle}
                    </Text>
                  )}
                  {review.employmentLength && (
                    <Text className="text-xs text-gray-500">
                      • {review.employmentLength}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Rating and Date */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="flex-row mr-2">
                  {renderStars(review.rating)}
                </View>
                <Text className="text-sm font-bold text-gray-900">
                  {review.rating.toFixed(1)}
                </Text>
              </View>
              {getEmploymentStatusBadge()}
            </View>
          </View>

          {/* Actions Menu for Owner */}
          {isOwner && (
            <View className="flex-row items-center ml-2">
              <TouchableOpacity 
                onPress={onEdit}
                className="p-2"
              >
                <MaterialIcons name="edit" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={onDelete}
                className="p-2"
              >
                <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Review Title */}
        <Text className="text-base font-semibold text-gray-900 mt-3">
          {review.title}
        </Text>

        {/* Review Date */}
        <Text className="text-xs text-gray-500 mt-1">
          {format(new Date(review.createdAt), 'dd/MM/yyyy')}
        </Text>
      </View>

      {/* Review Content */}
      <View className="p-4">
        {/* Review Text */}
        <Text className="text-sm text-gray-700 leading-5 mb-4">
          {review.reviewText}
        </Text>

        {/* Pros and Cons */}
        {review.pros && (
          <View className="mb-3">
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-2">
                <Ionicons name="add" size={16} color="#10B981" />
              </View>
              <Text className="text-sm font-semibold text-gray-900">Ưu điểm</Text>
            </View>
            <Text className="text-sm text-gray-700 ml-8">
              {review.pros}
            </Text>
          </View>
        )}

        {review.cons && (
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 rounded-full bg-red-100 items-center justify-center mr-2">
                <Ionicons name="remove" size={16} color="#EF4444" />
              </View>
              <Text className="text-sm font-semibold text-gray-900">Nhược điểm</Text>
            </View>
            <Text className="text-sm text-gray-700 ml-8">
              {review.cons}
            </Text>
          </View>
        )}

        {/* Detailed Ratings */}
        {(review.workLifeBalanceRating || review.salaryBenefitRating || 
          review.managementRating || review.cultureRating) && (
          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="text-sm font-semibold text-gray-900 mb-3">
              Đánh giá chi tiết
            </Text>
            {renderRatingBar('Cân bằng công việc - cuộc sống', review.workLifeBalanceRating)}
            {renderRatingBar('Lương thưởng & Phúc lợi', review.salaryBenefitRating)}
            {renderRatingBar('Quản lý', review.managementRating)}
            {renderRatingBar('Văn hóa công ty', review.cultureRating)}
          </View>
        )}

        {/* Approval Status Badge (if not approved) */}
        {!review.isApproved && (
          <View className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#F59E0B" />
            <Text className="text-xs text-yellow-800 ml-2">
              Đang chờ phê duyệt
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CompanyReviewCard;
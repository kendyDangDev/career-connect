import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Star, Quote } from 'lucide-react-native';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  company: string;
  rating: number;
  reviewText: string;
  date: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    userName: 'Nguyen Van A',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    userRole: 'Software Developer',
    company: 'FPT Software',
    rating: 5,
    reviewText: 'Career Connect helped me find my dream job! The application process was smooth and I got multiple offers within weeks.',
    date: '2 weeks ago',
  },
  {
    id: '2',
    userName: 'Tran Thi B',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    userRole: 'Marketing Manager',
    company: 'Shopee Vietnam',
    rating: 5,
    reviewText: 'Excellent platform with genuine job listings. The job matching algorithm really works! Highly recommended.',
    date: '1 month ago',
  },
  {
    id: '3',
    userName: 'Le Van C',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    userRole: 'UI/UX Designer',
    company: 'VNG Corporation',
    rating: 4,
    reviewText: 'Great variety of jobs and easy to use interface. Found my current position through this app.',
    date: '1 month ago',
  },
];

const UserReviewsSection: React.FC = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color="#FBBF24"
        fill={index < rating ? "#FBBF24" : "transparent"}
      />
    ));
  };

  return (
    <View className="py-6">
      {/* Section Header */}
      <View className="px-4 mb-4">
        <Text className="text-xl font-bold text-gray-900 mb-1">
          Success Stories
        </Text>
        <Text className="text-sm text-gray-500">
          What our users say about Career Connect
        </Text>
      </View>

      {/* Reviews Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {mockReviews.map((review) => (
          <View
            key={review.id}
            className="bg-white rounded-2xl p-5 mr-4 shadow-sm border border-gray-100"
            style={{ width: 300 }}
          >
            {/* Quote Icon */}
            <View className="absolute top-3 right-3">
              <Quote size={24} color="#E5E7EB" />
            </View>

            {/* Review Content */}
            <Text className="text-gray-700 text-sm leading-5 mb-4">
              "{review.reviewText}"
            </Text>

            {/* Rating */}
            <View className="flex-row mb-3">
              {renderStars(review.rating)}
            </View>

            {/* User Info */}
            <View className="flex-row items-center">
              <Image
                source={{ uri: review.userAvatar }}
                className="w-10 h-10 rounded-full mr-3"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-sm">
                  {review.userName}
                </Text>
                <Text className="text-xs text-gray-500">
                  {review.userRole} at {review.company}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {review.date}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default UserReviewsSection;

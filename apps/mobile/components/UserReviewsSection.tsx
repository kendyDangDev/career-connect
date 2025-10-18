import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { Star, Quote } from "lucide-react-native";

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
    id: "1",
    userName: "Nguyen Van Anh",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    userRole: "Software Developer",
    company: "FPT Software",
    rating: 5,
    reviewText:
      "Career Connect helped me find my dream job! The application process was smooth and I got multiple offers within weeks.",
    date: "2 weeks ago",
  },
  {
    id: "2",
    userName: "Tran Thi Bich",
    userAvatar: "https://i.pravatar.cc/150?img=2",
    userRole: "Marketing Manager",
    company: "Shopee Vietnam",
    rating: 5,
    reviewText:
      "Excellent platform with genuine job listings. The job matching algorithm really works! Highly recommended.",
    date: "1 month ago",
  },
  {
    id: "3",
    userName: "Le Van Cuong",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    userRole: "UI/UX Designer",
    company: "VNG Corporation",
    rating: 4,
    reviewText:
      "Great variety of jobs and easy to use interface. Found my current position through this app.",
    date: "1 month ago",
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
    <View className="py-8">
      {/* Section Header with Gradient */}
      <View className="px-4 mb-6">
        <Text className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text mb-2">
          Câu chuyện thành công
        </Text>
        <Text className="text-purple-500 font-medium">
          Trải nghiệm của người dùng với Career Connect
        </Text>
        <View className="w-20 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mt-2" />
      </View>

      {/* Reviews Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {mockReviews.map((review, index) => (
          <View
            key={review.id}
            className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 mr-4 shadow-soft border border-purple-100/50 overflow-hidden"
            style={{ width: 320 }}
          >
            {/* Gradient Background Elements */}
            <View className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100/30 to-transparent rounded-bl-full" />
            <View className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-tr-full" />

            {/* Review Content */}
            <Text className="text-gray-700 text-base leading-6 mb-5 relative z-0 font-medium">
              &ldquo;{review.reviewText}&rdquo;
            </Text>

            {/* Quote Icon with Gradient - highest z-index */}
            <View className="absolute top-4 right-4 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full p-2 z-20 shadow-lg">
              <Quote size={20} color="#a855f7" />
            </View>

            {/* Rating */}
            <View className="flex-row mb-3 relative z-0">
              {renderStars(review.rating)}
            </View>

            {/* User Info with Enhanced Design */}
            <View className="flex-row items-center relative z-0">
              <View className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 p-0.5 mr-3">
                <Image
                  source={{ uri: review.userAvatar }}
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-purple-700 text-base">
                  {review.userName}
                </Text>
                <Text className="text-sm text-purple-500 font-medium">
                  {review.userRole}
                </Text>
                <Text className="text-xs text-indigo-400 font-medium">
                  {review.company} • {review.date}
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

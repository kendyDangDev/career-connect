import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Users,
  Briefcase,
  Star,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const { width: screenWidth } = Dimensions.get('window');

interface CompanyHeaderProps {
  company: {
    companyName: string;
    logoUrl: string;
    coverImageUrl: string;
    verificationStatus: string;
    industry: {
      name: string;
    };
    companySize: string;
    followerCount: number;
    activeJobCount: number;
    reviewStats?: {
      averageRating: number;
      totalReviews: number;
    };
  };
  isFollowing: boolean;
  onBackPress: () => void;
  onFollowPress: () => void;
  onWebsitePress: () => void;
}

const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  company,
  isFollowing,
  onBackPress,
  onFollowPress,
  onWebsitePress,
}) => {
  const getCompanySizeLabel = (size: string) => {
    const sizeMap: { [key: string]: string } = {
      STARTUP_1_10: '1-10 employees',
      SMALL_11_50: '11-50 employees',
      MEDIUM_51_200: '51-200 employees',
      LARGE_201_500: '201-500 employees',
      ENTERPRISE_500_PLUS: '500+ employees',
    };
    return sizeMap[size] || size;
  };

  return (
    <View className="relative">
      {/* Cover Image */}
      <View className="relative h-48">
        <Image
          source={{
            uri:
              company.coverImageUrl ||
              'https://psd.design/wp-content/uploads/2020/12/Business-modern-Facebook-cover-template.jpg',
          }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        {/* <LinearGradient
          colors={["transparent", "#3b82f6"]}
          className="absolute inset-0"
        /> */}
        {/* <Image
          source={{ uri: company.coverImageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        /> */}

        {/* Back Button */}
        <TouchableOpacity
          onPress={onBackPress}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center"
          style={{ elevation: 5 }}
        >
          <ArrowLeft size={20} color="#1F2937" />
        </TouchableOpacity>

        {/* Website Button */}
        <TouchableOpacity
          onPress={onWebsitePress}
          className="absolute top-12 right-4 w-10 h-10 rounded-full bg-white/90 items-center justify-center"
          style={{ elevation: 5 }}
        >
          <ExternalLink size={18} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Company Info Section */}
      <View className="bg-white px-4 pb-4">
        {/* Logo and Name Row */}
        <View className="flex-row items-end -mt-10 mb-4">
          <View className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg">
            <Image
              source={{ uri: company.logoUrl }}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
          </View>

          <View className="flex-1 ml-4 mb-2">
            <View className="flex-row items-center">
              <Text className="text-xl font-bold text-gray-900">
                {company.companyName}
              </Text>
              {company.verificationStatus === 'VERIFIED' && (
                <CheckCircle size={22} color="#10B981" />
              )}
            </View>
            <Text className="text-sm text-gray-600 mt-1">
              {company.industry.name}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between items-center mb-4 px-2">
          <View className="items-center">
            <View className="flex-row items-center">
              <Users size={16} color="#6B7280" />
              <Text className="text-lg font-semibold text-gray-900 ml-1">
                {company.followerCount.toLocaleString()}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">Followers</Text>
          </View>

          <View className="items-center">
            <View className="flex-row items-center">
              <Briefcase size={16} color="#6B7280" />
              <Text className="text-lg font-semibold text-gray-900 ml-1">
                {company.activeJobCount}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">Active Jobs</Text>
          </View>

          {company.reviewStats && (
            <View className="items-center">
              <View className="flex-row items-center">
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-lg font-semibold text-gray-900 ml-1">
                  {company.reviewStats.averageRating.toFixed(1)}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                {company.reviewStats.totalReviews} Reviews
              </Text>
            </View>
          )}

          <View className="items-center">
            <Text className="text-lg font-semibold text-gray-900">
              {getCompanySizeLabel(company.companySize).split(' ')[0]}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Employees</Text>
          </View>
        </View>

        {/* Follow Button */}
        <TouchableOpacity
          onPress={onFollowPress}
          className={`mx-2 py-3 rounded-xl items-center ${
            isFollowing ? 'bg-gray-100 border border-gray-300' : 'bg-blue-600'
          }`}
        >
          <Text
            className={`font-semibold ${
              isFollowing ? 'text-gray-700' : 'text-white'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow Company'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CompanyHeader;

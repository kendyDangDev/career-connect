import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import {
  ArrowLeft,
  Heart,
  Share,
  MapPin,
  Briefcase,
  Clock,
  Eye,
  Users,
} from 'lucide-react-native';
import { Job } from '../types/job';

interface JobDetailHeaderProps {
  job: Job;
  onBackPress: () => void;
  onFavoritePress?: (jobId: string, isFavorited: boolean) => void;
  onSharePress?: (job: Job) => void;
}

const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  job,
  onBackPress,
  onFavoritePress,
  onSharePress,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);

  // Safe check for job data
  if (!job || !job.company) {
    return null;
  }

  const formatSalary = (
    min: number,
    max: number,
    currency: string,
    negotiable: boolean
  ) => {
    if (negotiable) return 'Thỏa thuận';

    if (currency === 'VND') {
      const minFormatted =
        min >= 1000000
          ? `${(min / 1000000).toFixed(0)}`
          : `${(min / 1000).toFixed(0)}K`;
      const maxFormatted =
        max >= 1000000
          ? `${(max / 1000000).toFixed(0)}`
          : `${(max / 1000).toFixed(0)}K`;
      return `${minFormatted} - ${maxFormatted} Triệu/Tháng`;
    }

    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(0)}M`;
      } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}K`;
      }
      return `$${num}`;
    };

    return `${formatNumber(min)} - ${formatNumber(max)}/month`;
  };

  const getJobTypeDisplay = (jobType: string, workLocationType: string) => {
    const typeMap: { [key: string]: string } = {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      CONTRACT: 'Contract',
      INTERNSHIP: 'Internship',
    };

    const locationMap: { [key: string]: string } = {
      REMOTE: 'Remote',
      ONSITE: 'Onsite',
      HYBRID: 'Hybrid',
    };

    return `${typeMap[jobType] || jobType} • ${locationMap[workLocationType] || workLocationType}`;
  };

  const getTimeAgo = (publishedAt: string) => {
    const now = new Date();
    const publishedDate = new Date(publishedAt);
    const diffInHours = Math.floor(
      (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays}d ago`;
      } else {
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths}mo ago`;
      }
    }
  };

  const handleFavoritePress = () => {
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    onFavoritePress?.(job.id, newFavoriteState);
  };

  const handleSharePress = () => {
    onSharePress?.(job);
  };

  return (
    <View className="bg-white">
      {/* Top Navigation Bar */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-4">
        <TouchableOpacity
          onPress={onBackPress}
          className="p-2 -ml-2"
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleFavoritePress}
            className="p-2 mr-2"
            activeOpacity={0.7}
          >
            <Heart
              size={24}
              color={isFavorited ? '#EF4444' : '#6B7280'}
              fill={isFavorited ? '#EF4444' : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSharePress}
            className="p-2"
            activeOpacity={0.7}
          >
            <Share size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-4 pb-6">
        {/* Company Logo and Basic Info */}
        <View className="flex-row items-start mb-4">
          <View className="w-16 h-16 rounded-xl bg-gray-100 justify-center items-center mr-4">
            {job.company.logoUrl ? (
              <Image
                source={{ uri: job.company?.logoUrl }}
                className="w-14 h-14 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500 font-bold text-xl">
                {job.company.companyName?.charAt(0)?.toUpperCase() || 'C'}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-gray-600 font-medium mb-1">
              {job.company.companyName || 'Unknown Company'}
            </Text>
            {job.company.verificationStatus === 'VERIFIED' && (
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-600 text-sm font-medium">
                  Verified Company
                </Text>
              </View>
            )}
            <View className="flex-row items-center">
              <MapPin size={14} color="#6B7280" />
              <Text className="text-gray-500 text-sm ml-1">
                {job.locationCity || 'Unknown City'},{' '}
                {job.locationProvince || 'Unknown Province'}
              </Text>
            </View>
          </View>
        </View>

        {/* Job Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-3">
          {job.title || 'Untitled Job'}
        </Text>

        {/* Salary */}
        <Text className="text-purple-600 font-bold text-xl mb-4">
          {formatSalary(
            job.salaryMin,
            job.salaryMax,
            job.currency,
            job.salaryNegotiable
          )}
        </Text>

        {/* Job Details Badges */}
        <View className="flex-row flex-wrap items-center mb-4">
          <View className="bg-purple-50 px-3 py-2 rounded-full mr-2 mb-2">
            <Text className="text-purple-600 text-sm font-medium">
              {getJobTypeDisplay(job.jobType, job.workLocationType)}
            </Text>
          </View>

          <View className="bg-gray-100 px-3 py-2 rounded-full mr-2 mb-2">
            <Text className="text-gray-600 text-sm font-medium">
              {job.experienceLevel}
            </Text>
          </View>

          {job.urgent && (
            <View className="bg-red-50 px-3 py-2 rounded-full mr-2 mb-2">
              <Text className="text-red-600 text-sm font-bold">Tuyển gấp</Text>
            </View>
          )}

          {job.featured && (
            <View className="bg-purple-50 px-3 py-2 rounded-full mr-2 mb-2">
              <Text className="text-purple-600 text-sm font-bold">Nổi bật</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
          <View className="flex-row items-center">
            <Clock size={16} color="#6B7280" />
            <Text className="text-gray-500 text-sm ml-1">
              Posted {getTimeAgo(job.createdAt)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Eye size={16} color="#6B7280" />
            <Text className="text-gray-500 text-sm ml-1">
              {job.viewCount} views
            </Text>
          </View>

          <View className="flex-row items-center">
            <Users size={16} color="#6B7280" />
            <Text className="text-gray-500 text-sm ml-1">
              {job.applicationCount} applications
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default JobDetailHeader;

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  Building2,
  MapPin,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  X,
} from "lucide-react-native";
import { router } from "expo-router";
import type { CompanyFollower } from "@/types/companyFollower.types";
import companyFollowerService from "@/services/companyFollowerService";
import { useAlert } from "@/contexts/AlertContext";

interface CompanyFollowerCardProps {
  follower: CompanyFollower;
  onUnfollow?: (companyId: string) => void;
}

export default function CompanyFollowerCard({
  follower,
  onUnfollow,
}: CompanyFollowerCardProps) {
  const [isUnfollowing, setIsUnfollowing] = useState(false);
  const { company } = follower;

  const alert = useAlert();

  const handleUnfollow = async () => {
    if (!onUnfollow) return;
    
    // Show confirmation dialog
    alert.confirm(
      "Bỏ theo dõi công ty",
      `Bạn có chắc chắn muốn bỏ theo dõi ${company.companyName}?`,
      async () => {
        setIsUnfollowing(true);
        try {
          await companyFollowerService.unfollowCompany(company.id);
          onUnfollow(company.id);
          
          // Show success feedback
          alert.success("Thành công", `Đã bỏ theo dõi ${company.companyName}`);
        } catch (error: any) {
          console.error("Error unfollowing company:", error);
          
          // Show error message
          let errorMessage = "Không thể bỏ theo dõi công ty";
          
          if (error.message?.includes("network") || error.message?.includes("fetch")) {
            errorMessage = "Không có kết nối mạng, vui lòng thử lại";
          } else if (error.status === 401) {
            errorMessage = "Phiên đăng nhập đã hết hạn";
          } else if (error.status === 404) {
            errorMessage = "Công ty không tồn tại hoặc bạn chưa theo dõi công ty này";
          }
          
          alert.error("Lỗi", errorMessage, () => {
            // Optionally retry
            alert.confirm(
              "Thử lại?",
              "Bạn có muốn thử bỏ theo dõi lại không?",
              () => handleUnfollow()
            );
          });
        } finally {
          setIsUnfollowing(false);
        }
      }
    );
  };

  const handleCardPress = () => {
    // Navigate to company detail screen
    router.push(`/company/${company.companySlug}`);
  };

  const getCompanySizeLabel = (size?: string | null) => {
    const sizeMap: Record<string, string> = {
      STARTUP: "1-10",
      SMALL: "11-50",
      MEDIUM: "51-200",
      LARGE: "201-500",
      ENTERPRISE: "500+",
    };
    return size ? sizeMap[size] || size : "N/A";
  };

  const getVerificationIcon = () => {
    switch (company.verificationStatus) {
      case "VERIFIED":
        return <CheckCircle size={16} color="#10B981" />;
      case "PENDING":
        return <Clock size={16} color="#F59E0B" />;
      case "REJECTED":
        return <X size={16} color="#EF4444" />;
      default:
        return null;
    }
  };

  const formatFollowedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Hôm nay";
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
    return `${Math.floor(diffInDays / 365)} năm trước`;
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl mb-3 shadow-sm border border-gray-100"
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      <View className="p-4">
        {/* Header with Logo and Company Info */}
        <View className="flex-row">
          {/* Company Logo */}
          <View className="mr-3">
            {company.logoUrl ? (
              <Image
                source={{ uri: company.logoUrl }}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-lg bg-gray-100 justify-center items-center">
                <Building2 size={24} color="#9CA3AF" />
              </View>
            )}
          </View>

          {/* Company Details */}
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
                {company.companyName}
              </Text>
              {getVerificationIcon()}
            </View>

            {/* Industry */}
            {company.industry && (
              <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
                {company.industry.name}
              </Text>
            )}

            {/* Location */}
            {(company.city || company.province) && (
              <View className="flex-row items-center">
                <MapPin size={14} color="#9CA3AF" />
                <Text className="text-sm text-gray-500 ml-1" numberOfLines={1}>
                  {[company.city, company.province]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </View>
            )}
          </View>

          {/* Unfollow Button */}
          <TouchableOpacity
            className="ml-2"
            onPress={handleUnfollow}
            disabled={isUnfollowing}
          >
            {isUnfollowing ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <View className="bg-red-50 rounded-lg p-2">
                <X size={20} color="#EF4444" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Description */}
        {company.description && (
          <Text className="text-sm text-gray-600 mt-3 leading-5" numberOfLines={2}>
            {company.description}
          </Text>
        )}

        {/* Stats */}
        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
          {/* Company Size */}
          <View className="flex-row items-center flex-1">
            <Users size={14} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 ml-1">
              {getCompanySizeLabel(company.companySize)} nhân viên
            </Text>
          </View>

          {/* Job Count */}
          {company._count?.jobs !== undefined && (
            <View className="flex-row items-center flex-1">
              <Briefcase size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 ml-1">
                {company._count.jobs} việc làm
              </Text>
            </View>
          )}

          {/* Followers Count */}
          {company._count?.companyFollowers !== undefined && (
            <View className="flex-row items-center">
              <Users size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 ml-1">
                {company._count.companyFollowers} theo dõi
              </Text>
            </View>
          )}
        </View>

        {/* Followed Date */}
        <View className="mt-2">
          <Text className="text-xs text-gray-400">
            Đã theo dõi {formatFollowedDate(follower.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
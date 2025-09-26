import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Eye,
  Users,
  Calendar,
  Building2,
  Home,
  Monitor,
  Hash,
} from "lucide-react-native";
import { JobView } from "@/types/jobView.types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface JobViewCardProps {
  jobView: JobView;
  onPress: () => void;
}

const JobViewCard: React.FC<JobViewCardProps> = ({ jobView, onPress }) => {
  const { job, viewedAt } = jobView;

  // Format salary range
  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Thương lượng";
    if (!max) return `Từ ${formatMoney(min!)}`;
    if (!min) return `Đến ${formatMoney(max)}`;
    return `${formatMoney(min)} - ${formatMoney(max)}`;
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu`;
    }
    return `${(amount / 1000).toFixed(0)}k`;
  };

  // Format job type label
  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL_TIME: "Toàn thời gian",
      PART_TIME: "Bán thời gian",
      CONTRACT: "Hợp đồng",
      INTERNSHIP: "Thực tập",
      FREELANCE: "Freelance",
      TEMPORARY: "Tạm thời",
    };
    return labels[type] || type;
  };

  // Format work location type
  const getWorkLocationIcon = (type?: string) => {
    switch (type) {
      case "REMOTE":
        return <Monitor size={14} color="#6B7280" />;
      case "HYBRID":
        return <Home size={14} color="#6B7280" />;
      default:
        return <Building2 size={14} color="#6B7280" />;
    }
  };

  const getWorkLocationLabel = (type?: string) => {
    const labels: Record<string, string> = {
      ONSITE: "Tại văn phòng",
      REMOTE: "Làm việc từ xa",
      HYBRID: "Kết hợp",
    };
    return labels[type || "ONSITE"] || "Tại văn phòng";
  };

  // Format experience level
  const getExperienceLabel = (level?: string) => {
    const labels: Record<string, string> = {
      ENTRY: "Mới ra trường",
      MID: "2-5 năm",
      SENIOR: "5-10 năm",
      LEAD: "Trưởng nhóm",
      EXECUTIVE: "Quản lý cấp cao",
    };
    return labels[level || ""] || "";
  };

  // Check if job is expiring soon
  const isExpiringSoon = () => {
    if (!job.deadline) return false;
    const daysUntilDeadline = Math.ceil(
      (new Date(job.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysUntilDeadline <= 3 && daysUntilDeadline > 0;
  };

  const isExpired = () => {
    if (!job.deadline) return false;
    return new Date(job.deadline) < new Date();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden border border-gray-100"
    >
      {/* Card Header */}
      <View className="p-4">
        <View className="flex-row items-start">
          {/* Company Logo */}
          {job.company.logoUrl ? (
            <Image
              source={{ uri: job.company.logoUrl }}
              className="w-14 h-14 rounded-lg mr-3"
              resizeMode="cover"
            />
          ) : (
            <View className="w-14 h-14 rounded-lg bg-gray-100 mr-3 items-center justify-center">
              <Building2 size={24} color="#9CA3AF" />
            </View>
          )}

          {/* Job Info */}
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              {job.title}
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              {job.company.companyName}
            </Text>

            {/* Location and Job Type */}
            <View className="flex-row flex-wrap items-center mb-2">
              <View className="flex-row items-center mr-3 mb-1">
                <MapPin size={14} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1">
                  {job.locationCity || job.locationProvince || "Toàn quốc"}
                </Text>
              </View>

              <View className="flex-row items-center mr-3 mb-1">
                <Briefcase size={14} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1">
                  {getJobTypeLabel(job.jobType)}
                </Text>
              </View>

              {job.workLocationType && (
                <View className="flex-row items-center mb-1">
                  {getWorkLocationIcon(job.workLocationType)}
                  <Text className="text-xs text-gray-600 ml-1">
                    {getWorkLocationLabel(job.workLocationType)}
                  </Text>
                </View>
              )}
            </View>

            {/* Salary Range */}
            <View className="flex-row items-center mb-2">
              <DollarSign size={14} color="#10B981" />
              <Text className="text-sm font-medium text-emerald-600 ml-1">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </Text>
              {job.experienceLevel && (
                <>
                  <Text className="text-gray-400 mx-2">•</Text>
                  <Text className="text-xs text-gray-600">
                    {getExperienceLabel(job.experienceLevel)}
                  </Text>
                </>
              )}
            </View>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <View className="flex-row flex-wrap mb-2">
                {job.skills.slice(0, 3).map((skill, index) => (
                  <View
                    key={index}
                    className="bg-blue-50 px-2 py-1 rounded-md mr-2 mb-1"
                  >
                    <Text className="text-xs text-blue-600">{skill}</Text>
                  </View>
                ))}
                {job.skills.length > 3 && (
                  <View className="bg-gray-100 px-2 py-1 rounded-md mb-1">
                    <Text className="text-xs text-gray-600">
                      +{job.skills.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Status Tags */}
            <View className="flex-row items-center flex-wrap">
              {/* Viewed Time */}
              <View className="flex-row items-center mr-3 mb-1">
                <Clock size={12} color="#9CA3AF" />
                <Text className="text-xs text-gray-500 ml-1">
                  Đã xem{" "}
                  {formatDistanceToNow(new Date(viewedAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </Text>
              </View>

              {/* View Count */}
              {job.viewCount && (
                <View className="flex-row items-center mr-3 mb-1">
                  <Eye size={12} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500 ml-1">
                    {job.viewCount} lượt xem
                  </Text>
                </View>
              )}

              {/* Application Count */}
              {job.applicationCount !== undefined && (
                <View className="flex-row items-center mb-1">
                  <Users size={12} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500 ml-1">
                    {job.applicationCount} ứng viên
                  </Text>
                </View>
              )}
            </View>

            {/* Deadline Warning */}
            {isExpired() ? (
              <View className="flex-row items-center mt-2">
                <View className="bg-red-50 px-2 py-1 rounded-md flex-row items-center">
                  <Calendar size={12} color="#EF4444" />
                  <Text className="text-xs text-red-600 ml-1 font-medium">
                    Đã hết hạn
                  </Text>
                </View>
              </View>
            ) : isExpiringSoon() ? (
              <View className="flex-row items-center mt-2">
                <View className="bg-orange-50 px-2 py-1 rounded-md flex-row items-center">
                  <Calendar size={12} color="#F97316" />
                  <Text className="text-xs text-orange-600 ml-1 font-medium">
                    Sắp hết hạn
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Hot Job Badge */}
      {job.viewCount && job.viewCount > 200 && (
        <View className="absolute top-4 right-4 bg-red-500 px-2 py-1 rounded-md">
          <Text className="text-xs text-white font-bold">HOT</Text>
        </View>
      )}

      {/* New Job Badge */}
      {(() => {
        const daysSinceViewed = Math.floor(
          (new Date().getTime() - new Date(viewedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysSinceViewed <= 1 ? (
          <View className="absolute top-4 right-4 bg-green-500 px-2 py-1 rounded-md">
            <Text className="text-xs text-white font-bold">MỚI XEM</Text>
          </View>
        ) : null;
      })()}
    </TouchableOpacity>
  );
};

export default JobViewCard;
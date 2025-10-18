import { SavedJob } from "@/types/savedJob.types";
import {
  BookmarkX,
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
} from "lucide-react-native";
import React, { useCallback } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useAlert } from "@/contexts/AlertContext";
import jobViewService from "../services/jobViewService";

interface SavedJobCardProps {
  savedJob: SavedJob;
  onPress: () => void;
  onRemove: () => void;
}

const SavedJobCard: React.FC<SavedJobCardProps> = ({
  savedJob,
  onPress,
  onRemove,
}) => {
  const { job, createdAt } = savedJob;
  const alert = useAlert();

  const formatSalary = (min: number, max: number, currency: string): string => {
    if (currency === "VND") {
      const minFormatted =
        min >= 1000000
          ? `${(min / 1000000).toFixed(0)}`
          : `${(min / 1000).toFixed(0)}K`;
      const maxFormatted =
        max >= 1000000
          ? `${(max / 1000000).toFixed(0)} Triệu`
          : `${(max / 1000).toFixed(0)}K`;
      return `${minFormatted} - ${maxFormatted}`;
    }

    const formatter = new Intl.NumberFormat("vi-VN");
    const minFormatted = formatter.format(min / 1000000);
    const maxFormatted = formatter.format(max / 1000000);
    return `${minFormatted} - ${maxFormatted} triệu ${currency}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  const getDaysUntilDeadline = (deadline: string): number => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getJobTypeDisplay = (jobType: string, workLocationType: string) => {
    const typeMap: { [key: string]: string } = {
      FULL_TIME: "Full-time",
      PART_TIME: "Part-time",
      CONTRACT: "Contract",
      INTERNSHIP: "Internship",
    };

    const locationMap: { [key: string]: string } = {
      REMOTE: "Remote",
      ONSITE: "Onsite",
      HYBRID: "Hybrid",
    };

    return `${typeMap[jobType] || jobType} • ${locationMap[workLocationType] || workLocationType}`;
  };

  const getExperienceLevelLabel = (level: string = "ok"): string => {
    const labels: Record<string, string> = {
      ENTRY: "Entry Level",
      MID: "Middle",
      SENIOR: "Senior",
      LEAD: "Lead",
      EXECUTIVE: "Executive",
    };
    return labels[level] || level;
  };

  const handleJobView = useCallback(async () => {
    if (!job?.id) return;

    try {
      console.log("[SavedJobCard] Recording job view for:", job.id);
      await jobViewService.recordJobView(job.id);
      console.log("[SavedJobCard] Job view recorded successfully");
    } catch (error) {
      console.error("[SavedJobCard] Error recording job view:", error);
      // Don't throw error - this shouldn't block user navigation
    }
  }, [job?.id]);

  const handleCardPress = useCallback(async () => {
    // Record job view first
    await handleJobView();

    // Then call the parent's onPress handler
    onPress?.();
  }, [handleJobView, onPress]);

  const handleRemove = () => {
    alert.confirm(
      "Xóa việc làm đã lưu",
      "Bạn có chắc chắn muốn xóa việc làm này khỏi danh sách đã lưu?",
      () => onRemove()
    );
  };

  const daysUntilDeadline = getDaysUntilDeadline(job.applicationDeadline);
  const isDeadlineNear = daysUntilDeadline <= 7 && daysUntilDeadline > 0;
  const isExpired = daysUntilDeadline < 0;

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      className="bg-white rounded-2xl mx-4 mb-4 p-4 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      {/* Header with Company Logo */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-xl bg-gray-100 justify-center items-center mr-3">
            {job.company.logoUrl ? (
              <Image
                source={{ uri: job.company.logoUrl }}
                className="w-10 h-10 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500 font-semibold text-lg">
                {job.company.companyName?.charAt(0)?.toUpperCase() || "C"}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text
              className="text-lg font-semibold text-gray-900 mb-1"
              numberOfLines={2}
            >
              {job.title}
            </Text>
            <Text className="text-gray-600 text-sm font-medium">
              {job.company.companyName}
            </Text>
          </View>
        </View>
      </View>

      {/* Salary and Location */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          {job.salaryMin && job.salaryMax && (
            <View className="border border-primary-500 px-3 py-1.5 rounded-full mr-2">
              <Text className="text-primary-600 text-sm font-medium">
                {job.salaryNegotiable
                  ? "Thương lượng"
                  : formatSalary(job.salaryMin, job.salaryMax, job.currency)}
              </Text>
            </View>
          )}

          <View className="bg-gray-200 px-3 py-1.5 rounded-full flex-row items-center">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-gray-600 text-sm font-medium ml-1">
              {job.locationCity}
            </Text>
          </View>
        </View>
      </View>

      {/* Job Details Badges */}
      <View className="flex-row items-center flex-wrap mb-3">
        {/* Job Type Badge */}
        <View className="bg-blue-50 px-3 py-1.5 rounded-full mr-2 mb-2">
          <Text className="text-blue-600 text-xs font-medium">
            {getJobTypeDisplay(job.jobType, job.workLocationType)}
          </Text>
        </View>

        {/* Experience Level Badge */}
        <View className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 mb-2">
          <Text className="text-gray-600 text-xs font-medium">
            {getExperienceLevelLabel(job.experienceLevel)}
          </Text>
        </View>

        {/* Feature Tags */}
        {job.featured && (
          <View className="bg-purple-50 px-3 py-1.5 rounded-full mr-2 mb-2">
            <Text className="text-purple-600 text-xs font-medium">Nổi bật</Text>
          </View>
        )}
        {job.urgent && (
          <View className="bg-red-50 px-3 py-1.5 rounded-full mr-2 mb-2">
            <Text className="text-red-600 text-xs font-bold">Tuyển gấp</Text>
          </View>
        )}
      </View>

      {/* Deadline Status */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Calendar
            size={14}
            color={
              isExpired ? "#ef4444" : isDeadlineNear ? "#f59e0b" : "#6b7280"
            }
          />
          <Text
            className={`text-sm ml-1.5 font-medium ${
              isExpired
                ? "text-red-500"
                : isDeadlineNear
                  ? "text-amber-500"
                  : "text-gray-600"
            }`}
          >
            {isExpired
              ? "Đã hết hạn"
              : `Còn ${daysUntilDeadline} ngày để ứng tuyển`}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Users size={12} color="#9CA3AF" />
          <Text className="text-gray-500 text-xs ml-1">
            {job.applicationCount} ứng tuyển
          </Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <Clock size={12} color="#9ca3af" />
          <Text className="text-gray-500 text-xs ml-1">
            Đã lưu {formatDate(createdAt)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mt-3 pt-3 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleCardPress}
          className="flex-1 bg-blue-500 py-3 rounded-lg flex-row items-center justify-center"
          activeOpacity={0.8}
        >
          <Eye size={18} color="white" />
          <Text className="text-white font-semibold ml-2">Xem chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRemove}
          className="bg-red-50 px-4 py-3 rounded-lg flex-row items-center justify-center"
          activeOpacity={0.8}
        >
          <BookmarkX size={18} color="#ef4444" />
          <Text className="text-red-600 font-semibold ml-2">Xóa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default SavedJobCard;

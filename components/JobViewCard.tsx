import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import {
  MapPin,
  Clock,
  Eye,
  Users,
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

  // Format job type display
  const getJobTypeDisplay = (jobType: string, workLocationType?: string) => {
    const typeMap: { [key: string]: string } = {
      FULL_TIME: "Toàn thời gian",
      PART_TIME: "Bán thời gian", 
      CONTRACT: "Hợp đồng",
      INTERNSHIP: "Thực tập",
    };

    const locationMap: { [key: string]: string } = {
      REMOTE: "Remote",
      ONSITE: "Onsite", 
      HYBRID: "Hybrid",
    };

    const typeLabel = typeMap[jobType] || jobType;
    const locationLabel = workLocationType ? locationMap[workLocationType] || workLocationType : "";
    
    return locationLabel ? `${typeLabel} • ${locationLabel}` : typeLabel;
  };

  // Format experience level
  const getExperienceLabel = (level?: string) => {
    const labels: Record<string, string> = {
      ENTRY: "Entry Level",
      MID: "Middle", 
      SENIOR: "Senior",
      LEAD: "Lead",
      EXECUTIVE: "Executive",
    };
    return labels[level || ""] || level || "";
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
      className="bg-white rounded-2xl mx-4 mb-4 p-4 shadow-sm border border-gray-100"
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
            <Text className="text-lg font-semibold text-gray-900 mb-1" numberOfLines={2}>
              {job.title}
            </Text>
            <Text className="text-gray-600 text-sm font-medium">
              {job.company.companyName}
            </Text>
          </View>
        </View>
        
        {/* Viewed Time Badge */}
        <View className="bg-blue-50 px-2 py-1 rounded-full">
          <Text className="text-blue-600 text-xs font-medium">
            {formatDistanceToNow(new Date(viewedAt), {
              addSuffix: true,
              locale: vi,
            })}
          </Text>
        </View>
      </View>

      {/* Salary and Location */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          {job.salaryMin && job.salaryMax && (
            <View className="border border-primary-500 px-3 py-1.5 rounded-full mr-2">
              <Text className="text-primary-600 text-sm font-medium">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </Text>
            </View>
          )}
          
          <View className="bg-gray-200 px-3 py-1.5 rounded-full flex-row items-center">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-gray-600 text-sm font-medium ml-1">
              {job.locationCity || "Toàn quốc"}
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
        {job.experienceLevel && (
          <View className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 mb-2">
            <Text className="text-gray-600 text-xs font-medium">
              {getExperienceLabel(job.experienceLevel)}
            </Text>
          </View>
        )}

        {/* Skills Tags */}
        {job.skills && job.skills.slice(0, 2).map((skill, index) => (
          <View key={index} className="bg-purple-50 px-3 py-1.5 rounded-full mr-2 mb-2">
            <Text className="text-purple-600 text-xs font-medium">{skill}</Text>
          </View>
        ))}
        
        {job.skills && job.skills.length > 2 && (
          <View className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 mb-2">
            <Text className="text-gray-600 text-xs font-medium">
              +{job.skills.length - 2}
            </Text>
          </View>
        )}

        {/* Status Tags */}
        {isExpired() && (
          <View className="bg-red-50 px-3 py-1.5 rounded-full mr-2 mb-2">
            <Text className="text-red-600 text-xs font-bold">HẾT HẠN</Text>
          </View>
        )}
        
        {isExpiringSoon() && (
          <View className="bg-orange-50 px-3 py-1.5 rounded-full mr-2 mb-2">
            <Text className="text-orange-600 text-xs font-bold">SẮP HẾT HẠN</Text>
          </View>
        )}

        {job.viewCount && job.viewCount > 200 && (
          <View className="bg-red-50 px-3 py-1.5 rounded-full mr-2 mb-2">
            <Text className="text-red-600 text-xs font-bold">HOT</Text>
          </View>
        )}
      </View>

      {/* Stats Section */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <Clock size={12} color="#9CA3AF" />
          <Text className="text-gray-500 text-xs ml-1">
            Đã xem {formatDistanceToNow(new Date(viewedAt), { addSuffix: true, locale: vi })}
          </Text>
        </View>
        
        <View className="flex-row items-center space-x-3">
          {job.viewCount && (
            <View className="flex-row items-center">
              <Eye size={12} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs ml-1">
                {job.viewCount} views
              </Text>
            </View>
          )}
          
          {job.applicationCount !== undefined && (
            <View className="flex-row items-center">
              <Users size={12} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs ml-1">
                {job.applicationCount} ứng tuyển
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default JobViewCard;
import {
  Clock,
  Heart,
  MapPin,
  Users,
  Send,
  Loader2,
} from "lucide-react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Job } from "../types/job";
import JobApplyModal from "./job/JobApplyModal";
import { savedJobService } from "../services/savedJobService";
import jobViewService from "../services/jobViewService";

interface JobCardProps {
  job: Job;
  onPress?: () => void;
  onSavePress?: (jobId: string, isSaved: boolean) => void;
  initialSavedStatus?: boolean; // Optional prop to pass saved status from parent
  // Method to refresh saved status from parent
  onRefreshSavedStatus?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onPress,
  onSavePress,
  initialSavedStatus,
}) => {
  const [isSaved, setIsSaved] = useState(initialSavedStatus ?? false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const checkSavedStatus = useCallback(async () => {
    if (!job?.id) return;

    try {
      setIsCheckingStatus(true);
      const response = await savedJobService.checkIfJobSaved(job.id);
      if (response.success) {
        setIsSaved(response.data.isSaved);
      }
    } catch (error) {
      console.error("[JobCard] Error checking saved status:", error);
      // Keep current state on error
    } finally {
      setIsCheckingStatus(false);
    }
  }, [job?.id]);

  const handleJobView = useCallback(async () => {
    if (!job?.id) return;

    try {
      console.log("[JobCard] Recording job view for:", job.id);
      await jobViewService.recordJobView(job.id);
      console.log("[JobCard] Job view recorded successfully");
    } catch (error) {
      console.error("[JobCard] Error recording job view:", error);
      // Don't throw error - this shouldn't block user navigation
    }
  }, [job?.id]);

  const handleCardPress = useCallback(async () => {
    // Record job view first
    await handleJobView();

    // Then call the parent's onPress handler
    onPress?.();
  }, [handleJobView, onPress]);

  // Check saved status on mount if not provided as prop
  useEffect(() => {
    if (initialSavedStatus === undefined && job?.id) {
      checkSavedStatus();
    }
  }, [job?.id, initialSavedStatus, checkSavedStatus]);

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
    if (negotiable) return "Thỏa thuận";

    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(0)}M`;
      } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}K`;
      }
      return `$${num}`;
    };

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

    return `${formatNumber(min)} - ${formatNumber(max)}`;
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

  const getTimeAgo = (publishedAt: string) => {
    const now = new Date();
    const publishedDate = new Date(publishedAt);
    const diffInHours = Math.floor(
      (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
      } else {
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
      }
    }
  };

  const handleSavePress = async () => {
    if (isToggling || isCheckingStatus) return; // Prevent multiple clicks

    try {
      setIsToggling(true);
      console.log(
        "[JobCard] Toggling save status for job:",
        job.id,
        "Currently saved:",
        isSaved
      );

      const result = await savedJobService.toggleSaveJob(job.id);
      setIsSaved(result.saved);

      // Notify parent component
      onSavePress?.(job.id, result.saved);

      console.log("[JobCard] Save status updated:", result.saved);
    } catch (error) {
      console.error("[JobCard] Error toggling save status:", error);
      // Could show error message to user here
      // On error, refresh status to ensure consistency
      await checkSavedStatus();
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleCardPress}
        className="relative bg-white/90 backdrop-blur-sm rounded-2xl mx-4 mb-4 p-5 shadow-soft border border-purple-100/50 overflow-hidden"
        activeOpacity={0.8}
      >
        {/* Gradient overlay */}
        <View className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100/30 to-transparent rounded-bl-full" />
        <View className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-tr-full" />
        {/* Header with Company Logo and Favorite */}
        <View className="flex-row justify-between items-start mb-3 relative z-10">
          <View className="flex-row items-center flex-1">
            <View className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 justify-center items-center mr-3 shadow-soft border border-purple-200/30">
              {job.company.logoUrl ? (
                <Image
                  source={{ uri: job.company?.logoUrl }}
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
              {/* Job Title */}
              <Text
                className="text-lg font-semibold text-gray-900"
                numberOfLines={2}
              >
                {job.title || "Untitled Job"}
              </Text>
              <View className="flex-1">
                <Text className="text-gray-600 text-sm font-medium">
                  {job.company.companyName || "Unknown Company"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Salary & Location */}
        <View className="relative z-10 mb-4 flex flex-row items-center justify-between">
          <View className="flex items-center flex-row">
            <View className="bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1.5 rounded-full shadow-glow-purple">
              <Text className="text-white font-semibold text-sm">
                {formatSalary(
                  job.salaryMin,
                  job.salaryMax,
                  job.currency,
                  job.salaryNegotiable
                )}
              </Text>
            </View>

            <View className="flex flex-row items-center ml-3 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200/50">
              <MapPin size={14} color="#a855f7" />
              <Text className="text-sm font-medium text-purple-600 ml-1">
                {job.locationCity || "Unknown"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSavePress}
            disabled={isToggling || isCheckingStatus}
            className={`p-2 border rounded-full border-purple-500 ${
              isToggling || isCheckingStatus ? "opacity-50" : ""
            }`}
          >
            {isToggling || isCheckingStatus ? (
              <Loader2 size={20} color="#a855f7" />
            ) : (
              <Heart
                size={20}
                color={isSaved ? "#a855f7" : "#6B7280"}
                fill={isSaved ? "#a855f7" : "transparent"}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Job Details */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {/* Job Type Badge */}
            <View className="bg-blue-100 px-3 py-1.5 rounded-full mr-2">
              <Text className="text-purple-500 text-xs font-medium">
                {getJobTypeDisplay(job.jobType, job.workLocationType)}
              </Text>
            </View>

            {/* Experience Level Badge */}
            <View className="bg-gray-100 px-3 py-1.5 rounded-full mr-2">
              <Text className="text-gray-600 text-xs font-medium">
                {job.experienceLevel}
              </Text>
            </View>

            {job.featured && (
              <View className="bg-purple-50 px-3 py-1.5 rounded-full mr-2">
                <Text className="text-purple-600 text-xs font-bold">
                  Nổi bật
                </Text>
              </View>
            )}

            {/* Additional Badges */}
            {job.urgent && (
              <View className="bg-red-50 px-3 py-1.5 rounded-full mr-2">
                <Text className="text-red-600 text-xs font-bold">
                  Tuyển gấp
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Row */}
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Clock size={12} color="#9CA3AF" />
            <Text className="text-gray-500 text-xs ml-1">
              {getTimeAgo(job.createdAt)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Users size={12} color="#9CA3AF" />
            <Text className="text-gray-500 text-xs ml-1">
              {job.applicationCount} applications
            </Text>
          </View>
        </View>

        {/* Apply Button */}
        <View className="mt-3 pt-3 border-t border-gray-100">
          <TouchableOpacity
            onPress={() => setShowApplyModal(true)}
            className="bg-purple-500 py-3 rounded-lg flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Send size={18} color="white" />
            <Text className="text-white font-semibold ml-2">
              Ứng tuyển ngay
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Apply Modal */}
      <JobApplyModal
        visible={showApplyModal}
        job={job}
        onClose={() => setShowApplyModal(false)}
        onSuccess={() => {
          // Refresh job data or show success message
          console.log("Application submitted successfully");
        }}
      />
    </>
  );
};

export default JobCard;

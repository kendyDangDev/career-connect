import { useSavedJob } from "@/hooks/useSavedJob";
import { Bookmark, BookmarkCheck } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface SaveJobButtonProps {
  jobId: string;
  variant?: "icon" | "button" | "text";
  size?: "small" | "medium" | "large";
  showText?: boolean;
  className?: string;
  onSaveStateChange?: (isSaved: boolean) => void;
}

const SaveJobButton: React.FC<SaveJobButtonProps> = ({
  jobId,
  variant = "icon",
  size = "medium",
  showText = false,
  className = "",
  onSaveStateChange,
}) => {
  const { isSaved, isLoading, toggleSave } = useSavedJob(jobId);

  const handlePress = async () => {
    await toggleSave();
    if (onSaveStateChange) {
      onSaveStateChange(!isSaved);
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "medium":
        return 20;
      case "large":
        return 24;
      default:
        return 20;
    }
  };

  const getButtonPadding = () => {
    switch (size) {
      case "small":
        return "p-1.5";
      case "medium":
        return "p-2";
      case "large":
        return "p-3";
      default:
        return "p-2";
    }
  };

  // Icon only variant
  if (variant === "icon") {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isLoading}
        className={`${getButtonPadding()} ${className}`}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isSaved ? "#2563eb" : "#6b7280"}
          />
        ) : isSaved ? (
          <BookmarkCheck size={getIconSize()} color="#2563eb" fill="#2563eb" />
        ) : (
          <Bookmark size={getIconSize()} color="#6b7280" />
        )}
      </TouchableOpacity>
    );
  }

  // Button variant with background
  if (variant === "button") {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isLoading}
        className={`flex-row items-center justify-center rounded-lg ${
          isSaved
            ? "bg-blue-50 border border-blue-200"
            : "bg-gray-50 border border-gray-200"
        } ${size === "small" ? "px-3 py-1.5" : size === "large" ? "px-5 py-3" : "px-4 py-2"} ${className}`}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isSaved ? "#2563eb" : "#6b7280"}
          />
        ) : (
          <View>
            {isSaved ? (
              <BookmarkCheck
                size={getIconSize()}
                color="#2563eb"
                fill="#2563eb"
              />
            ) : (
              <Bookmark size={getIconSize()} color="#6b7280" />
            )}
            {showText && (
              <Text
                className={`ml-2 font-medium ${
                  isSaved ? "text-blue-600" : "text-gray-700"
                } ${size === "small" ? "text-sm" : size === "large" ? "text-base" : "text-sm"}`}
              >
                {isSaved ? "Đã lưu" : "Lưu"}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Text variant with icon
  if (variant === "text") {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isLoading}
        className={`flex-row items-center ${className}`}
      >
        {isLoading ? (
          <View className="flex-row items-center">
            <ActivityIndicator
              size="small"
              color={isSaved ? "#2563eb" : "#6b7280"}
            />
            <Text className="ml-2 text-gray-500">Đang xử lý...</Text>
          </View>
        ) : (
          <View>
            {isSaved ? (
              <BookmarkCheck
                size={getIconSize()}
                color="#2563eb"
                fill="#2563eb"
              />
            ) : (
              <Bookmark size={getIconSize()} color="#6b7280" />
            )}
            <Text
              className={`ml-2 ${
                isSaved ? "text-blue-600 font-medium" : "text-gray-700"
              } ${size === "small" ? "text-sm" : size === "large" ? "text-base" : "text-sm"}`}
            >
              {isSaved ? "Đã lưu việc làm" : "Lưu việc làm"}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return null;
};

export default SaveJobButton;

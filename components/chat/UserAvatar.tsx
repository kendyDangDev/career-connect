import React from "react";
import { View, Image, Text } from "react-native";
import { User } from "@/types/chat.types";

interface UserAvatarProps {
  user?: User;
  size?: "small" | "medium" | "large";
  isOnline?: boolean;
  showOnlineIndicator?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "medium",
  isOnline = false,
  showOnlineIndicator = false,
}) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const indicatorSizeClasses = {
    small: "w-2.5 h-2.5",
    medium: "w-3 h-3",
    large: "w-4 h-4",
  };

  const getInitials = () => {
    console.log("User for initials:", user);
    if (!user) return "?";

    // Nếu có user.name → dùng để tạo initials
    let initials = "";
    if (user?.name) {
      initials = user?.name
        .trim()
        .split(/\s+/)
        .map((word) => word[0]?.toUpperCase() || "")
        .join("");
    }

    // Nếu không có name hoặc initials rỗng → dùng lastName + firstName
    if (!initials) {
      const first = user.firstName?.[0]?.toUpperCase() || "";
      const last = user.lastName?.[0]?.toUpperCase() || "";
      initials = `${first}${last}`;
    }

    return initials || "?";
  };

  return (
    <View className="relative">
      {user?.avatarUrl ? (
        <Image
          source={{ uri: user.avatarUrl }}
          className={`${sizeClasses[size]} rounded-full bg-gray-200`}
          resizeMode="cover"
        />
      ) : (
        <View
          className={`${sizeClasses[size]} rounded-full bg-blue-500 items-center justify-center`}
        >
          <Text
            className={`text-white font-semibold ${
              size === "small"
                ? "text-xs"
                : size === "medium"
                  ? "text-sm"
                  : "text-base"
            }`}
          >
            {getInitials()}
          </Text>
        </View>
      )}

      {showOnlineIndicator && (
        <View
          className={`${indicatorSizeClasses[size]} rounded-full border-2 border-white absolute bottom-0 right-0 ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      )}
    </View>
  );
};

export default UserAvatar;

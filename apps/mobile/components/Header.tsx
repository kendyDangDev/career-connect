import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Search, Mic, SlidersHorizontal, Bell } from "lucide-react-native";
import { useSafeAuthContext } from "@/contexts/AuthContext";

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onMicPress?: () => void;
  onFilterPress?: () => void;
  onNotificationPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userName, // Will be overridden by auth context
  userAvatar, // Will be overridden by auth context
  searchValue = "",
  onSearchChange,
  onMicPress,
  onFilterPress,
  onNotificationPress,
}) => {
  // Safely use AuthContext
  const authContextValue = useSafeAuthContext();
  const user = authContextValue?.user || null;
  const isAuthenticated = authContextValue?.isAuthenticated || false;

  // Use auth context user data if available, otherwise use props or fallback
  const displayName =
    isAuthenticated && user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.email?.split("@")[0] ||
        "User"
      : userName || "Guest";

  const displayAvatar =
    isAuthenticated && user?.avatarUrl ? user.avatarUrl : userAvatar;
  return (
    <LinearGradient
      colors={["#a855f7", "#9333ea", "#7e22ce"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="pt-12 pb-6 px-4 relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <View className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full opacity-30" />
      <View className="absolute -top-8 -left-8 w-24 h-24 bg-white/5 rounded-full" />
      <View className="absolute bottom-8 right-12 w-16 h-16 bg-indigo-300/20 rounded-full" />

      {/* Top Row: User Info and Notification */}
      <View className="flex-row items-center justify-between mb-6 relative z-10">
        <View className="flex-row items-center flex-1">
          {/* User Avatar */}
          <View className="w-12 h-12 rounded-full bg-white/20 backdrop-blur justify-center items-center mr-3 overflow-hidden">
            {displayAvatar ? (
              <Image
                source={{ uri: displayAvatar }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-white font-semibold text-lg">
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            )}
          </View>

          {/* Welcome Text */}
          <View className="flex-1">
            <Text className="text-white/80 text-sm">Welcome back</Text>
            <Text
              className="text-white font-semibold text-base"
              numberOfLines={1}
            >
              {displayName}
            </Text>
          </View>
        </View>

        {/* Notification Button */}
        <TouchableOpacity
          onPress={onNotificationPress}
          className="p-2"
          activeOpacity={0.7}
        >
          <Bell size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Welcome Message */}
      <View className="relative z-10 mb-6">
        <Text className="text-2xl font-bold text-white mb-2 leading-7">
          Tìm công việc mơ ước{"\n"}của bạn ngay hôm nay!
        </Text>
        <View className="w-16 h-1 bg-gradient-to-r from-white to-indigo-200 rounded-full opacity-60" />
      </View>

      {/* Search Bar with Glass Effect */}
      <View className="relative z-10">
        <View className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl" />
        <View className="flex-row items-center bg-white/95 rounded-2xl px-4 py-4 border border-white/30 shadow-glow-purple">
          <Search size={20} color="#9CA3AF" />

          <TextInput
            className="flex-1 ml-3 text-gray-900 text-base outline-none"
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchValue}
            onChangeText={onSearchChange}
          />

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={onMicPress}
              className="p-1 mr-2"
              activeOpacity={0.7}
            >
              <Mic size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onFilterPress}
              className="p-1"
              activeOpacity={0.7}
            >
              <SlidersHorizontal size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Header;

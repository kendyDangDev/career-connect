import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface JobMatchSectionProps {
  onSeeAllPress?: () => void;
}

const JobMatchSection: React.FC<JobMatchSectionProps> = ({ onSeeAllPress }) => {
  return (
    <View className="px-4 py-6">
      {/* Header with Gradient Background */}
      <View className="relative bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-purple-100/50">
        {/* Decorative elements */}
        <View className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-bl from-purple-200/20 to-transparent rounded-full" />
        <View className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-indigo-200/20 to-transparent rounded-full" />

        <View className="flex-row items-center justify-between relative z-10">
          <View className="flex-1">
            <Text className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text mb-1">
              Công việc phù hợp với bạn
            </Text>
            <Text className="text-purple-500 text-sm font-medium">
              Dựa trên kỹ năng và kinh nghiệm của bạn
            </Text>
          </View>

          <TouchableOpacity
            onPress={onSeeAllPress}
            className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200/50 shadow-soft"
            activeOpacity={0.8}
          >
            <Text className="text-purple-600 font-semibold text-sm">
              Xem tất cả
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Match Stats Cards */}
      <View className="flex-row justify-between">
        <View className="flex-1 bg-white/70 backdrop-blur-sm rounded-xl p-3 mr-2 border border-purple-100/30 shadow-soft">
          <Text className="text-2xl font-bold text-purple-600">85%</Text>
          <Text className="text-purple-500 text-xs">Độ phù hợp</Text>
        </View>

        <View className="flex-1 bg-white/70 backdrop-blur-sm rounded-xl p-3 mx-1 border border-indigo-100/30 shadow-soft">
          <Text className="text-2xl font-bold text-indigo-600">12</Text>
          <Text className="text-indigo-500 text-xs">Việc làm mới</Text>
        </View>

        <View className="flex-1 bg-white/70 backdrop-blur-sm rounded-xl p-3 ml-2 border border-blue-100/30 shadow-soft">
          <Text className="text-2xl font-bold text-blue-600">3</Text>
          <Text className="text-blue-500 text-xs">Đã ứng tuyển</Text>
        </View>
      </View>
    </View>
  );
};

export default JobMatchSection;

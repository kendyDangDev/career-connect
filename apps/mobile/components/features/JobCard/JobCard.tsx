import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { JobCardProps } from './JobCard.types';

export const JobCard: React.FC<JobCardProps> = ({
  title,
  company,
  logo,
  salaryRange,
  location,
  isVerified = false,
  onPress,
  onFavoritePress,
  isFavorite = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
      >
        <View className="flex-row">
          {/* Company Logo */}
          <View className="w-14 h-14 rounded-xl bg-gray-100 mr-3 overflow-hidden">
            {logo ? (
              <Image
                source={{ uri: logo }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Ionicons name="business" size={24} color="#9CA3AF" />
              </View>
            )}
          </View>

          {/* Job Details */}
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 mb-1" numberOfLines={2}>
              {title}
            </Text>
            
            <View className="flex-row items-center mb-2">
              <Text className="text-sm text-gray-600" numberOfLines={1}>
                {company}
              </Text>
              {isVerified && (
                <MaterialIcons
                  name="verified"
                  size={16}
                  color="#10B981"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>

            {/* Salary and Location */}
            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-md">
                <Text className="text-sm font-medium text-green-700">
                  {salaryRange}
                </Text>
              </View>
              
              <View className="flex-row items-center ml-3">
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-1">{location}</Text>
              </View>
            </View>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={onFavoritePress}
            className="ml-2 p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#EF4444" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

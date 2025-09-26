import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface JobMatchSectionProps {
  onSeeAllPress?: () => void;
}

const JobMatchSection: React.FC<JobMatchSectionProps> = ({ onSeeAllPress }) => {
  return (
    <View className="flex-row items-center justify-between px-4 mb-4">
      <Text className="text-lg font-bold text-gray-900">
        Job match with you
      </Text>
      
      <TouchableOpacity 
        onPress={onSeeAllPress}
        activeOpacity={0.7}
      >
        <Text className="text-blue-600 font-medium text-sm">
          See All
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default JobMatchSection;

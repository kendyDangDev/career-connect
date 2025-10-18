import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import { SearchBarProps } from './SearchBar.types';

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Tìm kiếm theo",
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      ['#E5E7EB', '#3B82F6']
    );

    return {
      borderColor,
      borderWidth: 1,
    };
  });

  const handleFocus = () => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
    onBlur?.();
  };

  return (
    <Animated.View
      style={animatedStyle}
      className="flex-row items-center bg-white rounded-xl px-4 py-3 shadow-sm"
    >
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? "#3B82F6" : "#9CA3AF"}
        style={{ marginRight: 8 }}
      />
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        returnKeyType="search"
        className="flex-1 text-base text-gray-900"
        style={{ paddingVertical: 0 }}
      />
      
      {value && value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText?.('')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

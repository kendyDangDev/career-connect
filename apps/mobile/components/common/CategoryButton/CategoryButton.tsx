import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { CategoryButtonProps } from './CategoryButton.types';

export const CategoryButton: React.FC<CategoryButtonProps> = ({
  icon,
  label,
  onPress,
  color = '#10B981',
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    rotation.value = withSequence(
      withSpring(-5, { damping: 10, stiffness: 400 }),
      withSpring(5, { damping: 10, stiffness: 400 }),
      withSpring(0, { damping: 10, stiffness: 400 })
    );
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="items-center"
    >
      <Animated.View
        style={[animatedIconStyle, { backgroundColor: color }]}
        className="w-16 h-16 rounded-full items-center justify-center mb-2 shadow-sm"
      >
        <View className="items-center justify-center">
          {icon}
        </View>
      </Animated.View>
      
      <Text className="text-xs text-gray-700 text-center font-medium">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

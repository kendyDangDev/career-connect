import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isConnected,
  showText = false,
  size = 'medium',
  className = '',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isConnected) {
      // Create pulsing animation for disconnected state
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isConnected, pulseAnim]);

  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
  };

  const iconSize = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const textSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  if (showText) {
    return (
      <View className={`flex-row items-center ${className}`}>
        <Animated.View
          className={`${sizeClasses[size]} rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
          style={{ opacity: pulseAnim }}
        />
        <Text
          className={`${textSize[size]} ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      className={`${sizeClasses[size]} rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      } ${className}`}
      style={{ opacity: pulseAnim }}
    />
  );
};

export default ConnectionStatusIndicator;
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface TypingIndicatorProps {
  isTyping: boolean;
  typingUsers?: string[];
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isTyping,
  typingUsers = [],
  className = '',
}) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      // Slide in animation
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Dot animation loop
      const animateDots = () => {
        const createSequence = (dot: Animated.Value, delay: number) =>
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ]);

        Animated.loop(
          Animated.parallel([
            createSequence(dot1, 0),
            createSequence(dot2, 200),
            createSequence(dot3, 400),
          ])
        ).start();
      };

      animateDots();
    } else {
      // Stop animations and slide out
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
      
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [isTyping, dot1, dot2, dot3, slideAnim]);

  const getTypingText = () => {
    if (typingUsers.length === 0) {
      return 'đang gõ...';
    } else if (typingUsers.length === 1) {
      return `${typingUsers[0]} đang gõ...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} và ${typingUsers[1]} đang gõ...`;
    } else {
      return `${typingUsers[0]} và ${typingUsers.length - 1} người khác đang gõ...`;
    }
  };

  if (!isTyping) return null;

  return (
    <Animated.View
      className={`flex-row items-center px-4 py-2 ${className}`}
      style={{
        opacity: slideAnim,
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <View className="flex-row items-center bg-gray-100 rounded-2xl px-3 py-2">
        <View className="flex-row items-center mr-2">
          <Animated.View
            className="w-2 h-2 bg-gray-500 rounded-full mr-1"
            style={{ opacity: dot1 }}
          />
          <Animated.View
            className="w-2 h-2 bg-gray-500 rounded-full mr-1"
            style={{ opacity: dot2 }}
          />
          <Animated.View
            className="w-2 h-2 bg-gray-500 rounded-full"
            style={{ opacity: dot3 }}
          />
        </View>
        <Text className="text-sm text-gray-600 italic">
          {getTypingText()}
        </Text>
      </View>
    </Animated.View>
  );
};

export default TypingIndicator;
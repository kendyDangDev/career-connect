// Import the reanimated fix FIRST, before any other imports
import '../utils/reanimatedFix';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  Bell,
  Book,
  Briefcase,
  Clipboard,
  CloudUpload,
  Home,
  Mails,
  User,
} from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 60;
const ACTIVE_ICON_SIZE = 28;
const INACTIVE_ICON_SIZE = 24;

interface TabIconProps {
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused }) => {
  const iconSize = focused ? ACTIVE_ICON_SIZE : INACTIVE_ICON_SIZE;

  const iconMap: Record<string, React.ComponentType<any>> = {
    index: Home,
    jobs: Briefcase,
    'cv-management': CloudUpload,
    chat: Mails,
    notifications: Bell,
    'saved-jobs': Clipboard,
    profile: User,
  };

  const Icon = iconMap[name] || Home;

  return (
    <Icon
      size={iconSize}
      color={focused ? 'white' : '#6B7280'}
      strokeWidth={focused ? 2.5 : 2}
      fill={focused ? 'white' : 'transparent'}
    />
  );
};

const AnimatedTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  // Example badges - you can pass this from parent or fetch from context
  const badges: Record<string, number> = {
    notifications: 3,
  };

  return (
    <View
      className="bg-white border-t border-gray-200"
      style={{
        paddingBottom: insets.bottom || 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <View
        className="flex-row items-center"
        style={{ height: TAB_BAR_HEIGHT }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;

          // Skip hidden tabs
          if (options.href === null) {
            return null;
          }

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const animatedContainerStyle = useAnimatedStyle(() => {
            return {
              transform: [
                {
                  translateY: withSpring(isFocused ? -15 : 0, {
                    damping: 12,
                    stiffness: 180,
                    mass: 0.5,
                  }),
                },
                {
                  scale: withSpring(isFocused ? 1.05 : 1, {
                    damping: 10,
                    stiffness: 200,
                  }),
                },
              ],
            };
          });

          const animatedBackgroundStyle = useAnimatedStyle(() => {
            return {
              opacity: withTiming(isFocused ? 1 : 0, {
                duration: 250,
              }),
              transform: [
                {
                  scale: withSpring(isFocused ? 1 : 0.8, {
                    damping: 12,
                    stiffness: 180,
                  }),
                },
                {
                  rotate: withSpring(isFocused ? '0deg' : '45deg', {
                    damping: 15,
                    stiffness: 150,
                  }),
                },
              ],
            };
          });

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              className="flex-1 items-center justify-center"
              activeOpacity={0.8}
            >
              {isFocused ? (
                // Active Tab - Floating icon with background
                <Animated.View style={[animatedContainerStyle]}>
                  <Animated.View
                    style={[
                      {
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: '#7e22ce',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#7e22ce',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                      },
                      animatedBackgroundStyle,
                    ]}
                  >
                    <TabIcon name={route.name} focused={true} />
                    {badges[route.name] > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 5,
                          right: 5,
                          backgroundColor: '#EF4444',
                          borderRadius: 10,
                          minWidth: 18,
                          height: 18,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 4,
                          borderWidth: 2,
                          borderColor: '#FFFFFF',
                        }}
                      >
                        <Text
                          style={{
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 'bold',
                          }}
                        >
                          {badges[route.name] > 99 ? '99+' : badges[route.name]}
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                </Animated.View>
              ) : (
                // Inactive Tab - Icon with label
                <View className="items-center">
                  <View className="h-8 justify-center items-center relative">
                    <Animated.View>
                      <View className="w-10 h-10 items-center justify-center">
                        <TabIcon name={route.name} focused={false} />
                        {badges[route.name] > 0 && (
                          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center px-1">
                            <Text className="text-white text-[10px] font-bold">
                              {badges[route.name] > 99
                                ? '99+'
                                : badges[route.name]}
                            </Text>
                          </View>
                        )}
                      </View>
                    </Animated.View>
                  </View>
                  <Text
                    className="text-[10px] text-gray-500 font-medium mt-0.5"
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Re-export the icon component for inactive state
const InactiveTabIcon: React.FC<{ name: string }> = ({ name }) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    index: Home,
    jobs: Briefcase,
    'create-cv': Book,
    notifications: Bell,
    profile: User,
  };

  const Icon = iconMap[name] || Home;

  return <Icon size={INACTIVE_ICON_SIZE} color="#6B7280" strokeWidth={2} />;
};

export { InactiveTabIcon };
export default AnimatedTabBar;

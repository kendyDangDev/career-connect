import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  Briefcase,
  Bell,
  Book,
  User,
  Settings,
  Plus,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface TabItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  badge?: number;
  isSpecial?: boolean;
}

interface BottomNavigationEnhancedProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  badges?: { [key: string]: number };
  showLabels?: boolean;
  enableHaptic?: boolean;
}

const tabs: TabItem[] = [
  { id: "home", title: "Trang chủ", icon: Home },
  { id: "job-list", title: "Việc làm", icon: Briefcase },
  { id: "cv-management", title: "CV", icon: Plus, isSpecial: true },
  { id: "notifications", title: "Thông báo", icon: Bell },
  { id: "profile", title: "Tài khoản", icon: User },
  ...(__DEV__ ? [{ id: "debug", title: "Debug", icon: Settings }] : []),
];

const BottomNavigationEnhanced: React.FC<BottomNavigationEnhancedProps> = ({
  activeTab,
  onTabPress,
  badges = {},
  showLabels = true,
  enableHaptic = true,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get("window");
  const animatedValues = useRef(
    tabs.reduce(
      (acc, tab) => {
        acc[tab.id] = new Animated.Value(tab.id === activeTab ? 1 : 0);
        return acc;
      },
      {} as { [key: string]: Animated.Value }
    )
  ).current;

  useEffect(() => {
    // Animate tab transitions
    tabs.forEach((tab) => {
      Animated.spring(animatedValues[tab.id], {
        toValue: tab.id === activeTab ? 1 : 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    });
  }, [activeTab]);

  const handleTabPress = (tabId: string) => {
    if (enableHaptic && Platform.OS === "ios") {
      // Add haptic feedback for iOS
      const { HapticFeedback } = require("expo-haptics");
      HapticFeedback?.impactAsync?.(HapticFeedback.ImpactFeedbackStyle.Light);
    }
    onTabPress(tabId);
  };

  const renderTab = (tab: TabItem, index: number) => {
    const isActive = tab.id === activeTab;
    const IconComponent = tab.icon;
    const badgeCount = badges[tab.id] || 0;

    // Special center tab with gradient
    if (tab.isSpecial) {
      return (
        <TouchableOpacity
          key={tab.id}
          onPress={() => handleTabPress(tab.id)}
          className="flex-1 items-center justify-center"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isActive ? ["#3B82F6", "#2563EB"] : ["#E5E7EB", "#D1D5DB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.specialTab}
          >
            <IconComponent size={28} color="#FFFFFF" strokeWidth={2.5} />
          </LinearGradient>
          {showLabels && (
            <Text className="text-xs mt-2 text-gray-600 font-medium">
              {tab.title}
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    // Regular tabs with animation
    return (
      <TouchableOpacity
        key={tab.id}
        onPress={() => handleTabPress(tab.id)}
        className="flex-1 items-center justify-center py-2"
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.tabContent,
            {
              transform: [
                {
                  scale: animatedValues[tab.id].interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
                {
                  translateY: animatedValues[tab.id].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -2],
                  }),
                },
              ],
            },
          ]}
        >
          <View className="relative">
            <IconComponent
              size={24}
              color={isActive ? "#2563EB" : "#6B7280"}
              strokeWidth={isActive ? 2.5 : 2}
            />

            {/* Animated Badge */}
            {badgeCount > 0 && (
              <Animated.View
                style={[
                  styles.badge,
                  {
                    transform: [
                      {
                        scale: animatedValues[tab.id].interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text className="text-white text-xs font-bold">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </Text>
              </Animated.View>
            )}
          </View>

          {showLabels && (
            <Animated.Text
              style={[
                styles.label,
                {
                  color: isActive ? "#2563EB" : "#6B7280",
                  opacity: animatedValues[tab.id].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ]}
            >
              {tab.title}
            </Animated.Text>
          )}
        </Animated.View>

        {/* Active Indicator Dot */}
        <Animated.View
          style={[
            styles.indicator,
            {
              opacity: animatedValues[tab.id],
              transform: [
                {
                  scale: animatedValues[tab.id].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View
      className="bg-white"
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom || (Platform.OS === "ios" ? 20 : 10),
        },
      ]}
    >
      <View className="flex-row items-end">
        {tabs.map((tab, index) => renderTab(tab, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 15,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  specialTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2563EB",
  },
});

export default BottomNavigationEnhanced;

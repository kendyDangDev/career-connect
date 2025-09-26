import {
  Bell,
  Book,
  Briefcase,
  Home,
  Settings,
  User
} from "lucide-react-native";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TabItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  badges?: { [key: string]: number };
}

const tabs: TabItem[] = [
  { id: "home", title: "Trang chủ", icon: Home },
  { id: "job-list", title: "Việc làm", icon: Briefcase },
  { id: "notifications", title: "Thông báo", icon: Bell },
  { id: "create-cv", title: "Mẫu CV", icon: Book },
  { id: "profile", title: "Tài khoản", icon: User },
  // Development only
  ...(__DEV__ ? [{ id: "debug", title: "Debug", icon: Settings }] : []),
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
  badges = {},
}) => {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");

  return (
    <View
      className="bg-white border-t border-gray-200"
      style={{
        paddingBottom: insets.bottom || (Platform.OS === "ios" ? 20 : 10),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <View className="flex-row">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          const IconComponent = tab.icon;
          const badgeCount = badges[tab.id] || 0;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress(tab.id)}
              className="flex-1 items-center justify-center py-2"
              activeOpacity={0.7}
              style={{ minHeight: 56 }}
            >
              <View className="items-center justify-center">
                {/* Icon Container */}
                <View className="relative">
                  <IconComponent
                    size={24}
                    color={isActive ? "#2563EB" : "#6B7280"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Badge */}
                  {badgeCount > 0 && (
                    <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                      <Text className="text-white text-xs font-bold">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Label */}
                <Text
                  className={`text-xs mt-1 font-medium ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                  numberOfLines={1}
                >
                  {tab.title}
                </Text>
                
                {/* Active Indicator */}
                {isActive && (
                  <View className="absolute -top-2 w-12 h-1 bg-blue-600 rounded-full" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavigation;

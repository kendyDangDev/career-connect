import React, { useState, useMemo } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import {
  Bell,
  BellOff,
  Briefcase,
  FileText,
  MessageCircle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Check,
} from "lucide-react-native";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "job" | "cv" | "message" | "system";
  isRead: boolean;
  priority?: "high" | "normal" | "low";
  actionUrl?: string;
  companyLogo?: string;
};

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Công việc mới phù hợp với bạn",
    description:
      "FPT Software đang tuyển dụng React Native Developer với mức lương 25-35 triệu VNĐ",
    time: "5 phút trước",
    type: "job",
    isRead: false,
    priority: "high",
    companyLogo:
      "https://images.seeklogo.com/logo-png/21/1/fpt-logo-png_seeklogo-211515.png",
  },
  {
    id: "2",
    title: "CV của bạn đã được xem",
    description:
      "Nhà tuyển dụng từ VNG Corporation đã xem CV React Native Developer của bạn",
    time: "1 giờ trước",
    type: "cv",
    isRead: false,
    priority: "normal",
  },
  {
    id: "3",
    title: "Tin nhắn mới từ HR",
    description:
      'HR từ Tiki: "Chào bạn, chúng tôi rất ấn tượng với hồ sơ của bạn và muốn mời bạn tham gia..."',
    time: "2 giờ trước",
    type: "message",
    isRead: false,
    priority: "high",
  },
  {
    id: "4",
    title: "3 nhà tuyển dụng đã lưu hồ sơ của bạn",
    description: "Hồ sơ của bạn đang được quan tâm. Xem chi tiết để biết thêm.",
    time: "3 giờ trước",
    type: "cv",
    isRead: true,
    priority: "normal",
  },
  {
    id: "5",
    title: "Hạn nộp hồ sơ sắp hết",
    description:
      "Còn 2 ngày để nộp hồ sơ cho vị trí Senior Developer tại Shopee",
    time: "5 giờ trước",
    type: "job",
    isRead: true,
    priority: "high",
  },
  {
    id: "6",
    title: "Cập nhật hồ sơ",
    description:
      "Hoàn thiện thêm 30% hồ sơ để tăng 70% cơ hội được nhà tuyển dụng tìm thấy",
    time: "Hôm qua",
    type: "system",
    isRead: true,
    priority: "low",
  },
  {
    id: "7",
    title: "Việc làm hot trong tuần",
    description:
      "Xem ngay 50+ việc làm mới với mức lương hấp dẫn nhất tuần này",
    time: "2 ngày trước",
    type: "job",
    isRead: true,
    priority: "normal",
  },
];

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(mockNotifications);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const filters = [
    { id: "all", label: "Tất cả", icon: Bell },
    { id: "job", label: "Công việc", icon: Briefcase },
    { id: "cv", label: "Hồ sơ", icon: FileText },
    { id: "message", label: "Tin nhắn", icon: MessageCircle },
    { id: "system", label: "Hệ thống", icon: Info },
  ];

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === "all") return notifications;
    return notifications.filter((n) => n.type === selectedFilter);
  }, [notifications, selectedFilter]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "job":
        return Briefcase;
      case "cv":
        return FileText;
      case "message":
        return MessageCircle;
      case "system":
        return Info;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: NotificationItem["type"]) => {
    switch (type) {
      case "job":
        return "#10b981";
      case "cv":
        return "#3b82f6";
      case "message":
        return "#f59e0b";
      case "system":
        return "#6b7280";
      default:
        return "#3b82f6";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "low":
        return "#6b7280";
      default:
        return "#3b82f6";
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const NotificationCard = ({
    notification,
    index,
  }: {
    notification: NotificationItem;
    index: number;
  }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const translateX = useSharedValue(0);
    const Icon = getNotificationIcon(notification.type);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
      opacity: opacity.value,
    }));

    const handlePress = () => {
      scale.value = withSpring(0.95, {}, () => {
        scale.value = withSpring(1);
      });
      if (!notification.isRead) {
        handleMarkAsRead(notification.id);
      }
    };

    const handleSwipeDelete = () => {
      translateX.value = withTiming(-500, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }, () => {
        handleDeleteNotification(notification.id);
      });
    };

    return (
      <AnimatedTouchableOpacity
        entering={FadeInDown.delay(index * 50).springify()}
        style={animatedStyle}
        onPress={handlePress}
        activeOpacity={0.9}
        className={`mx-4 mb-3 bg-white rounded-2xl overflow-hidden ${
          !notification.isRead
            ? "border-l-4 border-blue-500"
            : "border border-gray-100"
        }`}
      >
        <View className="flex-row p-4">
          {/* Icon Container */}
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
            style={{
              backgroundColor: `${getNotificationColor(notification.type)}15`,
            }}
          >
            <Icon size={24} color={getNotificationColor(notification.type)} />
          </View>

          {/* Content */}
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-start justify-between mb-1">
              <View className="flex-1">
                <Text
                  className={`text-base font-semibold ${
                    !notification.isRead ? "text-gray-900" : "text-gray-700"
                  }`}
                  numberOfLines={2}
                >
                  {notification.title}
                </Text>
              </View>

              {/* Priority Badge */}
              {notification.priority === "high" && !notification.isRead && (
                <View className="ml-2">
                  <View className="w-2 h-2 rounded-full bg-red-500" />
                </View>
              )}
            </View>

            {/* Description */}
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {notification.description}
            </Text>

            {/* Footer */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Clock size={12} color="#9ca3af" />
                <Text className="text-xs text-gray-500 ml-1">
                  {notification.time}
                </Text>
              </View>

              {/* Actions */}
              <View className="flex-row items-center space-x-2">
                {!notification.isRead && (
                  <TouchableOpacity
                    onPress={() => handleMarkAsRead(notification.id)}
                    className="px-3 py-1 bg-blue-50 rounded-full"
                  >
                    <Text className="text-xs text-blue-600 font-medium">
                      Đánh dấu đã đọc
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Swipe Delete Hint */}
          <TouchableOpacity onPress={handleSwipeDelete} className="ml-2 p-2">
            <Text className="text-xs text-gray-400">×</Text>
          </TouchableOpacity>
        </View>
      </AnimatedTouchableOpacity>
    );
  };

  const EmptyState = () => (
    <Animated.View
      entering={FadeInUp.springify()}
      className="flex-1 items-center justify-center py-20"
    >
      <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
        <BellOff size={40} color="#9ca3af" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        Không có thông báo mới
      </Text>
      <Text className="text-sm text-gray-500 text-center px-8">
        Bạn sẽ nhận thông báo khi có cập nhật mới từ nhà tuyển dụng
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.springify()}
        className="bg-white border-b border-gray-100"
      >
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Thông báo
              </Text>
              {unreadCount > 0 && (
                <Text className="text-sm text-gray-500 mt-1">
                  Bạn có {unreadCount} thông báo chưa đọc
                </Text>
              )}
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-50 rounded-full"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <CheckCircle size={16} color="#3b82f6" />
                  <Text className="text-sm text-blue-600 font-medium ml-1">
                    Đánh dấu tất cả
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-4 px-4"
          >
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = selectedFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  onPress={() => setSelectedFilter(filter.id)}
                  className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
                    isActive ? "bg-blue-600" : "bg-gray-100"
                  }`}
                  activeOpacity={0.7}
                >
                  <Icon size={16} color={isActive ? "#ffffff" : "#6b7280"} />
                  <Text
                    className={`ml-2 text-sm font-medium ${
                      isActive ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>

      {/* Notification List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3b82f6"]}
              tintColor="#3b82f6"
            />
          }
          showsVerticalScrollIndicator={false}
          className="flex-1 pt-4"
        >
          {filteredNotifications.map((notification, index) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              index={index}
            />
          ))}

          {/* Load More Button */}
          <TouchableOpacity
            className="mx-4 my-6 py-3 bg-white border border-gray-200 rounded-xl items-center"
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium text-gray-600">
              Xem thông báo cũ hơn
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

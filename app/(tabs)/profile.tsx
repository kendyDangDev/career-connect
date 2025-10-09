import { AuthMobileDebug } from "@/components/AuthMobileDebug";
import { useAuthContext, useSafeAuthContext } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  ChevronRight,
  Edit2,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Moon,
  NotebookTabs,
  Shield,
  User,
} from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MenuItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  value?: string;
  showArrow?: boolean;
  onPress?: () => void;
};

export default function ProfileScreen() {
  // Use safe auth context to avoid throwing errors
  const authContext = useSafeAuthContext();
  const authContextValue = useAuthContext();
  console.log({ authContextValue });
  console.log({ authContext });

  console.log("[ProfileScreen] authContext:", authContext);

  // If context is not available, show loading or fallback
  if (!authContext) {
    console.log("[ProfileScreen] AuthContext is null, showing loading...");
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-20 h-20 bg-blue-100 rounded-full justify-center items-center mb-4">
            <User size={40} color="#2563EB" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Không thể kết nối với dịch vụ xác thực. Vui lòng thử lại.
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-xl"
            onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-white font-semibold text-base">
              Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Access auth context safely
  const { user, logout, isAuthenticated, isLoading } = authContext;

  console.log("[ProfileScreen] Auth state:", {
    user: !!user,
    isAuthenticated,
    isLoading,
  });

  // Show loading state while checking authentication
  if (isLoading) {
    console.log("[ProfileScreen] Showing loading state, isLoading:", isLoading);
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-20 h-20 bg-blue-100 rounded-full justify-center items-center mb-4">
            <User size={40} color="#2563EB" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Đang tải...
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Đang kiểm tra thông tin đăng nhập
          </Text>
          <TouchableOpacity
            className="mt-4 bg-gray-200 px-4 py-2 rounded-lg"
            onPress={() => {
              console.log("[ProfileScreen] Force refresh auth state");
              authContext?.checkAuthStatus?.();
            }}
          >
            <Text className="text-gray-700">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const profileMenuItems: MenuItem[] = [
    {
      id: "1",
      title: "Thông tin cá nhân",
      icon: <User size={20} color="#6B7280" />,
      showArrow: true,
      onPress: () => {
        router.push("/profile-info");
      },
    },
    {
      id: "2",
      title: "CV của tôi",
      icon: <FileText size={20} color="#6B7280" />,
      value: "3",
      showArrow: true,
      onPress: () => {
        router.push("/cv-management");
      },
    },
    {
      id: "6",
      title: "Công việc đã xem",
      icon: <NotebookTabs size={20} color="#6B7280" />,
      value: "12",
      showArrow: true,
      onPress: () => {
        router.push("/job-views");
      },
    },
    {
      id: "3",
      title: "Việc làm đã lưu",
      icon: <Bookmark size={20} color="#6B7280" />,
      value: "12",
      showArrow: true,
      onPress: () => {
        router.push("/saved-jobs");
      },
    },
    {
      id: "4",
      title: "Công việc đã ứng tuyển",
      icon: <Briefcase size={20} color="#6B7280" />,
      value: "5",
      showArrow: true,
      onPress: () => {
        router.push("/applied-jobs");
      },
    },
    {
      id: "5",
      title: "Công ty đang theo dõi",
      icon: <Building2 size={20} color="#6B7280" />,
      value: "5",
      showArrow: true,
      onPress: () => {
        router.push("/company-followers");
      },
    },
  ];

  const settingsMenuItems: MenuItem[] = [
    {
      id: "5",
      title: "Cài đặt thông báo",
      icon: <Bell size={20} color="#6B7280" />,
      showArrow: true,
    },
    {
      id: "6",
      title: "Đổi mật khẩu",
      icon: <Lock size={20} color="#6B7280" />,
      showArrow: true,
      onPress: () => {
        router.push("/change-password");
      },
    },
    {
      id: "7",
      title: "Ngôn ngữ",
      icon: <Globe size={20} color="#6B7280" />,
      value: "Tiếng Việt",
      showArrow: true,
    },
    {
      id: "8",
      title: "Chế độ tối",
      icon: <Moon size={20} color="#6B7280" />,
      showArrow: false,
    },
  ];

  const supportMenuItems: MenuItem[] = [
    {
      id: "9",
      title: "Trung tâm trợ giúp",
      icon: <HelpCircle size={20} color="#6B7280" />,
      showArrow: true,
    },
    {
      id: "10",
      title: "Điều khoản sử dụng",
      icon: <FileText size={20} color="#6B7280" />,
      showArrow: true,
    },
    {
      id: "11",
      title: "Chính sách bảo mật",
      icon: <Shield size={20} color="#6B7280" />,
      showArrow: true,
    },
    {
      id: "12",
      title: "Về chúng tôi",
      icon: <Info size={20} color="#6B7280" />,
      showArrow: true,
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      className="flex-row items-center justify-between py-3 px-4 bg-white border-b border-gray-100"
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-9 h-9 rounded-full bg-gray-50 justify-center items-center mr-3">
          {item.icon}
        </View>
        <View className="flex-1">
          <Text className="text-base text-gray-900 font-medium">
            {item.title}
          </Text>
          {item.subtitle && (
            <Text className="text-xs text-gray-500 mt-0.5">
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      <View className="flex-row items-center">
        {item.value && (
          <Text className="text-sm text-gray-500 mr-2">{item.value}</Text>
        )}
        {item.showArrow && <ChevronRight size={16} color="#9CA3AF" />}
      </View>
    </TouchableOpacity>
  );

  // Get user initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  const handleLogout = async () => {
    await logout();
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-20 h-20 bg-blue-100 rounded-full justify-center items-center mb-4">
            <User size={40} color="#2563EB" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Bạn chưa đăng nhập
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Đăng nhập để xem thông tin cá nhân và quản lý hồ sơ của bạn
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-8 py-3 rounded-xl"
            onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-white font-semibold text-base">
              Đăng nhập ngay
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center px-6 pt-8 pb-6 bg-white">
          <View className="relative mb-4">
            <View className="w-20 h-20 rounded-full bg-blue-500 justify-center items-center">
              {/* <Text className="text-white text-2xl font-bold">
                {getInitials()}
              </Text> */}
              <Image
                source={{ uri: user?.avatarUrl }}
                className="w-24 h-24 rounded-full"
              />
            </View>
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 justify-center items-center border-2 border-white"
              activeOpacity={0.8}
              onPress={() => {
                router.push("/profile-info");
              }}
            >
              <Edit2 size={14} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-xl font-bold text-gray-900 mb-1">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-sm text-gray-500 mb-6">{user?.email}</Text>

          {/* Profile Stats */}
          <View className="flex-row items-center bg-gray-50 rounded-xl py-4 px-6 w-full">
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-gray-900">85%</Text>
              <Text className="text-xs text-gray-500 mt-1">Hồ sơ</Text>
            </View>

            <View className="w-px h-8 bg-gray-200" />

            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-gray-900">12</Text>
              <Text className="text-xs text-gray-500 mt-1">Đã ứng tuyển</Text>
            </View>

            <View className="w-px h-8 bg-gray-200" />

            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-gray-900">3</Text>
              <Text className="text-xs text-gray-500 mt-1">Phỏng vấn</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View className="mt-6">
          {/* Profile Management Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wider px-4 mb-2">
              Quản lý hồ sơ
            </Text>
            <View className="bg-white">
              {profileMenuItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Settings Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wider px-4 mb-2">
              Cài đặt
            </Text>
            <View className="bg-white">
              {settingsMenuItems.map(renderMenuItem)}
            </View>
          </View>

          {/* Support Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wider px-4 mb-2">
              Hỗ trợ
            </Text>
            <View className="bg-white">
              {supportMenuItems.map(renderMenuItem)}
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-4 mt-2 mb-6">
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 bg-red-50 rounded-xl"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color="#EF4444" />
            <Text className="ml-2 text-base font-semibold text-red-500">
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View className="items-center pb-6">
          <Text className="text-xs text-gray-400">Phiên bản 1.0.0</Text>
        </View>

        {/* Debug Component - Remove in production */}
        {__DEV__ && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wider px-4 mb-2">
              Debug Authentication (Dev Only)
            </Text>
            <AuthMobileDebug />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

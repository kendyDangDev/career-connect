import AnimatedTabBar from "@/components/AnimatedTabBar";
import { Tabs } from "expo-router";
import { Bell, Book, Briefcase, Clipboard, Home, User } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Home size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Việc làm",
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size || 24} color={color} />
          ),
        }}
      />
        {/* <Tabs.Screen
          name="create-cv"
          options={{
            title: "Tạo CV",
            tabBarIcon: ({ color, size }) => (
              <Book size={size || 24} color={color} />
            ),
          }}
        /> */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
          tabBarIcon: ({ color, size }) => (
            <Bell size={size || 24} color={color} />
          ),
        }}
      />
            <Tabs.Screen
        name="saved-jobs"
        options={{
          title: "Yêu thích",
          tabBarIcon: ({ color, size }) => (
            <Clipboard size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color, size }) => (
            <User size={size || 24} color={color} />
          ),
        }}
      />

      {/* Hidden tabs */}
      <Tabs.Screen
        name="top-connect"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

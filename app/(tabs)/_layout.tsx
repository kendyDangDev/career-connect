import AnimatedTabBar from "@/components/AnimatedTabBar";
import { Tabs } from "expo-router";
import {
  Briefcase,
  Home,
  Mail,
  MessageCircle,
  User,
} from "lucide-react-native";
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
          title: "Trang Chủ",
          tabBarIcon: ({ color, size }) => (
            <Home size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Việc Làm",
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cv-management"
        options={{
          title: "CV Của Tôi",
          tabBarIcon: ({ color, size }) => (
            <Mail size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Tin nhắn",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle size={size || 24} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông Báo",
          tabBarIcon: ({ color, size }) => (
            <User size={size || 24} color={color} />
          ),
        }}
      /> */}
      {/* <Tabs.Screen
        name="saved-jobs"
        options={{
          title: "Yêu thích",
          tabBarIcon: ({ color, size }) => (
            <Clipboard size={size || 24} color={color} />
          ),
        }}
      /> */}
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

import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Users, Briefcase, Building2, TrendingUp } from "lucide-react-native";

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: string;
}

const stats: Stat[] = [
  {
    id: "1",
    label: "Việc làm đang tuyển",
    value: "15K+",
    icon: Briefcase,
    trend: "+12%",
  },
  {
    id: "2",
    label: "Công ty tuyển dụng",
    value: "3.2K",
    icon: Building2,
    trend: "+8%",
  },
  {
    id: "3",
    label: "Ứng viên tìm việc",
    value: "250K+",
    icon: Users,
    trend: "+25%",
  },
  {
    id: "4",
    label: "Được tuyển tháng này",
    value: "5.8K",
    icon: TrendingUp,
    trend: "+18%",
  },
];

const StatsSection: React.FC = () => {
  return (
    <View className="relative my-6 mx-4 rounded-2xl overflow-hidden">
      {/* Main gradient background */}
      <LinearGradient
        colors={["#a855f7", "#9333ea", "#7e22ce"]} // Purple gradient from config
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      {/* Decorative elements */}
      <View className="absolute top-4 right-4 w-24 h-24 bg-white/5 rounded-full" />
      <View className="absolute -top-2 -left-2 w-16 h-16 bg-purple-300/10 rounded-full" />
      <View className="absolute bottom-6 left-8 w-12 h-12 bg-indigo-300/10 rounded-full" />

      {/* Content */}
      <View className="relative z-10 py-8 px-6">
        {/* Header with enhanced styling */}
        <View className="items-center mb-8">
          <View className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 mb-3 border border-white/20 shadow-glow-purple">
            <Text className="text-white text-2xl font-bold text-center tracking-wide">
              Vietnam&apos;s #1 Job Platform
            </Text>
          </View>
          <Text className="text-purple-100 text-base text-center leading-6 font-medium max-w-xs">
            Kết nối tài năng với cơ hội việc làm toàn quốc
          </Text>

          {/* Decorative line */}
          <View className="mt-4 w-20 h-1 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full opacity-60" />
        </View>

        {/* Stats grid with enhanced design */}
        <View className="flex-row flex-wrap -mx-2">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View key={stat.id} className="w-1/2 px-2 mb-4">
                <View className="relative">
                  {/* Glass morphism background */}
                  <View className="absolute inset-0 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/30 shadow-soft" />

                  {/* Subtle gradient overlay */}
                  <LinearGradient
                    colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0 rounded-2xl"
                  />

                  {/* Content */}
                  <View className="relative z-10 p-5">
                    {/* Icon and trend row */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="bg-white/20 backdrop-blur-xs rounded-xl p-3 shadow-soft">
                        <IconComponent size={22} color="#FFFFFF" />
                      </View>
                      {stat.trend && (
                        <View className="bg-green-400/20 backdrop-blur-xs rounded-full px-3 py-1.5 border border-green-300/30">
                          <Text className="text-green-200 text-xs font-bold tracking-wider">
                            {stat.trend}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Value with gradient text effect */}
                    <Text className="text-white text-3xl font-bold mb-2 tracking-tight">
                      {stat.value}
                    </Text>

                    {/* Label */}
                    <Text className="text-purple-100 text-sm font-medium leading-5">
                      {stat.label}
                    </Text>

                    {/* Bottom accent line */}
                    <View className="mt-3 w-full h-0.5 bg-gradient-to-r from-purple-300/40 to-transparent rounded-full" />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bottom decorative element */}
        <View className="mt-4 items-center">
          <View className="flex-row space-x-2">
            <View className="w-2 h-2 bg-purple-200/60 rounded-full animate-pulse" />
            <View
              className="w-2 h-2 bg-indigo-200/60 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
            <View
              className="w-2 h-2 bg-purple-200/60 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default StatsSection;

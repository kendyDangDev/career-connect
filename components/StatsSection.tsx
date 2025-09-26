import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Briefcase, Building2, TrendingUp } from 'lucide-react-native';

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: string;
}

const stats: Stat[] = [
  {
    id: '1',
    label: 'Active Jobs',
    value: '15K+',
    icon: Briefcase,
    trend: '+12%',
  },
  {
    id: '2',
    label: 'Companies',
    value: '3.2K',
    icon: Building2,
    trend: '+8%',
  },
  {
    id: '3',
    label: 'Job Seekers',
    value: '250K+',
    icon: Users,
    trend: '+25%',
  },
  {
    id: '4',
    label: 'Hired This Month',
    value: '5.8K',
    icon: TrendingUp,
    trend: '+18%',
  },
];

const StatsSection: React.FC = () => {
  return (
    <LinearGradient
      colors={['#1E40AF', '#2563EB', '#3B82F6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="py-8 my-6"
    >
      <View className="px-4">
        <Text className="text-white text-xl font-bold text-center mb-2">
          Vietnam's #1 Job Platform
        </Text>
        <Text className="text-white/80 text-sm text-center mb-6">
          Connecting talent with opportunities nationwide
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <View key={stat.id} className="w-1/2 px-2 mb-4">
                <View className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <View className="flex-row items-center mb-2">
                    <View className="bg-white/20 rounded-lg p-2 mr-3">
                      <IconComponent size={20} color="#FFFFFF" />
                    </View>
                    {stat.trend && (
                      <View className="bg-green-500/20 rounded-full px-2 py-1">
                        <Text className="text-green-300 text-xs font-semibold">
                          {stat.trend}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-white text-2xl font-bold mb-1">
                    {stat.value}
                  </Text>
                  <Text className="text-white/70 text-sm">
                    {stat.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
};

export default StatsSection;

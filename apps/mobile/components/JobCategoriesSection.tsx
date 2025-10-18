import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  Code, 
  Palette, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Heart,
  Briefcase,
  GraduationCap,
  ChevronRight
} from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  jobCount: number;
  color: string;
  bgColor: string;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Technology',
    icon: Code,
    jobCount: 2845,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
  },
  {
    id: '2',
    name: 'Design',
    icon: Palette,
    jobCount: 1523,
    color: '#8B5CF6',
    bgColor: '#F3E8FF',
  },
  {
    id: '3',
    name: 'Marketing',
    icon: TrendingUp,
    jobCount: 1876,
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
  {
    id: '4',
    name: 'HR & Admin',
    icon: Users,
    jobCount: 932,
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    id: '5',
    name: 'Finance',
    icon: DollarSign,
    jobCount: 1234,
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
  {
    id: '6',
    name: 'Healthcare',
    icon: Heart,
    jobCount: 756,
    color: '#EC4899',
    bgColor: '#FCE7F3',
  },
  {
    id: '7',
    name: 'Business',
    icon: Briefcase,
    jobCount: 2103,
    color: '#6366F1',
    bgColor: '#EEF2FF',
  },
  {
    id: '8',
    name: 'Education',
    icon: GraduationCap,
    jobCount: 543,
    color: '#14B8A6',
    bgColor: '#CCFBF1',
  },
];

interface JobCategoriesSectionProps {
  onCategoryPress?: (categoryId: string) => void;
  onSeeAllPress?: () => void;
}

const JobCategoriesSection: React.FC<JobCategoriesSectionProps> = ({
  onCategoryPress,
  onSeeAllPress,
}) => {
  return (
    <View className="bg-white py-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between px-4 mb-4">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            Browse by Category
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Find jobs in your field
          </Text>
        </View>
        <TouchableOpacity
          onPress={onSeeAllPress}
          className="flex-row items-center"
          activeOpacity={0.7}
        >
          <Text className="text-blue-600 font-medium text-sm mr-1">
            View All
          </Text>
          <ChevronRight size={16} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Categories Grid */}
      <View className="px-4">
        <View className="flex-row flex-wrap -mx-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <View key={category.id} className="w-1/2 px-2 mb-4">
                <TouchableOpacity
                  onPress={() => onCategoryPress?.(category.id)}
                  className="bg-white rounded-xl border border-gray-100 p-4"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View 
                      className="w-12 h-12 rounded-xl justify-center items-center mr-3"
                      style={{ backgroundColor: category.bgColor }}
                    >
                      <IconComponent size={24} color={category.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold text-sm">
                        {category.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">
                        {category.jobCount.toLocaleString()} jobs
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default JobCategoriesSection;

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { 
  Heart, 
  GraduationCap, 
  Home, 
  DollarSign, 
  Coffee,
  Plane,
  Dumbbell,
  Monitor,
  Shield,
  Calendar,
  Gift,
  Clock
} from 'lucide-react-native';

interface CompanyBenefitsSectionProps {
  benefits: string[];
}

const CompanyBenefitsSection: React.FC<CompanyBenefitsSectionProps> = ({ benefits }) => {
  const getBenefitIcon = (benefit: string) => {
    const lowerBenefit = benefit.toLowerCase();
    
    if (lowerBenefit.includes('health') || lowerBenefit.includes('insurance')) {
      return { icon: Heart, color: '#EF4444' };
    }
    if (lowerBenefit.includes('learning') || lowerBenefit.includes('development') || lowerBenefit.includes('training')) {
      return { icon: GraduationCap, color: '#8B5CF6' };
    }
    if (lowerBenefit.includes('remote') || lowerBenefit.includes('work from home') || lowerBenefit.includes('flexible')) {
      return { icon: Home, color: '#10B981' };
    }
    if (lowerBenefit.includes('salary') || lowerBenefit.includes('bonus') || lowerBenefit.includes('13th')) {
      return { icon: DollarSign, color: '#F59E0B' };
    }
    if (lowerBenefit.includes('snack') || lowerBenefit.includes('beverage') || lowerBenefit.includes('coffee')) {
      return { icon: Coffee, color: '#6366F1' };
    }
    if (lowerBenefit.includes('trip') || lowerBenefit.includes('travel') || lowerBenefit.includes('vacation')) {
      return { icon: Plane, color: '#06B6D4' };
    }
    if (lowerBenefit.includes('gym') || lowerBenefit.includes('fitness') || lowerBenefit.includes('sport')) {
      return { icon: Dumbbell, color: '#EC4899' };
    }
    if (lowerBenefit.includes('equipment') || lowerBenefit.includes('macbook') || lowerBenefit.includes('laptop')) {
      return { icon: Monitor, color: '#3B82F6' };
    }
    if (lowerBenefit.includes('annual') || lowerBenefit.includes('leave')) {
      return { icon: Calendar, color: '#84CC16' };
    }
    if (lowerBenefit.includes('team') || lowerBenefit.includes('building') || lowerBenefit.includes('event')) {
      return { icon: Gift, color: '#F97316' };
    }
    if (lowerBenefit.includes('hour') || lowerBenefit.includes('time')) {
      return { icon: Clock, color: '#A855F7' };
    }
    
    return { icon: Shield, color: '#6B7280' };
  };

  if (!benefits || benefits.length === 0) {
    return null;
  }

  return (
    <View className="bg-white mx-4 mb-4 p-4 rounded-2xl shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-4">Benefits & Perks</Text>
      
      <View className="flex-row flex-wrap">
        {benefits.map((benefit, index) => {
          const { icon: Icon, color } = getBenefitIcon(benefit);
          return (
            <View
              key={index}
              className="w-1/2 pr-2 mb-3"
            >
              <View className="flex-row items-start">
                <View 
                  className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon size={16} color={color} />
                </View>
                <Text className="text-sm text-gray-700 flex-1" numberOfLines={2}>
                  {benefit}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default CompanyBenefitsSection;
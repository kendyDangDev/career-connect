import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, Globe, MapPin, Phone, Mail, Building2 } from 'lucide-react-native';

interface CompanyAboutSectionProps {
  company: {
    description: string;
    foundedYear: number;
    address: string;
    city: string;
    province: string;
    country: string;
    phone: string;
    email: string;
    websiteUrl: string;
  };
}

const CompanyAboutSection: React.FC<CompanyAboutSectionProps> = ({ company }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = company.description.length > 200;
  const displayDescription = isExpanded || !shouldTruncate 
    ? company.description 
    : company.description.slice(0, 200) + '...';

  return (
    <View className="bg-white mx-4 mb-4 p-4 rounded-2xl shadow-sm border border-gray-100">
      <Text className="text-lg font-bold text-gray-900 mb-4">About Company</Text>
      
      {/* Description */}
      <View className="mb-4">
        <Text className="text-gray-700 leading-6">
          {displayDescription}
        </Text>
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} className="mt-2">
            <Text className="text-blue-600 font-medium">
              {isExpanded ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Company Details Grid */}
      <View className="border-t border-gray-100 pt-4">
        <View className="space-y-3">
          {/* Founded Year */}
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center mr-3">
              <Calendar size={16} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Founded</Text>
              <Text className="text-sm font-medium text-gray-900">{company.foundedYear}</Text>
            </View>
          </View>

          {/* Location */}
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-green-50 items-center justify-center mr-3">
              <MapPin size={16} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Location</Text>
              <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
                {[company.address, company.city, company.province, company.country]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
          </View>

          {/* Phone */}
          {company.phone && (
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-purple-50 items-center justify-center mr-3">
                <Phone size={16} color="#9333EA" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Phone</Text>
                <Text className="text-sm font-medium text-gray-900">{company.phone}</Text>
              </View>
            </View>
          )}

          {/* Email */}
          {company.email && (
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-orange-50 items-center justify-center mr-3">
                <Mail size={16} color="#F97316" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Email</Text>
                <Text className="text-sm font-medium text-gray-900">{company.email}</Text>
              </View>
            </View>
          )}

          {/* Website */}
          {company.websiteUrl && (
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-cyan-50 items-center justify-center mr-3">
                <Globe size={16} color="#06B6D4" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Website</Text>
                <Text className="text-sm font-medium text-blue-600" numberOfLines={1}>
                  {company.websiteUrl.replace(/^https?:\/\//, '')}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default CompanyAboutSection;
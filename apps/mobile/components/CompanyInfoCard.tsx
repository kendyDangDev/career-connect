import React from "react";
import { View, Text, TouchableOpacity, Image, Linking } from "react-native";
import { ExternalLink, MapPin, CheckCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Company } from "../types/job";

interface CompanyInfoCardProps {
  company: Company;
  onPress?: () => void;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({
  company,
  onPress,
}) => {
  const router = useRouter();
  
  // Safe check for company data
  if (!company) {
    return null;
  }

  const handleWebsitePress = async () => {
    if (company.website) {
      try {
        const canOpen = await Linking.canOpenURL(company.website);
        if (canOpen) {
          await Linking.openURL(company.website);
        }
      } catch (error) {
        console.error("Error opening website:", error);
      }
    }
  };
  
  const handleCompanyPress = () => {
    if (onPress) {
      onPress();
    } else if (company.companySlug) {
      // Navigate to company profile if no custom onPress handler
      router.push(`/company/${company.companySlug}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleCompanyPress}
      className="bg-white rounded-2xl mx-4 mb-4 p-6 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        {/* Company Logo */}
        <View className="w-16 h-16 rounded-xl bg-gray-100 justify-center items-center mr-4">
          {company.logoUrl ? (
            <Image
              source={{ uri: company?.logoUrl }}
              className="w-14 h-14 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-gray-500 font-bold text-xl">
              {company.companyName?.charAt(0)?.toUpperCase() || 'C'}
            </Text>
          )}
        </View>

        {/* Company Info */}
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-bold text-gray-900 flex-1">
              {company.companyName || 'Unknown Company'}
            </Text>

            {company.verificationStatus === "VERIFIED" && (
              <View className="flex-row items-center ml-2">
                <CheckCircle size={16} color="#10B981" />
                <Text className="text-green-600 text-xs font-medium ml-1">
                  Verified
                </Text>
              </View>
            )}
          </View>

          {/* Location */}
          {(company.city || company.province) && (
            <View className="flex-row items-center mb-2">
              <MapPin size={14} color="#6B7280" />
              <Text className="text-gray-500 text-sm ml-1">
                {[company.city, company.province].filter(Boolean).join(", ")}
              </Text>
            </View>
          )}

          {/* Website */}
          {company.website && (
            <TouchableOpacity
              onPress={handleWebsitePress}
              className="flex-row items-center mt-2"
              activeOpacity={0.7}
            >
              <ExternalLink size={14} color="#2563EB" />
              <Text className="text-blue-600 text-sm ml-1 font-medium">
                Visit Website
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Verification Status Description */}
      {company.verificationStatus === "VERIFIED" && (
        <View className="mt-4 pt-4 border-t border-gray-100">
          <Text className="text-gray-600 text-sm">
            This company has been verified by our team. You can trust that this
            job posting is legitimate.
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CompanyInfoCard;

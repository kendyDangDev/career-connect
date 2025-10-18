import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import companyService from "../services/companyService";

interface Company {
  id: string;
  companySlug: string;
  companyName: string;
  logoUrl: string;
  activeJobCount: number;
  verificationStatus: string;
}

interface TopCompaniesSectionProps {
  onCompanyPress?: (company: Company) => void;
  onSeeAllPress?: () => void;
}

const TopCompaniesSection: React.FC<TopCompaniesSectionProps> = ({
  onCompanyPress,
  onSeeAllPress,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await companyService.getTopCompanies(8); // Get 8 companies for display

      if (response.success && response.data) {
        // Transform the data to match our component interface
        const transformedCompanies: Company[] = response.data.map(
          (company) => ({
            id: company.id,
            companySlug: company.companySlug,
            companyName: company.companyName,
            logoUrl: company.logoUrl,
            activeJobCount: company.activeJobCount,
            verificationStatus: company.verificationStatus,
          })
        );

        setCompanies(transformedCompanies);
      } else {
        setError(response.message || "Failed to load companies");
      }
    } catch (err) {
      console.error("[TopCompaniesSection] Error fetching companies:", err);
      setError("Unable to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopCompanies();
  }, []);

  const handleRetry = () => {
    fetchTopCompanies();
  };

  if (loading) {
    return (
      <View className="bg-white py-6">
        {/* Section Header */}
        <View className="flex-row items-center justify-between px-4 mb-4">
          <View>
            <Text className="text-xl font-bold text-gray-900">
              Top Companies
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Trusted employers with verified profiles
            </Text>
          </View>
        </View>

        {/* Loading State */}
        <View className="flex-1 justify-center items-center py-12">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-500 mt-2">Loading companies...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white py-6">
        {/* Section Header */}
        <View className="flex-row items-center justify-between px-4 mb-4">
          <View>
            <Text className="text-xl font-bold text-gray-900">
              Top Companies
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Trusted employers with verified profiles
            </Text>
          </View>
        </View>

        {/* Error State */}
        <View className="flex-1 justify-center items-center py-12 px-4">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-gray-900 font-medium mt-3 text-center">
            Unable to load companies
          </Text>
          <Text className="text-gray-500 mt-1 text-center">{error}</Text>
          <TouchableOpacity
            onPress={handleRetry}
            className="flex-row items-center bg-blue-600 px-4 py-2 rounded-lg mt-4"
            activeOpacity={0.7}
          >
            <RefreshCw size={16} color="#FFFFFF" />
            <Text className="text-white font-medium ml-2">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="py-6 px-4">
      {/* Section Header with Gradient */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text">
            Công ty hàng đầu
          </Text>
          <Text className="text-purple-500 mt-1 font-medium">
            Nhà tuyển dụng uy tín với hồ sơ đã xác thực
          </Text>
          <View className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mt-2" />
        </View>
        <TouchableOpacity
          onPress={onSeeAllPress}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 rounded-full shadow-glow-purple"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Text className="text-white font-semibold text-sm mr-1">
              Xem tất cả
            </Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Companies Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        className="mt-2"
      >
        {companies.map((company, index) => (
          <TouchableOpacity
            key={company.id}
            onPress={() => onCompanyPress?.(company)}
            className="mr-4 items-center"
            activeOpacity={0.8}
          >
            {/* Company Card with Glass Effect */}
            <View className="relative w-28 h-28 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 shadow-soft justify-center items-center mb-3 overflow-hidden">
              {/* Gradient overlay */}
              <View className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-purple-100/30 to-transparent rounded-bl-full" />

              <Image
                source={{ uri: company.logoUrl }}
                className="w-16 h-16 rounded-xl relative z-10"
                resizeMode="cover"
              />

              {/* Verification Badge */}
              {company.verificationStatus === "VERIFIED" && (
                <View className="absolute top-2 right-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full p-1 shadow-glow">
                  <CheckCircle size={12} color="#FFFFFF" />
                </View>
              )}

              {/* Glow effect for featured companies */}
              {index < 3 && (
                <View className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-indigo-400/10 rounded-2xl" />
              )}
            </View>

            {/* Company Info */}
            <Text
              className="text-sm font-semibold text-purple-700 text-center max-w-24"
              numberOfLines={1}
            >
              {company.companyName}
            </Text>
            <View className="bg-purple-50 px-2 py-1 rounded-full mt-1">
              <Text className="text-xs text-purple-600 font-medium">
                {company.activeJobCount} việc làm
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default TopCompaniesSection;

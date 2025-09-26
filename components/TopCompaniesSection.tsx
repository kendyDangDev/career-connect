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
    <View className="bg-white py-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between px-4 mb-4">
        <View>
          <Text className="text-xl font-bold text-gray-900">Top Companies</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Trusted employers with verified profiles
          </Text>
        </View>
        <TouchableOpacity
          onPress={onSeeAllPress}
          className="flex-row items-center"
          activeOpacity={0.7}
        >
          <Text className="text-blue-600 font-medium text-sm mr-1">
            See All
          </Text>
          <ChevronRight size={16} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Companies Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {companies.map((company) => (
          <TouchableOpacity
            key={company.id}
            onPress={() => onCompanyPress?.(company)}
            className="mr-4 items-center"
            activeOpacity={0.7}
          >
            <View className="w-24 h-24 bg-white rounded-2xl border border-gray-200 shadow-sm justify-center items-center mb-2">
              <Image
                source={{ uri: company.logoUrl }}
                className="w-16 h-16 rounded-xl"
                resizeMode="cover"
              />
              {company.verificationStatus === "VERIFIED" && (
                <View className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                  <CheckCircle size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text
              className="text-sm font-medium text-gray-900 text-center"
              numberOfLines={1}
            >
              {company.companyName}
            </Text>
            <Text className="text-xs text-gray-500">
              {company.activeJobCount} jobs
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default TopCompaniesSection;

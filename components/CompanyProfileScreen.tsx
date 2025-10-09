import { useAlert } from "@/contexts/AlertContext";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import companyService from "../services/companyService";
import CompanyAboutSection from "./company/CompanyAboutSection";
import CompanyBenefitsSection from "./company/CompanyBenefitsSection";
import CompanyGallerySection from "./company/CompanyGallerySection";
import CompanyHeader from "./company/CompanyHeader";
import CompanyJobsSection from "./company/CompanyJobsSection";
import CompanyMapSection from "./company/CompanyMapSection";
import CompanyReviewsSection from "./company/CompanyReviewsSection";

// Skeleton Loading Components
const SkeletonBox: React.FC<{
  width?: string;
  height?: string;
  className?: string;
}> = ({ width = "w-full", height = "h-4", className = "" }) => (
  <View
    className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`}
  />
);

const JobsSkeleton: React.FC = () => (
  <View className="bg-white mx-4 mb-4 p-4 rounded-xl">
    <SkeletonBox width="w-32" height="h-6" className="mb-4" />
    {[1, 2, 3].map((item) => (
      <View key={item} className="mb-4 last:mb-0">
        <SkeletonBox width="w-3/4" height="h-5" className="mb-2" />
        <SkeletonBox width="w-1/2" height="h-4" className="mb-2" />
        <SkeletonBox width="w-1/4" height="h-4" />
      </View>
    ))}
  </View>
);

interface CompanyProfileScreenProps {
  companySlug: string;
}

const CompanyProfileScreen: React.FC<CompanyProfileScreenProps> = ({
  companySlug,
}) => {
  const router = useRouter();
  const alert = useAlert();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Chi tiết loading states cho từng phần
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingFollowStatus, setIsLoadingFollowStatus] = useState(true);

  const fetchFollowStatus = useCallback(async (companyId: string) => {
    try {
      setIsLoadingFollowStatus(true);
      console.log(
        "[CompanyProfileScreen] Fetching follow status for company:",
        companyId
      );
      const followStatusResponse =
        await companyService.checkFollowStatus(companyId);

      if (followStatusResponse.success && followStatusResponse.data) {
        setIsFollowing(followStatusResponse.data.isFollowing);
        console.log(
          "[CompanyProfileScreen] Follow status:",
          followStatusResponse.data.isFollowing
        );
      } else {
        // If not authenticated or error, default to not following
        setIsFollowing(false);
        console.log(
          "[CompanyProfileScreen] Not authenticated or error, setting isFollowing to false"
        );
      }
    } catch (error) {
      console.error(
        "[CompanyProfileScreen] Error checking follow status:",
        error
      );
      setIsFollowing(false);
    } finally {
      setIsLoadingFollowStatus(false);
    }
  }, []);

  // Fetch company profile (chính, hiển thị UI ngay)
  const fetchCompanyProfile = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        console.log("[CompanyProfileScreen] Fetching company profile...");
        const profileResponse =
          await companyService.getPublicCompanyProfile(companySlug);

        if (profileResponse.success && profileResponse.data) {
          setCompany(profileResponse.data);
          console.log(
            "[CompanyProfileScreen] Company profile loaded, UI can render now"
          );
          return profileResponse.data;
        } else {
          throw new Error("Failed to fetch company profile");
        }
      } catch (err) {
        console.error("Error fetching company profile:", err);
        setError("Company not found or failed to load");
        return null;
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [companySlug]
  );

  // Fetch company jobs (phụ, load sau)
  const fetchCompanyJobs = useCallback(async () => {
    try {
      setIsLoadingJobs(true);
      console.log("[CompanyProfileScreen] Fetching company jobs...");
      const jobsResponse = await companyService.getCompanyJobs(companySlug);
      if (jobsResponse.success && jobsResponse.data) {
        setJobs(jobsResponse.data.jobs);
        console.log(
          "[CompanyProfileScreen] Company jobs loaded:",
          jobsResponse.data.jobs.length
        );
      }
    } catch (err) {
      console.error("Error fetching company jobs:", err);
      // Không set error cho jobs vì nó không quan trọng bằng company profile
    } finally {
      setIsLoadingJobs(false);
    }
  }, [companySlug]);

  // Load tất cả dữ liệu (gọi khi khởi tạo và refresh)
  const fetchAllData = useCallback(
    async (showRefresh = false) => {
      // 1. Load company profile trước (blocking - cần thiết để hiển thị UI)
      const companyData = await fetchCompanyProfile(showRefresh);

      if (companyData) {
        // 2. Load jobs và follow status song song (non-blocking)
        Promise.all([
          fetchCompanyJobs(),
          fetchFollowStatus(companyData.id),
        ]).catch((err) => {
          console.error("Error in parallel data loading:", err);
        });
      }
    },
    [fetchCompanyProfile, fetchCompanyJobs, fetchFollowStatus]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleBackPress = () => {
    router.back();
  };

  const handleFollowPress = async () => {
    if (!company || isLoadingFollowStatus) return;

    try {
      setIsLoadingFollowStatus(true);
      console.log(
        "[CompanyProfileScreen] Toggling follow for company:",
        company.id,
        "Currently following:",
        isFollowing
      );

      const response = await companyService.toggleFollowCompany(
        company.id,
        isFollowing
      );
      if (response.success) {
        console.log(
          "[CompanyProfileScreen] Follow toggle successful, refreshing follow status"
        );

        // Update follow status and follower count immediately for better UX
        setIsFollowing(!isFollowing);
        setCompany((prev: any) => ({
          ...prev,
          followerCount: isFollowing
            ? Math.max(0, prev.followerCount - 1) // Prevent negative numbers
            : prev.followerCount + 1,
        }));

        // Show success message
        alert.success(
          "Success",
          isFollowing ? "Unfollowed successfully" : "Followed successfully"
        );
      } else {
        console.log(
          "[CompanyProfileScreen] Follow toggle failed:",
          response.message
        );
        alert.warning(
          "Action Required",
          response.message || "Please login to follow this company",
          () => router.push("/(auth)/login")
        );
      }
    } catch (error) {
      console.error("[CompanyProfileScreen] Error toggling follow:", error);
      alert.error("Error", "Failed to update follow status. Please try again.");
    } finally {
      setIsLoadingFollowStatus(false);
    }
  };

  const handleWebsitePress = async () => {
    if (!company?.websiteUrl) return;

    try {
      const canOpen = await Linking.canOpenURL(company.websiteUrl);
      if (canOpen) {
        await Linking.openURL(company.websiteUrl);
      }
    } catch (error) {
      console.error("Error opening website:", error);
      alert.error("Error", "Could not open website");
    }
  };

  const handleSeeAllJobs = () => {
    // Navigate to a dedicated jobs listing page for this company
    router.push(`/company/${companySlug}/jobs`);
  };

  const onRefresh = useCallback(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-3">Loading company profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !company) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-4">
            <Text className="text-3xl">⚠️</Text>
          </View>
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Company Not Found
          </Text>
          <Text className="text-gray-600 text-center mb-6">{error}</Text>
          <TouchableOpacity
            onPress={handleBackPress}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!company) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
      >
        {/* Company Header with Cover, Logo, and Stats */}
        <CompanyHeader
          company={company}
          isFollowing={isFollowing}
          onBackPress={handleBackPress}
          onFollowPress={handleFollowPress}
          onWebsitePress={handleWebsitePress}
        />

        {/* Company Gallery */}
        {company.galleryImages && company.galleryImages.length > 0 && (
          <CompanyGallerySection
            images={company.galleryImages}
            companyName={company.companyName}
          />
        )}

        {/* About Company */}
        <CompanyAboutSection company={company} />

        {/* Benefits & Perks */}
        {company.benefits && company.benefits.length > 0 && (
          <CompanyBenefitsSection benefits={company.benefits} />
        )}

        {/* Open Positions */}
        {isLoadingJobs ? (
          <JobsSkeleton />
        ) : (
          <CompanyJobsSection jobs={jobs} onSeeAllPress={handleSeeAllJobs} />
        )}

        {/* Company Reviews */}
        <CompanyReviewsSection
          companyId={company.id || company._id || ""}
          companySlug={company.slug || companySlug}
          companyName={company.companyName}
        />

        {/* Office Location Map */}
        <CompanyMapSection company={company} />

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompanyProfileScreen;

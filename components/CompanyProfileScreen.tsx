import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScrollView, 
  View, 
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAlert } from '@/contexts/AlertContext';
import CompanyHeader from './company/CompanyHeader';
import CompanyAboutSection from './company/CompanyAboutSection';
import CompanyJobsSection from './company/CompanyJobsSection';
import CompanyGallerySection from './company/CompanyGallerySection';
import CompanyBenefitsSection from './company/CompanyBenefitsSection';
import CompanyMapSection from './company/CompanyMapSection';
import CompanyReviewsSection from './company/CompanyReviewsSection';
import companyService from '../services/companyService';


interface CompanyProfileScreenProps {
  companySlug: string;
}

const CompanyProfileScreen: React.FC<CompanyProfileScreenProps> = ({ companySlug }) => {
  const router = useRouter();
  const alert = useAlert();
  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchFollowStatus = useCallback(async (companyId: string) => {
    try {
      console.log('[CompanyProfileScreen] Fetching follow status for company:', companyId);
      const followStatusResponse = await companyService.checkFollowStatus(companyId);
      
      if (followStatusResponse.success && followStatusResponse.data) {
        setIsFollowing(followStatusResponse.data.isFollowing);
        console.log('[CompanyProfileScreen] Follow status:', followStatusResponse.data.isFollowing);
      } else {
        // If not authenticated or error, default to not following
        setIsFollowing(false);
        console.log('[CompanyProfileScreen] Not authenticated or error, setting isFollowing to false');
      }
    } catch (error) {
      console.error('[CompanyProfileScreen] Error checking follow status:', error);
      setIsFollowing(false);
    }
  }, []);

  const fetchCompanyData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Fetch company profile
      const profileResponse = await companyService.getPublicCompanyProfile(companySlug);
      
      if (profileResponse.success && profileResponse.data) {
        setCompany(profileResponse.data);
        
        // Fetch company jobs using company slug instead of ID
        const jobsResponse = await companyService.getCompanyJobs(companySlug);
        if (jobsResponse.success && jobsResponse.data) {
          setJobs(jobsResponse.data.jobs);
        }

        // Check follow status for the company
        await fetchFollowStatus(profileResponse.data.id);
      } 
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(null); // Don't show error when using mock data
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [companySlug, fetchFollowStatus]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleBackPress = () => {
    router.back();
  };

  const handleFollowPress = async () => {
    if (!company) return;

    try {
      console.log('[CompanyProfileScreen] Toggling follow for company:', company.id, 'Currently following:', isFollowing);
      
      const response = await companyService.toggleFollowCompany(company.id, isFollowing);
      if (response.success) {
        console.log('[CompanyProfileScreen] Follow toggle successful, refreshing follow status');
        
        // Refresh follow status from server to ensure accuracy
        await fetchFollowStatus(company.id);
        
        // Update follower count locally
        setCompany((prev: any) => ({
          ...prev,
          followerCount: isFollowing 
            ? Math.max(0, prev.followerCount - 1)  // Prevent negative numbers
            : prev.followerCount + 1
        }));

        // Show success message
        alert.success(
          'Success', 
          isFollowing ? 'Unfollowed successfully' : 'Followed successfully'
        );
      } else {
        console.log('[CompanyProfileScreen] Follow toggle failed:', response.message);
        alert.warning(
          'Action Required',
          response.message || 'Please login to follow this company',
          () => router.push('/(auth)/login')
        );
      }
    } catch (error) {
      console.error('[CompanyProfileScreen] Error toggling follow:', error);
      alert.error('Error', 'Failed to update follow status. Please try again.');
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
      console.error('Error opening website:', error);
      alert.error('Error', 'Could not open website');
    }
  };

  const handleSeeAllJobs = () => {
    // Navigate to a dedicated jobs listing page for this company
    router.push(`/company/${companySlug}/jobs`);
  };

  const onRefresh = useCallback(() => {
    fetchCompanyData(true);
  }, [fetchCompanyData]);

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
          <Text className="text-gray-600 text-center mb-6">
            {error}
          </Text>
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
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
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
        <CompanyJobsSection
          jobs={jobs}
          onSeeAllPress={handleSeeAllJobs}
        />

        {/* Company Reviews */}
        <CompanyReviewsSection
          companyId={company.id || company._id || ''}
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
import React, { useState, useEffect } from "react";
import { ScrollView, View, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import JobDetailHeader from "./JobDetailHeader";
import CompanyInfoCard from "./CompanyInfoCard";
import JobSkillsSection from "./JobSkillsSection";
import JobDescriptionSection from "./JobDescriptionSection";
import ApplyButton from "./ApplyButton";
import { JobDetailLoadingState, JobDetailErrorState } from "./JobStates";
import { Job } from "../types/job";
import jobService from "../services/jobService";
import JobApplyModal from "./job/JobApplyModal";

interface JobDetailScreenProps {
  jobId: string;
  onBack: () => void;
  onApply?: (job: Job) => void;
}

const JobDetailScreen: React.FC<JobDetailScreenProps> = ({
  jobId,
  onBack,
  onApply,
}) => {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await jobService.getJobById(jobId);

      if (response.success) {
        // API returns data directly for single job, not in jobs array
        setJob(response.data);
      } else {
        throw new Error(response.message || "Failed to load job details");
      }
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const handleFavoritePress = (jobId: string, isFavorited: boolean) => {
    // TODO: Implement save/unsave job functionality
    console.log(`Job ${jobId} ${isFavorited ? "saved" : "unsaved"}`);
  };

  const handleSharePress = async (job: Job) => {
    try {
      const message = `Check out this job: ${job.title} at ${job.company.companyName}`;
      const url = `https://yourapp.com/jobs/${job.slug || job.id}`;

      await Share.share({
        message: `${message}\n\n${url}`,
        title: job.title,
        url: url,
      });
    } catch (error) {
      console.error("Error sharing job:", error);
    }
  };

  const handleApplyPress = () => {
    if (!job) return;
    setShowApplyModal(true);
  };

  const handleApplySuccess = () => {
    // Called when application is successfully submitted
    onApply?.(job!);
    console.log("Successfully applied for job:", job?.title);
  };

  const handleCompanyPress = () => {
    if (!job) return;
    if (job.company.companySlug) {
      router.push(`/company/${job.company.companySlug}`);
    } else {
      console.log("Company slug not available:", job.company.companyName);
    }
  };

  if (loading) {
    return <JobDetailLoadingState />;
  }

  if (error || !job) {
    return (
      <JobDetailErrorState
        error={error || "Job not found"}
        onRetry={fetchJobDetails}
        onBack={onBack}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Space for floating button
      >
        <JobDetailHeader
          job={job}
          onBackPress={onBack}
          onFavoritePress={handleFavoritePress}
          onSharePress={handleSharePress}
        />

        <View className="mt-4">
          <CompanyInfoCard company={job.company} onPress={handleCompanyPress} />

          {job.jobSkills && job.jobSkills.length > 0 && (
            <JobSkillsSection skills={job.jobSkills} />
          )}

          <JobDescriptionSection
            description={job.description}
            requirements={job.requirements}
            benefits={job.benefits}
            fullContent={job.fullContent}
          />
        </View>
      </ScrollView>

      <ApplyButton
        deadline={job.applicationDeadline}
        applicationCount={job.applicationCount}
        onApply={handleApplyPress}
      />

      {/* Job Apply Modal */}
      <JobApplyModal
        visible={showApplyModal}
        job={job}
        onClose={() => setShowApplyModal(false)}
        onSuccess={handleApplySuccess}
      />
    </SafeAreaView>
  );
};

export default JobDetailScreen;

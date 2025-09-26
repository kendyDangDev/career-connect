import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Briefcase, MapPin, Clock, DollarSign, Users, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Job {
  id: string;
  title: string;
  slug: string;
  jobType: string;
  workLocationType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  salaryNegotiable: boolean;
  locationCity: string;
  locationProvince: string;
  locationCountry: string;
  applicationDeadline: string;
  status: string;
  viewCount: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  jobSkills?: {
    requiredLevel: string;
    minYearsExperience: number;
    skill: {
      id: string;
      name: string;
      slug: string;
      category: string;
    };
  }[];
  jobCategories?: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  _count?: {
    applications: number;
    savedJobs: number;
  };
}

interface CompanyJobsSectionProps {
  jobs: Job[];
  onSeeAllPress: () => void;
}

const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  const router = useRouter();
  
  const formatSalary = (salaryMin: string, salaryMax: string, currency: string, salaryNegotiable: boolean) => {
    const min = (parseInt(salaryMin) / 1000000).toFixed(0);
    const max = (parseInt(salaryMax) / 1000000).toFixed(0);
    const formattedSalary = `${min}-${max}M ${currency}`;
    return salaryNegotiable ? `${formattedSalary} (Negotiable)` : formattedSalary;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getEmploymentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'FULL_TIME': 'bg-blue-100 text-blue-700',
      'PART_TIME': 'bg-purple-100 text-purple-700',
      'CONTRACT': 'bg-orange-100 text-orange-700',
      'INTERNSHIP': 'bg-green-100 text-green-700',
      'FREELANCE': 'bg-pink-100 text-pink-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'FULL_TIME': 'Full-time',
      'PART_TIME': 'Part-time',
      'CONTRACT': 'Contract',
      'INTERNSHIP': 'Internship',
      'FREELANCE': 'Freelance'
    };
    return labels[type] || type;
  };

  const handlePress = () => {
    router.push(`/job/${job.id}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white p-4 rounded-xl border border-gray-100 mb-3"
      activeOpacity={0.7}
    >
      {/* Job Title and Type */}
      <View className="flex-row items-start justify-between mb-3">
        <Text className="text-base font-semibold text-gray-900 flex-1 mr-2">
          {job.title}
        </Text>
        <View className={`px-2 py-1 rounded-lg ${getEmploymentTypeColor(job.jobType)}`}>
          <Text className="text-xs font-medium">
            {getEmploymentTypeLabel(job.jobType)}
          </Text>
        </View>
      </View>

      {/* Job Details */}
      <View className="space-y-2">
        {/* Location */}
        <View className="flex-row items-center">
          <MapPin size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1.5">
            {job.locationCity}
            {job.workLocationType === 'REMOTE' && ' • Remote'}
          </Text>
        </View>

        {/* Salary */}
        <View className="flex-row items-center">
          <DollarSign size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1.5">
            {formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryNegotiable)}
          </Text>
        </View>

        {/* Experience */}
        <View className="flex-row items-center">
          <Briefcase size={14} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1.5">
            {job.experienceLevel}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <View className="flex-row items-center">
          <Users size={14} color="#6B7280" />
          <Text className="text-xs text-gray-500 ml-1">
            {job.applicationCount} applicants
          </Text>
        </View>
        <Text className="text-xs text-gray-500">
          {formatDate(job.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CompanyJobsSection: React.FC<CompanyJobsSectionProps> = ({ 
  jobs, 
  onSeeAllPress 
}) => {
  if (!jobs || jobs.length === 0) {
    return (
      <View className="bg-white mx-4 mb-4 p-4 rounded-2xl shadow-sm border border-gray-100">
        <Text className="text-lg font-bold text-gray-900 mb-4">Open Positions</Text>
        <View className="py-8 items-center">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
            <Briefcase size={24} color="#9CA3AF" />
          </View>
          <Text className="text-gray-500 text-center">
            No open positions at the moment
          </Text>
        </View>
      </View>
    );
  }

  const displayedJobs = jobs.slice(0, 3);

  return (
    <View className="bg-white mx-4 mb-4 p-4 rounded-2xl shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-900">
          Open Positions ({jobs.length})
        </Text>
        {jobs.length > 3 && (
          <TouchableOpacity
            onPress={onSeeAllPress}
            className="flex-row items-center"
          >
            <Text className="text-blue-600 font-medium text-sm mr-1">See All</Text>
            <ChevronRight size={16} color="#2563EB" />
          </TouchableOpacity>
        )}
      </View>

      {displayedJobs.map((job, index) => (
        <JobCard key={job.id} job={job} />
      ))}
    </View>
  );
};

export default CompanyJobsSection;
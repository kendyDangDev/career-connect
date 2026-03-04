'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import JobDetailBreadcrumb from './JobDetailBreadcrumb';
import JobDetailHeaderCard from './JobDetailHeaderCard';
import JobDetailAboutSection from './JobDetailAboutSection';
import JobDetailSidebar from './JobDetailSidebar';
import CompanyProfileCard from './CompanyProfileCard';
import JobLocationCard from './JobLocationCard';
import JobAlertCard from './JobAlertCard';
import SimilarJobs from './SimilarJobs';

export interface JobData {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  jobType?: string | null;
  workLocationType?: string | null;
  experienceLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  salaryNegotiable: boolean;
  address?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  applicationDeadline?: Date | string | null;
  status: string;
  viewCount?: number;
  applicationCount?: number;
  featured?: boolean;
  urgent?: boolean;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  publishedAt?: Date | string | null;
  company: JobCompany;
  jobSkills?: JobSkill[];
  jobCategories?: JobCategory[];
  _count?: {
    applications: number;
    savedJobs: number;
    jobViews: number;
  };
}

export interface JobCompany {
  id: string;
  companyName: string;
  companySlug?: string | null;
  logoUrl?: string | null;
  verificationStatus?: string | null;
  websiteUrl?: string | null;
  city?: string | null;
  description?: string | null;
  industry?: string | null;
  companySize?: string | null;
  province?: string | null;
}

export interface JobSkill {
  id: string;
  skill: {
    id: string;
    name: string;
  };
  requiredLevel: string;
  minYearsExperience?: number;
}

export interface JobCategory {
  id: string;
  category: {
    id: string;
    name: string;
  };
}

interface JobDetailPageProps {
  jobId: string;
}

export default function JobDetailPage({ jobId }: JobDetailPageProps) {
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobDetail() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/jobs/${jobId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          setError(result.message || 'Job not found');
          return;
        }

        setJob(result.data as JobData);
      } catch (err) {
        console.error('Error fetching job detail:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">Đang tải thông tin công việc...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
            Không thể tải thông tin
          </h2>
          <p className="mb-4 text-slate-600 dark:text-slate-400">{error || 'Job not found'}</p>
          <Link
            href="/jobs"
            className="bg-primary hover:bg-primary-dark inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition"
          >
            Quay lại danh sách việc làm
          </Link>
        </div>
      </div>
    );
  }

  const categories = job.jobCategories?.map((jc) => jc.category) || [];
  const skills = job.jobSkills || [];
  const categoryName = categories.length > 0 ? categories[0].name : undefined;

  return (
    <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 md:px-8 lg:py-12">
      {/* Breadcrumb */}
      <JobDetailBreadcrumb category={categoryName} jobTitle={job.title} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left Column - Main Content */}
        <div className="flex flex-col gap-8 lg:col-span-8">
          {/* Header Card */}
          <JobDetailHeaderCard
            job={job}
            viewCount={job.viewCount || job._count?.jobViews || 0}
            applicationCount={job.applicationCount || job._count?.applications || 0}
            savedCount={job._count?.savedJobs || 0}
          />

          {/* About the Role */}
          <JobDetailAboutSection
            description={job.description}
            requirements={job.requirements}
            benefits={job.benefits}
            categories={categories}
            skills={skills}
          />

          {/* Similar Jobs */}
          <SimilarJobs currentJobId={job.id} jobType={job.jobType || 'FULL_TIME'} />
        </div>

        {/* Right Column - Sidebar */}
        <aside className="flex flex-col gap-6 lg:col-span-4">
          <JobDetailSidebar
            company={job.company}
            jobType={job.jobType}
            experienceLevel={job.experienceLevel}
            workLocationType={job.workLocationType}
            applicationDeadline={job.applicationDeadline}
            createdAt={job.createdAt || job.publishedAt}
          />

          <CompanyProfileCard company={job.company} />

          <JobLocationCard
            locationCity={job.locationCity}
            locationProvince={job.locationProvince}
            locationAddress={job.address}
          />

          <JobAlertCard
            jobTitle={job.title}
            locationCity={job.locationCity}
            locationProvince={job.locationProvince}
          />
        </aside>
      </div>
    </main>
  );
}

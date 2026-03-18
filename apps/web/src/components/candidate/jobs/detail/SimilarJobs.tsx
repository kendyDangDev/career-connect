'use client';

import { useEffect, useState } from 'react';
import { CompanyActiveOpenings, type JobListing } from '@/components/company-profile';

interface SimilarJob {
  id: string;
  title: string;
  company: {
    companyName: string;
    logoUrl: string | null;
  };
  jobSkills?: Array<{
    requiredLevel?: string | null;
    skill: {
      id: string;
      name: string;
    } | null;
  }>;
  locationCity: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  salaryNegotiable: boolean;
  jobType: string;
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string,
  negotiable: boolean
) {
  if (negotiable) return 'Thỏa thuận';
  if (!min && !max) return null;

  const formatAmount = (amount: number) =>
    currency === 'VND' ? `${(amount / 1_000_000).toFixed(0)}M` : `$${(amount / 1_000).toFixed(0)}k`;

  if (min && max) return `${formatAmount(min)} - ${formatAmount(max)}`;
  if (min) return `Từ ${formatAmount(min)}`;
  return `Đến ${formatAmount(max!)}`;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
};

function normalizeSkillName(skillName: string) {
  return skillName.trim().toLowerCase();
}

function extractSkillNames(job: SimilarJob) {
  const seen = new Set<string>();

  return (job.jobSkills ?? [])
    .map((jobSkill) => jobSkill.skill?.name?.trim())
    .filter((skillName): skillName is string => Boolean(skillName))
    .filter((skillName) => {
      const normalizedSkillName = normalizeSkillName(skillName);
      if (seen.has(normalizedSkillName)) return false;
      seen.add(normalizedSkillName);
      return true;
    });
}

function mapToJobListing(job: SimilarJob): JobListing {
  const jobTypeLabel = JOB_TYPE_LABELS[job.jobType] ?? job.jobType;
  const skillTags = extractSkillNames(job);

  return {
    id: job.id,
    title: job.title,
    companyName: job.company.companyName,
    logoUrl: job.company.logoUrl,
    location: job.locationCity || '',
    type: jobTypeLabel,
    salary:
      formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryNegotiable) ?? undefined,
    postedAt: '',
    tags: skillTags.length > 0 ? [...skillTags] : [jobTypeLabel],
  };
}

export default function SimilarJobs({
  currentJobId,
  jobType,
  currentSkillNames = [],
}: {
  currentJobId: string;
  jobType: string;
  currentSkillNames?: string[];
}) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const currentSkillNamesKey = currentSkillNames
    .map((skillName) => normalizeSkillName(skillName))
    .filter(Boolean)
    .sort()
    .join('|');

  useEffect(() => {
    (async () => {
      try {
        const normalizedCurrentSkills = new Set(
          currentSkillNamesKey ? currentSkillNamesKey.split('|') : []
        );

        const params = new URLSearchParams({
          limit: '12',
          jobType,
        });
        const response = await fetch(`/api/jobs?${params.toString()}`);
        const result = await response.json();

        if (!result.success) return;

        const rawJobs = (result.data?.jobs ?? []) as SimilarJob[];
        const filteredJobs = rawJobs.filter((job) => job.id !== currentJobId);

        const rankedJobs = filteredJobs
          .map((job, index) => {
            const skillNames = extractSkillNames(job);
            const overlapCount = skillNames.filter((skillName) =>
              normalizedCurrentSkills.has(normalizeSkillName(skillName))
            ).length;

            return {
              job,
              index,
              overlapCount,
              skillCount: skillNames.length,
            };
          })
          .sort((left, right) => {
            if (right.overlapCount !== left.overlapCount) {
              return right.overlapCount - left.overlapCount;
            }

            if (right.skillCount !== left.skillCount) {
              return right.skillCount - left.skillCount;
            }

            return left.index - right.index;
          })
          .slice(0, 3)
          .map(({ job }) => mapToJobListing(job));

        setJobs(rankedJobs);
        setTotalCount(result.data?.pagination?.total ?? filteredJobs.length);
      } catch {
        /* silent */
      }
    })();
  }, [currentJobId, currentSkillNamesKey, jobType]);

  if (!jobs.length) return null;

  return (
    <div className="mt-6">
      <CompanyActiveOpenings
        jobs={jobs}
        totalCount={totalCount}
        title="Việc làm tương tự"
        subtitle="Ưu tiên các vị trí có kỹ năng gần với công việc hiện tại"
        viewAllHref="/candidate/jobs"
        viewAllLabel="Xem thêm"
        actionLabel="Xem chi tiết"
      />
    </div>
  );
}

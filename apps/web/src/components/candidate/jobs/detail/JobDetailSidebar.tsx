'use client';

interface Company {
  id: string;
  companyName: string;
  companySlug?: string | null;
  logoUrl?: string | null;
  verificationStatus?: string | null;
  websiteUrl?: string | null;
  city?: string | null;
}

interface JobDetailSidebarProps {
  company: Company;
  jobType?: string | null;
  experienceLevel?: string | null;
  workLocationType?: string | null;
  applicationDeadline?: Date | string | null;
  createdAt?: Date | string | null;
}

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
};

const experienceLevelLabels: Record<string, string> = {
  ENTRY: 'Entry Level',
  MID: 'Mid Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
};

const workLocationLabels: Record<string, string> = {
  REMOTE: 'Remote',
  ONSITE: 'On-site',
  HYBRID: 'Hybrid',
};

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function JobDetailSidebar({
  company,
  jobType,
  experienceLevel,
  workLocationType,
  applicationDeadline,
  createdAt,
}: JobDetailSidebarProps) {
  return (
    <div className="shadow-sophisticated rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 text-lg font-bold">Job Overview</h3>

      <div className="space-y-4">
        {/* Date Posted */}
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 rounded-lg p-2 pb-1 dark:bg-slate-800">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
          </div>
          <div>
            <p className="mb-0.5 h-4 text-xs font-bold tracking-wider text-slate-400 uppercase">
              Date Posted
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {formatDate(createdAt)}
            </p>
          </div>
        </div>

        {/* Job Type */}
        {jobType && (
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-lg p-2 pb-1 dark:bg-slate-800">
              <span className="material-symbols-outlined text-primary">work</span>
            </div>
            <div>
              <p className="mb-0.5 h-4 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Employment Type
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {jobTypeLabels[jobType] || jobType}
              </p>
            </div>
          </div>
        )}

        {/* Experience Level */}
        {experienceLevel && (
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-lg p-2 pb-1 dark:bg-slate-800">
              <span className="material-symbols-outlined text-primary">military_tech</span>
            </div>
            <div>
              <p className="mb-0.5 h-4 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Experience Level
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {experienceLevelLabels[experienceLevel] || experienceLevel}
              </p>
            </div>
          </div>
        )}

        {/* Work Location Type */}
        {workLocationType && (
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-lg p-2 pb-1 dark:bg-slate-800">
              <span className="material-symbols-outlined text-primary">location_on</span>
            </div>
            <div>
              <p className="mb-0.5 h-4 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Work Mode
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {workLocationLabels[workLocationType] || workLocationType}
              </p>
            </div>
          </div>
        )}

        {/* Application Deadline */}
        {applicationDeadline && (
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-lg p-2 pb-1 dark:bg-slate-800">
              <span className="material-symbols-outlined text-primary">event</span>
            </div>
            <div>
              <p className="mb-0.5 h-4 text-xs font-bold tracking-wider text-slate-400 uppercase">
                Application Deadline
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatDate(applicationDeadline)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

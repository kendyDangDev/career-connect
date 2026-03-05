'use client';

import { useState } from 'react';
import {
  CompanyHero,
  CompanyTabs,
  CompanyAbout,
  CompanyKeyBenefits,
  CompanyActiveOpenings,
  CompanySidebar,
  type CompanyTabKey,
  type JobListing,
} from '@/components/company-profile';

// ─── Mock Data (replace with real API call) ─────────────────────────────────

const MOCK_COMPANY = {
  id: 'techflow-solutions',
  name: 'TechFlow Solutions',
  tagline: 'Enterprise Software / SaaS',
  industry: 'Enterprise Software / SaaS',
  companySize: '500 - 1,000 Employees',
  headquarters: 'San Francisco, CA',
  foundedYear: '2015',
  websiteUrl: 'https://techflow.io',
  email: 'hello@techflow.io',
  twitterUrl: 'https://twitter.com/techflow',
  githubUrl: 'https://github.com/techflow',
  activeJobsCount: 24,
  employeesCount: '850+',
  followersCount: '12.4k',
  description: `TechFlow Solutions is a global leader in cloud infrastructure and SaaS automation. Founded in 2015, our mission is to simplify complex enterprise workflows through innovative engineering and design-first principles.

We pride ourselves on our inclusive culture and our commitment to open-source contributions. Our engineering teams work at the cutting edge of distributed systems, real-time data processing, and highly scalable frontend architectures.`,
  techStack: [
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Go',
    'Kubernetes',
    'AWS',
    'PostgreSQL',
    'Redis',
    'GraphQL',
    'Terraform',
    'gRPC',
  ],
  benefits: [
    {
      title: 'Premium Healthcare',
      description: 'Top-tier health, dental, and vision insurance for you and your dependents.',
    },
    {
      title: 'Remote Flexibility',
      description: 'Work from anywhere or join us in our beautiful global office spaces.',
    },
    {
      title: 'Learning Stipend',
      description: '$3,000 annual budget for conferences, courses, and growth.',
    },
    {
      title: 'Wellness Program',
      description: 'Monthly fitness allowance and access to mental health support tools.',
    },
  ],
};

const MOCK_JOBS: JobListing[] = [
  {
    id: 'job-1',
    title: 'Senior Full Stack Engineer',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time',
    salary: '$150k – $200k',
    postedAt: '2 days ago',
    tags: ['React', 'Node.js', 'TypeScript'],
  },
  {
    id: 'job-2',
    title: 'Infrastructure Architect',
    location: 'Remote',
    type: 'Full-time',
    salary: '$180k – $240k',
    postedAt: '5 days ago',
    tags: ['Kubernetes', 'AWS', 'Terraform'],
  },
  {
    id: 'job-3',
    title: 'Product Designer (L3)',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$130k – $170k',
    postedAt: '1 week ago',
    tags: ['Figma', 'Design Systems', 'UX Research'],
  },
];

// ─── Page Component ──────────────────────────────────────────────────────────

export default function CompanyProfilePage() {
  const [activeTab, setActiveTab] = useState<CompanyTabKey>('overview');
  const [isFollowing, setIsFollowing] = useState(false);

  const company = MOCK_COMPANY;

  const handleFollow = () => setIsFollowing((prev) => !prev);

  const handleAlert = () => {
    // scroll to Job Alerts form in sidebar
    document.getElementById('job-alert-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubscribeJobAlert = (email: string) => {
    console.log('Subscribed job alert for:', email);
    // TODO: call API
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        {/* Company Hero */}
        <CompanyHero
          name={company.name}
          tagline={company.tagline}
          industry={company.industry}
          location={company.headquarters}
          websiteUrl={company.websiteUrl}
          activeJobsCount={company.activeJobsCount}
          employeesCount={company.employeesCount}
          followersCount={company.followersCount}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onAlert={handleAlert}
        />

        {/* Tab Navigation */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <CompanyTabs
            activeTab={activeTab}
            jobsCount={company.activeJobsCount}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left / Main Content */}
          <div className="space-y-5 lg:col-span-2">
            {activeTab === 'overview' && (
              <>
                <CompanyAbout
                  description={company.description}
                  techStack={company.techStack}
                />
                <CompanyKeyBenefits benefits={company.benefits} />
                <CompanyActiveOpenings
                  jobs={MOCK_JOBS}
                  companyId={company.id}
                  totalCount={company.activeJobsCount}
                />
              </>
            )}

            {activeTab === 'jobs' && (
              <CompanyActiveOpenings
                jobs={MOCK_JOBS}
                companyId={company.id}
                totalCount={company.activeJobsCount}
              />
            )}

            {activeTab === 'life' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <p className="text-gray-400">Life at Company content coming soon...</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <p className="text-gray-400">Reviews content coming soon...</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div id="job-alert-form">
            <CompanySidebar
              industry={company.industry}
              companySize={company.companySize}
              headquarters={company.headquarters}
              foundedYear={company.foundedYear}
              websiteUrl={company.websiteUrl}
              email={company.email}
              twitterUrl={company.twitterUrl}
              githubUrl={company.githubUrl}
              onSubscribeJobAlert={handleSubscribeJobAlert}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

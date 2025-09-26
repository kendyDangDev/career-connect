import { Job } from '../types/job';

// Mock full content as it comes from API
const mockFullContent = `About this job
Description
<p>We are looking for a talented senior engineer to join our growing team. You will work on cutting-edge projects using modern technologies.</p>
<p><strong>What you'll do:</strong></p>
<ul><li>Build scalable web applications</li><li>Collaborate with cross-functional teams</li><li>Write clean, maintainable code</li></ul>
Requirements
<ul><li>5+ years experience in software development</li><li>Strong in React/Node.js</li><li>Experience with TypeScript</li><li>Knowledge of cloud platforms (AWS/GCP)</li></ul>
Benefits
<ul><li>Competitive salary</li><li>Health insurance</li><li>Remote work options</li><li>Professional development budget</li></ul>`;

export const mockJob: Job = {
  id: 'mock-job-1',
  title: 'Senior Frontend Developer',
  slug: 'senior-frontend-developer-tech-company',
  description: `<p>We are looking for a Senior Frontend Developer to join our dynamic team. You will be responsible for developing user-facing features using modern JavaScript frameworks and libraries.</p>

<p><strong>Key Responsibilities:</strong></p>
<ul>
<li>Develop and maintain web applications using React.js and TypeScript</li>
<li>Collaborate with UX/UI designers to implement pixel-perfect designs</li>
<li>Optimize applications for maximum speed and scalability</li>
<li>Write clean, maintainable, and well-documented code</li>
<li>Participate in code reviews and technical discussions</li>
<li>Stay up-to-date with the latest frontend technologies and best practices</li>
</ul>`,

  requirements: `<p><strong>Required Qualifications:</strong></p>
<ul>
<li>Bachelor's degree in Computer Science or related field</li>
<li>5+ years of experience in frontend development</li>
<li>Strong proficiency in JavaScript, HTML5, and CSS3</li>
<li>Experience with React.js, Redux, and TypeScript</li>
<li>Knowledge of responsive design and cross-browser compatibility</li>
<li>Experience with version control systems (Git)</li>
<li>Strong problem-solving and communication skills</li>
</ul>

<p><strong>Preferred Qualifications:</strong></p>
<ul>
<li>Experience with Next.js or other React frameworks</li>
<li>Knowledge of testing frameworks (Jest, Cypress)</li>
<li>Experience with cloud platforms (AWS, Google Cloud)</li>
<li>Understanding of DevOps practices</li>
</ul>`,

  benefits: `<p><strong>What We Offer:</strong></p>
<ul>
<li>Competitive salary package (25M - 40M VND)</li>
<li>Comprehensive health insurance</li>
<li>Annual performance bonus</li>
<li>Professional development opportunities</li>
<li>Flexible working hours and remote work options</li>
<li>Modern office environment with latest equipment</li>
<li>Team building activities and company events</li>
<li>Free lunch and snacks</li>
<li>Parking allowance</li>
<li>15 days of annual leave plus public holidays</li>
</ul>`,

  jobType: 'FULL_TIME',
  workLocationType: 'HYBRID',
  experienceLevel: 'SENIOR',
  salaryMin: 25000000,
  salaryMax: 40000000,
  currency: 'VND',
  salaryNegotiable: false,
  locationCity: 'Ho Chi Minh City',
  locationProvince: 'Ho Chi Minh',
  applicationDeadline: '2024-12-31T23:59:59.000Z',
  status: 'ACTIVE',
  viewCount: 150,
  applicationCount: 12,
  featured: true,
  urgent: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T10:30:00.000Z',
  publishedAt: '2024-01-02T08:00:00.000Z',
  company: {
    id: 'mock-company-1',
    companyName: 'TechVietnam Solutions',
    companySlug: 'techvietnam-solutions',
    logoUrl: 'https://via.placeholder.com/150x150/2563EB/FFFFFF?text=TV',
    verificationStatus: 'VERIFIED',
    website: 'https://techvietnam.com',
    city: 'Ho Chi Minh City',
    province: 'Ho Chi Minh'
  },
  jobSkills: [
    {
      id: 'skill-1',
      requiredLevel: 'REQUIRED',
      minYearsExperience: 5,
      skill: {
        id: 'react-skill',
        name: 'React.js',
        category: 'Frontend'
      }
    },
    {
      id: 'skill-2',
      requiredLevel: 'REQUIRED',
      minYearsExperience: 4,
      skill: {
        id: 'typescript-skill',
        name: 'TypeScript',
        category: 'Programming Language'
      }
    },
    {
      id: 'skill-3',
      requiredLevel: 'PREFERRED',
      minYearsExperience: 3,
      skill: {
        id: 'nextjs-skill',
        name: 'Next.js',
        category: 'Frontend Framework'
      }
    },
    {
      id: 'skill-4',
      requiredLevel: 'REQUIRED',
      minYearsExperience: 5,
      skill: {
        id: 'javascript-skill',
        name: 'JavaScript',
        category: 'Programming Language'
      }
    }
  ],
  jobCategories: [
    {
      id: 'cat-1',
      category: {
        id: 'tech-category',
        name: 'Technology',
        slug: 'technology'
      }
    }
  ],
  _count: {
    applications: 12,
    savedJobs: 8,
    jobViews: 150
  }
};

export const mockJobList: Job[] = [
  mockJob,
  {
    ...mockJob,
    id: 'mock-job-2',
    title: 'Marketing Specialist',
    // Clear individual fields to test fullContent parsing
    description: undefined,
    requirements: undefined,
    benefits: undefined,
    fullContent: mockFullContent,
    company: {
      ...mockJob.company,
      id: 'mock-company-2',
      companyName: 'Digital Marketing Pro',
      logoUrl: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=DM'
    },
    salaryMin: 15000000,
    salaryMax: 25000000,
    experienceLevel: 'MID',
    jobType: 'FULL_TIME',
    workLocationType: 'ONSITE',
    featured: false,
    urgent: true
  },
  {
    ...mockJob,
    id: 'mock-job-3',
    title: 'UI/UX Designer',
    company: {
      ...mockJob.company,
      id: 'mock-company-3',
      companyName: 'Creative Studio',
      logoUrl: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=CS'
    },
    salaryMin: 18000000,
    salaryMax: 30000000,
    experienceLevel: 'MID',
    jobType: 'CONTRACT',
    workLocationType: 'REMOTE',
    featured: false,
    urgent: false
  }
];

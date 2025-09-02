# Development Rules & Guidelines - Website Tuyển Dụng

## 1. Thông Tin Dự Án Cơ Bản

### Loại Website & Mục Đích

- **Loại:** Web Application - Job Portal (Tuyển dụng & Tìm việc)
- **Mục đích:** Kết nối ứng viên và nhà tuyển dụng
- **Đối tượng:** Ứng viên tìm việc, HR/Recruiter, Công ty
- **Quy mô:** Dự án cá nhân/đồ án (Medium scale)

---

## 2. Development Rules & Standards

### **Code Structure & Organization**

#### NextJS Project Structure

```
/src
  /app                 # App Router (Next.js 13+)
    /api              # API routes
    /(routes)         # Page routes
  /components         # Reusable components
    /ui              # Radix UI components
    /forms           # Form components
    /layout          # Layout components
  /lib                # Utilities & configs
  /store              # Redux store
  /types              # TypeScript definitions
  /hooks              # Custom hooks
```

#### Naming Conventions

- **Files:** kebab-case (`job-list.tsx`)
- **Components:** PascalCase (`JobCard`)
- **Functions/Variables:** camelCase (`getUserJobs`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Database:** snake_case (`user_profiles`)

### **Frontend Development Rules**

#### React/NextJS Guidelines

```typescript
// ✅ Correct component structure
'use client'; // Only when needed for client components

import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
}

export const JobCard: FC<JobCardProps> = ({ job, onApply }) => {
  // Component logic
};

export default JobCard;
```

#### State Management Rules

- **React Query:** API calls, server state, caching
- **Redux Toolkit:** Global UI state (theme, user session, notifications)
- **Local State:** Component-specific state với useState
- **URL State:** Search filters, pagination

#### Styling Guidelines

```typescript
// ✅ Tailwind + Radix UI pattern
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const JobCard = ({ className, ...props }) => (
  <div className={cn(
    "rounded-lg border bg-card p-6 shadow-sm",
    className
  )}>
    <Button variant="outline" size="sm">
      Apply Now
    </Button>
  </div>
)
```

### **Backend Development Rules**

#### API Route Structure

```typescript
// /app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');

    const jobs = await prisma.job.findMany({
      skip: (page - 1) * 10,
      take: 10,
      include: {
        company: true,
        skills: true,
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
```

#### Database Rules với Prisma

```typescript
// ✅ Prisma schema conventions
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  profile   UserProfile?
  candidate Candidate?

  @@map("users")
}

// ✅ Database queries with error handling
export async function getJobsByFilters(filters: JobFilters) {
  try {
    return await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        title: {
          contains: filters.keyword,
          mode: 'insensitive'
        }
      },
      include: {
        company: {
          select: { name: true, logo: true }
        }
      }
    })
  } catch (error) {
    console.error('Database query failed:', error)
    throw new Error('Failed to fetch jobs')
  }
}
```

---

## 3. Security Rules

### **Authentication & Authorization**

```typescript
// NextAuth.js configuration
export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        // Implement secure login logic
        const user = await verifyCredentials(credentials);
        return user ? { id: user.id, email: user.email } : null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.role = user.role;
      return token;
    },
  },
};
```

### **Data Protection Rules**

- **Password:** Minimum 8 ký tự, hash với bcrypt
- **File Upload:** Validate type, size limit 5MB for CV
- **Input Validation:** Zod schema cho tất cả API endpoints
- **SQL Injection:** Chỉ sử dụng Prisma ORM, không raw queries
- **XSS Prevention:** Sanitize user input, use Next.js built-in protections

### **API Security**

```typescript
// Rate limiting middleware
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

// Input validation với Zod
import { z } from 'zod';

const JobCreateSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(50),
  salary: z.number().positive().optional(),
  location: z.string().min(2),
});
```

---

## 4. Performance & Optimization Rules

### **Frontend Optimization**

```typescript
// ✅ Image optimization
import Image from 'next/image'

<Image
  src={job.company.logo}
  alt={`${job.company.name} logo`}
  width={64}
  height={64}
  className="rounded-md"
  priority={isAboveTheFold}
/>

// ✅ Dynamic imports for code splitting
const JobDetailsModal = dynamic(() => import('./job-details-modal'), {
  loading: () => <Skeleton />,
  ssr: false
})
```

### **Database Optimization**

```sql
-- Essential indexes
CREATE INDEX idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_jobs_location ON jobs(location_city, location_province);
CREATE INDEX idx_jobs_active ON jobs(status, published_at) WHERE status = 'ACTIVE';
CREATE INDEX idx_applications_candidate ON applications(candidate_id, status);
```

### **Caching Strategy**

```typescript
// Redis caching cho search results
export async function getCachedJobs(filters: JobFilters) {
  const cacheKey = `jobs:${JSON.stringify(filters)}`;

  // Check Redis first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Fetch from database
  const jobs = await getJobsFromDB(filters);

  // Cache for 10 minutes
  await redis.setex(cacheKey, 600, JSON.stringify(jobs));
  return jobs;
}
```

---

## 5. Code Quality Rules

### **TypeScript Standards**

```typescript
// ✅ Strict typing
interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location: Location;
  publishedAt: Date;
}

// ✅ API response types
type ApiResponse<T> = {
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
};
```

### **Error Handling Standards**

```typescript
// Global error boundary
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2>Something went wrong!</h2>
        <button onClick={reset}>Try again</button>
      </div>
    </div>
  )
}

// API error handling
export async function POST(request: NextRequest) {
  try {
    // Logic here
  } catch (error) {
    console.error('API Error:', error)

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 6. Testing Requirements

### **Testing Strategy**

```typescript
// Unit tests với Jest
describe('JobCard Component', () => {
  it('should display job title and company', () => {
    render(<JobCard job={mockJob} />)
    expect(screen.getByText(mockJob.title)).toBeInTheDocument()
    expect(screen.getByText(mockJob.company.name)).toBeInTheDocument()
  })
})

// API tests
describe('/api/jobs', () => {
  it('should return paginated jobs', async () => {
    const response = await GET(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.jobs).toHaveLength(10)
    expect(data.pagination).toBeDefined()
  })
})
```

### **Testing Coverage Requirements**

- **Unit tests:** 80% coverage minimum
- **Integration tests:** All API endpoints
- **E2E tests:** Critical user journeys (register, apply, post job)

---

## 7. Deployment & DevOps Rules

### **Environment Configuration**

```bash
# .env.local
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
ELASTICSEARCH_URL="http://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Production additional vars
VERCEL_URL="https://..."
SENTRY_DSN="..."
```

### **CI/CD Pipeline Requirements**

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm ci
          npm run test
          npm run type-check
          npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

---

## 8. Security Implementation Rules

### **Input Validation**

```typescript
// Zod schemas cho validation
export const JobApplicationSchema = z.object({
  jobId: z.string().cuid(),
  coverLetter: z.string().min(50).max(2000),
  cvFile: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'CV file must be less than 5MB'
  ),
});
```

### **Data Sanitization**

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}
```

---

## 9. Performance Rules

### **Database Optimization**

- Sử dụng `select` specific fields thay vì select all
- Implement pagination cho tất cả danh sách
- Sử dụng database indexes cho search fields
- Connection pooling với Prisma

### **Frontend Optimization**

- Lazy loading cho components không critical
- Image optimization với Next.js Image
- Code splitting theo routes
- Minimize bundle size < 1MB

### **Caching Strategy**

- **Static pages:** ISR (Incremental Static Regeneration)
- **API responses:** Redis cache 5-15 minutes
- **Search results:** Cache 10 minutes
- **User sessions:** Redis session store

---

## 10. Monitoring & Logging Rules

### **Logging Standards**

```typescript
// Structured logging
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage
logger.info('User applied for job', {
  userId: user.id,
  jobId: job.id,
  timestamp: new Date().toISOString(),
});
```

### **Error Tracking**

- Implement Sentry cho production error tracking
- Log tất cả API errors với context
- Monitor database query performance
- Track user actions cho analytics

---

## 11. Data Protection & Privacy Rules

### **GDPR Compliance (Nếu có user EU)**

```typescript
// Privacy controls
export interface PrivacySettings {
  allowEmailNotifications: boolean;
  allowDataProcessing: boolean;
  allowProfileVisibility: boolean;
  cookieConsent: boolean;
}

// Data export functionality
export async function exportUserData(userId: string) {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      applications: true,
      savedJobs: true,
    },
  });

  return generateDataExport(userData);
}
```

### **File Upload Security**

```typescript
// File validation
export const FILE_UPLOAD_RULES = {
  CV: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedExtensions: ['.pdf', '.doc', '.docx'],
  },
  COMPANY_LOGO: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  },
};
```

---

## 12. Search & Elasticsearch Rules

### **Search Implementation**

```typescript
// Elasticsearch query structure
export async function searchJobs(query: JobSearchQuery) {
  const searchBody = {
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: query.keyword,
              fields: ['title^3', 'description', 'company.name^2'],
              fuzziness: 'AUTO',
            },
          },
        ],
        filter: [
          ...(query.location && [{ term: { 'location.city': query.location } }]),
          ...(query.salary && [{ range: { salary_min: { gte: query.salary } } }]),
        ],
      },
    },
    sort: [{ published_at: { order: 'desc' } }, { _score: { order: 'desc' } }],
  };

  return await elasticsearch.search({
    index: 'jobs',
    body: searchBody,
  });
}
```

---

## 13. Testing Rules

### **Test Structure**

```typescript
// Component tests
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('JobApplicationForm', () => {
  const renderWithProviders = (component: ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })

    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('should submit application successfully', async () => {
    renderWithProviders(<JobApplicationForm jobId="test-job" />)

    fireEvent.change(screen.getByLabelText('Cover Letter'), {
      target: { value: 'Test cover letter content...' }
    })

    fireEvent.click(screen.getByText('Submit Application'))

    await waitFor(() => {
      expect(screen.getByText('Application submitted!')).toBeInTheDocument()
    })
  })
})
```

### **API Testing**

```typescript
// API route tests
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/jobs/route';

describe('/api/jobs', () => {
  it('should return jobs with pagination', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { page: '1', limit: '10' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.jobs).toHaveLength(10);
    expect(data.pagination).toBeDefined();
  });
});
```

---

## 14. Documentation Requirements

### **Code Documentation**

```typescript
/**
 * Applies for a job position
 * @param jobId - The ID of the job to apply for
 * @param candidateId - The ID of the candidate applying
 * @param applicationData - Application form data
 * @returns Promise<Application> - The created application
 * @throws {ValidationError} When application data is invalid
 * @throws {DuplicateApplicationError} When user already applied
 */
export async function applyForJob(
  jobId: string,
  candidateId: string,
  applicationData: JobApplicationData
): Promise<Application> {
  // Implementation
}
```

### **API Documentation**

- Sử dụng OpenAPI/Swagger cho API docs
- README.md với setup instructions
- Database schema documentation
- Deployment guide

---

## 15. Git Workflow Rules

### **Branch Strategy**

```bash
main              # Production branch
├── develop       # Development branch
├── feature/*     # Feature branches
├── bugfix/*      # Bug fix branches
└── hotfix/*      # Production hotfixes
```

### **Commit Message Format**

```
type(scope): description

feat(auth): add social login with Google
fix(search): resolve elasticsearch connection issue
docs(api): update job search endpoint documentation
test(jobs): add unit tests for job creation
```

### **Code Review Checklist**

- [ ] Code follows naming conventions
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Tests are written and passing
- [ ] Performance impact is considered
- [ ] Security best practices followed
- [ ] Documentation is updated

---

## 16. Deployment Rules

### **Environment Setup**

```typescript
// Environment validation
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  ELASTICSEARCH_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

### **Production Checklist**

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured

---

## 17. Accessibility & UX Rules

### **WCAG 2.1 AA Compliance**

```typescript
// Accessible form example
<form>
  <label htmlFor="job-title" className="sr-only">
    Job Title
  </label>
  <input
    id="job-title"
    type="text"
    placeholder="Software Engineer"
    aria-describedby="job-title-help"
    required
  />
  <p id="job-title-help" className="text-sm text-muted-foreground">
    Enter the job position title
  </p>
</form>
```

### **Mobile-First Design**

- Responsive design với Tailwind breakpoints
- Touch-friendly interface (44px minimum touch targets)
- Fast loading trên mobile networks
- PWA capabilities cho mobile app experience

---

## 18. Maintenance Rules

### **Code Maintenance**

- Weekly dependency updates
- Monthly security audit
- Quarterly performance review
- Database cleanup cho old data (6+ months)

### **Content Moderation**

- Auto-moderate job postings cho inappropriate content
- Manual review cho company registrations
- User reporting system cho spam/fake jobs

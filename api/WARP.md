# WARP API Development Rules - Career Connect

## API Development Standards

### 1. Route Structure (MANDATORY)

ALWAYS follow Next.js 15 App Router structure:

```
/src/app/api/
  /auth/
    /login/route.ts
    /register/route.ts
    /logout/route.ts
  /jobs/
    /route.ts              # GET, POST /api/jobs
    /[id]/route.ts         # GET, PUT, DELETE /api/jobs/[id]
    /[id]/apply/route.ts   # POST /api/jobs/[id]/apply
  /users/
    /route.ts              # GET, POST /api/users
    /[id]/route.ts         # GET, PUT, DELETE /api/users/[id]
    /[id]/profile/route.ts # GET, PUT /api/users/[id]/profile
  /companies/
    /route.ts              # GET, POST /api/companies
    /[id]/route.ts         # GET, PUT, DELETE /api/companies/[id]
    /[id]/jobs/route.ts    # GET /api/companies/[id]/jobs
```

### 2. Request/Response Standards

#### Request Handling Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ALWAYS define request validation schema
const RequestSchema = z.object({
  // define schema here
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check (if required)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);

    // 3. Business logic
    const result = await performDatabaseOperation(validatedData);

    // 4. Return success response
    return NextResponse.json({
      data: result,
      message: 'Operation successful',
    });
  } catch (error) {
    // 5. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 3. Authentication & Authorization

#### Session Management

```typescript
// ALWAYS check authentication for protected routes
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Authentication required');
  }

  return session;
}

// Role-based authorization
export async function requireRole(session: Session, allowedRoles: string[]) {
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Insufficient permissions');
  }
}
```

#### API Key Protection

```typescript
// For external API access
export async function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey || !(await isValidApiKey(apiKey))) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
}
```

### 4. Database Operations Rules

#### Query Patterns

```typescript
// ✅ CORRECT - Always use Prisma with proper error handling
export async function createJobApplication(data: JobApplicationData) {
  try {
    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: data.jobId,
        candidateId: data.candidateId,
      },
    });

    if (existingApplication) {
      throw new Error('Already applied for this position');
    }

    // Create application with transaction
    const application = await prisma.$transaction(async (tx) => {
      const newApplication = await tx.application.create({
        data: {
          jobId: data.jobId,
          candidateId: data.candidateId,
          coverLetter: data.coverLetter,
          status: 'PENDING',
        },
        include: {
          job: {
            select: { title: true, company: { select: { name: true } } },
          },
          candidate: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      });

      // Send notification
      await tx.notification.create({
        data: {
          userId: data.candidateId,
          type: 'APPLICATION_SUBMITTED',
          message: `Application submitted for ${newApplication.job.title}`,
        },
      });

      return newApplication;
    });

    return application;
  } catch (error) {
    console.error('Failed to create job application:', error);
    throw error;
  }
}
```

#### Pagination Standard

```typescript
// ALWAYS implement pagination for list endpoints
export async function getPaginatedJobs(params: {
  page: number;
  limit: number;
  filters?: JobFilters;
}) {
  const skip = (params.page - 1) * params.limit;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: buildJobFilters(params.filters),
      include: {
        company: { select: { name: true, logo: true } },
        skills: true,
        _count: { select: { applications: true } },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: params.limit,
    }),
    prisma.job.count({
      where: buildJobFilters(params.filters),
    }),
  ]);

  return {
    data: jobs,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
      hasNext: skip + params.limit < total,
      hasPrev: params.page > 1,
    },
  };
}
```

### 5. Input Validation Rules

#### Zod Schema Patterns

```typescript
// Job creation validation
export const CreateJobSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement needed'),
  salary: z
    .object({
      min: z.number().positive('Minimum salary must be positive'),
      max: z.number().positive('Maximum salary must be positive'),
      currency: z.enum(['VND', 'USD']).default('VND'),
    })
    .optional(),
  location: z.object({
    city: z.string().min(2, 'City name required'),
    province: z.string().min(2, 'Province name required'),
    isRemote: z.boolean().default(false),
  }),
  skills: z.array(z.string()).max(10, 'Maximum 10 skills allowed'),
  experienceLevel: z.enum(['ENTRY', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD']),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
});

// File upload validation
export const CVUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'CV must be less than 5MB')
    .refine(
      (file) =>
        [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(file.type),
      'Only PDF and Word documents allowed'
    ),
});
```

### 6. Rate Limiting & Security

#### Rate Limiting Implementation

```typescript
// Rate limiting for API endpoints
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

// Different limits for different endpoints
export const rateLimits = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  }),
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  }),
  apply: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 applications per hour
  }),
};

// Usage in API routes
export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await rateLimits.apply.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Continue with request handling
}
```

### 7. Error Response Standards

#### Standardized Error Responses

```typescript
// Error response types
interface ApiError {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// Standard error responses
export const ErrorResponses = {
  unauthorized: () =>
    NextResponse.json(
      {
        error: 'Unauthorized access',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    ),

  forbidden: (message = 'Access forbidden') =>
    NextResponse.json(
      {
        error: message,
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    ),

  validation: (details: any) =>
    NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    ),

  notFound: (resource = 'Resource') =>
    NextResponse.json(
      {
        error: `${resource} not found`,
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    ),

  internal: (message = 'Internal server error') =>
    NextResponse.json(
      {
        error: message,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    ),
};
```

### 8. Caching Strategy

#### Redis Caching Rules

```typescript
// Cache keys should be consistent and descriptive
export const CacheKeys = {
  job: (id: string) => `job:${id}`,
  jobsList: (filters: string) => `jobs:list:${filters}`,
  userProfile: (id: string) => `user:profile:${id}`,
  companyJobs: (id: string) => `company:${id}:jobs`,
  searchResults: (query: string) => `search:${Buffer.from(query).toString('base64')}`,
};

// Cache with TTL
export async function cacheWithTTL<T>(
  key: string,
  data: T,
  ttlSeconds: number = 600
): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
}

// Get from cache with fallback
export async function getFromCacheOrFetch<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttlSeconds: number = 600
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Cache read failed:', error);
  }

  const data = await fetchFunction();

  try {
    await cacheWithTTL(key, data, ttlSeconds);
  } catch (error) {
    console.warn('Cache write failed:', error);
  }

  return data;
}
```

### 9. Search API Rules

#### Elasticsearch Integration

```typescript
// Search endpoint implementation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Build search query
    const searchQuery = {
      query: {
        bool: {
          must: [
            query
              ? {
                  multi_match: {
                    query,
                    fields: ['title^3', 'description', 'company.name^2'],
                    fuzziness: 'AUTO',
                  },
                }
              : { match_all: {} },
          ],
          filter: [
            { term: { status: 'ACTIVE' } },
            ...(location ? [{ term: { 'location.city': location } }] : []),
          ],
        },
      },
      sort: [{ publishedAt: { order: 'desc' } }, { _score: { order: 'desc' } }],
      from: (page - 1) * limit,
      size: limit,
    };

    const results = await elasticsearch.search({
      index: 'jobs',
      body: searchQuery,
    });

    return NextResponse.json({
      data: results.hits.hits.map((hit) => hit._source),
      pagination: {
        page,
        limit,
        total: results.hits.total.value,
        totalPages: Math.ceil(results.hits.total.value / limit),
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

### 10. File Upload API Rules

#### File Upload Handling

```typescript
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const formData = await request.formData();
    const file = formData.get('cv') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = CVUploadSchema.safeParse({ file });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid file', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Generate secure filename
    const fileName = `${session.user.id}-${Date.now()}-${file.name}`;
    const uploadPath = join(process.cwd(), 'uploads', 'cvs', fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(uploadPath, buffer);

    // Update user profile
    await prisma.candidate.update({
      where: { userId: session.user.id },
      data: {
        cvFilePath: `/uploads/cvs/${fileName}`,
        cvFileName: file.name,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'CV uploaded successfully',
      fileName: file.name,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

### 11. Background Jobs & Queues

#### Job Queue Implementation

```typescript
// For heavy operations (email sending, data processing)
import { Queue } from 'bullmq';

export const emailQueue = new Queue('email', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Queue job creation
export async function sendApplicationNotification(applicationId: string) {
  await emailQueue.add('application-notification', {
    applicationId,
    timestamp: new Date().toISOString(),
  });
}

// Process jobs
export async function processApplicationNotification(job: any) {
  const { applicationId } = job.data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { include: { company: true } },
      candidate: { include: { user: true } },
    },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  await sendEmail({
    to: application.job.company.contactEmail,
    subject: `New Application: ${application.job.title}`,
    template: 'new-application',
    data: {
      jobTitle: application.job.title,
      candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
      applicationDate: application.createdAt,
    },
  });
}
```

### 12. API Security Rules

#### Request Validation

```typescript
// ALWAYS sanitize and validate ALL inputs
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input.trim());
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}
```

#### SQL Injection Prevention

```typescript
// ✅ CORRECT - Always use Prisma ORM
const jobs = await prisma.job.findMany({
  where: {
    title: {
      contains: searchTerm,
      mode: 'insensitive',
    },
  },
});

// ❌ NEVER use raw SQL with user input
// const jobs = await prisma.$queryRaw`SELECT * FROM jobs WHERE title LIKE ${searchTerm}`;
```

### 13. Logging & Monitoring

#### API Logging Standards

```typescript
import winston from 'winston';

export const apiLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'career-connect-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/api-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/api-combined.log' }),
  ],
});

// Log API requests
export function logApiRequest(request: NextRequest, response: NextResponse, duration: number) {
  apiLogger.info('API Request', {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    status: response.status,
    duration,
    timestamp: new Date().toISOString(),
  });
}
```

### 14. Career Connect Specific Rules

#### Job Management APIs

- Job status MUST be validated (`DRAFT`, `ACTIVE`, `EXPIRED`, `FILLED`)
- Salary ranges MUST support VND currency formatting
- Location MUST include Vietnamese provinces/cities
- Skills MUST be normalized and stored consistently

#### Application Management APIs

- Prevent duplicate applications for same job+candidate
- Track application status changes with audit trail
- Implement application withdrawal functionality
- Support bulk operations for HR users

#### Company Management APIs

- Verify company legitimacy before approval
- Support company logo uploads with image optimization
- Implement company rating and review system
- Track company subscription/payment status

#### Search & Filtering APIs

- Support Vietnamese text search with proper tokenization
- Implement salary range filtering in VND
- Location-based search with distance calculation
- Skill-based matching with relevance scoring
- Save search preferences for logged-in users

## Critical Security Notes

- NEVER expose user personal information without permission
- ALWAYS mask sensitive data in logs
- Implement proper data retention policies
- Regular security audits for vulnerabilities
- Monitor for suspicious activity patterns

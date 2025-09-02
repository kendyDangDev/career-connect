# WARP Development Rules - Career Connect Job Portal

## Project Overview

- **Type:** Next.js 15 Job Portal Application
- **Purpose:** Connect job seekers with employers
- **Tech Stack:** Next.js, TypeScript, Prisma, PostgreSQL, Redis
- **State Management:** React Query for API + Redux ToolKit for managing global UI state.
- **CSS Framework:** Tailwind CSS + Radix UI + Shadcn/ui
- **Target Users:** Job seekers, HR professionals, Employers

## Core Development Principles

### 1. Project Structure

ALWAYS follow this exact directory structure:

```
/src
  /app                 # App Router (Next.js 15)
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

### 2. Naming Conventions (STRICT)

- **Files:** kebab-case (`job-list.tsx`, `user-profile.ts`)
- **Components:** PascalCase (`JobCard`, `ApplicationForm`)
- **Functions/Variables:** camelCase (`getUserJobs`, `isAuthenticated`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_BASE_URL`)
- **Database entities:** snake_case (`user_profiles`, `job_applications`)

### 3. TypeScript Requirements

- ALWAYS use strict TypeScript
- NEVER use `any` type - use proper interfaces or `unknown`
- ALL functions must have explicit return types
- ALL props must be properly typed with interfaces

```typescript
// ✅ CORRECT
interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  className?: string;
}

export const JobCard: FC<JobCardProps> = ({ job, onApply, className }) => {
  // implementation
};

// ❌ WRONG
export const JobCard = ({ job, onApply, className }: any) => {
  // implementation
};
```

### 4. Error Handling (MANDATORY)

- ALL async functions MUST have try-catch blocks
- ALL API routes MUST return proper error responses
- NEVER expose internal errors to the client

```typescript
// ✅ CORRECT API error handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // logic here
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 5. Security Rules (NON-NEGOTIABLE)

- ALWAYS validate input with Zod schemas
- NEVER store passwords in plain text (use bcrypt)
- ALWAYS use HTTPS in production
- ALWAYS sanitize user input before display
- File uploads MUST be validated for type and size

### 6. Performance Requirements

- Images MUST use Next.js Image component with optimization
- Large components MUST use dynamic imports
- Database queries MUST include proper indexing
- API responses MUST implement pagination for lists
- Bundle size MUST stay under 1MB

### 7. Testing Requirements

- ALL new components MUST have unit tests
- ALL API routes MUST have integration tests
- Coverage MUST be minimum 80%
- Critical user flows MUST have E2E tests

### 8. Git Workflow

- Branch naming: `feature/job-search`, `bugfix/login-error`, `hotfix/security-patch`
- Commit format: `type(scope): description`
- ALL PRs MUST pass CI/CD checks
- Code reviews REQUIRED for all changes

### 9. Documentation

- ALL complex functions MUST have JSDoc comments
- API endpoints MUST be documented
- Database schema changes MUST be documented
- README.md MUST be kept up to date

### 10. Environment & Deployment

- Environment variables MUST be validated with Zod
- NEVER commit secrets to git
- Production deployments MUST go through staging first
- Database migrations MUST be reviewed and tested

## Code Quality Standards

### Component Structure

```typescript
'use client'; // Only when needed

import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // proper typing
}

export const Component: FC<ComponentProps> = (props) => {
  // hooks at top
  // state management
  // event handlers
  // render logic

  return (
    <div className={cn("base-styles", props.className)}>
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

### Database Query Pattern

```typescript
// ALWAYS use this pattern for database operations
export async function getJobsWithFilters(filters: JobFilters) {
  try {
    return await prisma.job.findMany({
      where: buildWhereClause(filters),
      include: {
        company: {
          select: { name: true, logo: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });
  } catch (error) {
    console.error('Database query failed:', error);
    throw new Error('Failed to fetch jobs');
  }
}
```

## Important Notes for WARP AI

- This is a Vietnamese job portal project targeting Vietnamese market
- Business logic involves job postings, applications, company profiles, and candidate matching
- UI text should support Vietnamese language
- Date formats should follow Vietnamese standards (DD/MM/YYYY)
- Salary should support VND currency
- Location should include Vietnamese provinces and cities

## Compliance Requirements

- Follow all rules in `docs/rules.md` as the master reference
- Refer to `docs/database_schema.md` for data structure
- Check `prisma/schema.prisma` for current database models
- Maintain consistency with existing code patterns

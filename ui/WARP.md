# WARP UI Development Rules - Career Connect

## Frontend Development Standards

### 1. Component Architecture (STRICT)

#### Component Structure Template
```typescript
'use client'; // Only when client-side features needed

import { FC, useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { JobCardSchema } from '@/types/validation';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const JobCard: FC<JobCardProps> = ({ 
  job, 
  onApply, 
  onSave, 
  className,
  variant = 'default' 
}) => {
  // 1. Hooks (in order)
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(job.isSaved);

  // 2. Queries and mutations
  const { data: companyData } = useQuery({
    queryKey: ['company', job.companyId],
    queryFn: () => fetchCompany(job.companyId),
  });

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => applyToJob(jobId),
    onSuccess: () => {
      // Handle success
    },
    onError: (error) => {
      // Handle error
    },
  });

  // 3. Event handlers
  const handleApply = useCallback(() => {
    if (onApply) {
      onApply(job.id);
    } else {
      applyMutation.mutate(job.id);
    }
  }, [job.id, onApply, applyMutation]);

  const handleSave = useCallback(() => {
    setIsSaved(!isSaved);
    onSave?.(job.id);
  }, [job.id, isSaved, onSave]);

  // 4. Render logic
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      variant === 'compact' && "p-4",
      className
    )}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{job.title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            aria-label={isSaved ? 'Unsave job' : 'Save job'}
          >
            {isSaved ? '♥️' : '🤍'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Company info */}
          <div className="flex items-center gap-3">
            {companyData?.logo && (
              <Image
                src={companyData.logo}
                alt={`${companyData.name} logo`}
                width={32}
                height={32}
                className="rounded"
              />
            )}
            <span className="font-medium">{job.company.name}</span>
          </div>

          {/* Job details */}
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>📍 {job.location.city}, {job.location.province}</div>
            <div>💰 {formatSalary(job.salary)}</div>
            <div>⏰ {formatEmploymentType(job.employmentType)}</div>
            <div>📅 {formatDate(job.publishedAt)}</div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 5).map((skill) => (
              <Badge key={skill.id} variant="secondary">
                {skill.name}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="outline">+{job.skills.length - 5} more</Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleApply}
              disabled={isLoading || job.hasApplied}
              className="flex-1"
            >
              {job.hasApplied ? 'Applied' : 'Apply Now'}
            </Button>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
```

### 2. State Management Rules

#### React Query for Server State
```typescript
// ✅ CORRECT - Use React Query for all API calls
export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ApplicationData) => applyToJob(data),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['jobs']);
      queryClient.invalidateQueries(['applications', variables.candidateId]);
      
      // Show success notification
      toast.success('Application submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });
}
```

#### Redux for UI State
```typescript
// ✅ CORRECT - Use Redux only for global UI state
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  notifications: Notification[];
  searchFilters: JobFilters;
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'system',
    sidebarOpen: false,
    notifications: [],
    searchFilters: {},
  } as UIState,
  reducers: {
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    updateSearchFilters: (state, action: PayloadAction<JobFilters>) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
  },
});
```

### 3. Styling & Design System

#### Tailwind + Radix UI Pattern
```typescript
// ✅ CORRECT - Consistent component styling
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const JobListCard = ({ job, className }: JobListCardProps) => (
  <Card className={cn(
    "group transition-all duration-200",
    "hover:shadow-lg hover:shadow-primary/5",
    "border-border/50 hover:border-primary/20",
    className
  )}>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {job.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {job.company.name}
          </p>
        </div>
        <Badge 
          variant={job.employmentType === 'FULL_TIME' ? 'default' : 'secondary'}
          className="shrink-0"
        >
          {formatEmploymentType(job.employmentType)}
        </Badge>
      </div>
    </CardHeader>
    
    <CardContent>
      {/* Content here */}
    </CardContent>
  </Card>
);
```

#### Responsive Design Rules
```typescript
// ALWAYS use mobile-first responsive design
<div className={cn(
  // Mobile first (default)
  "flex flex-col space-y-4 p-4",
  // Tablet
  "md:flex-row md:space-y-0 md:space-x-6 md:p-6",
  // Desktop
  "lg:p-8 xl:space-x-8",
  // Large screens
  "2xl:max-w-7xl 2xl:mx-auto"
)}>
  <aside className={cn(
    // Mobile: full width
    "w-full",
    // Desktop: sidebar
    "lg:w-1/4 lg:shrink-0"
  )}>
    {/* Sidebar content */}
  </aside>
  
  <main className={cn(
    "w-full",
    "lg:w-3/4"
  )}>
    {/* Main content */}
  </main>
</div>
```

### 4. Form Handling Standards

#### React Hook Form + Zod Pattern
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const JobApplicationSchema = z.object({
  coverLetter: z.string()
    .min(50, 'Cover letter must be at least 50 characters')
    .max(2000, 'Cover letter cannot exceed 2000 characters'),
  cvFile: z.instanceof(FileList)
    .refine((files) => files.length > 0, 'CV file is required')
    .refine((files) => files[0]?.size <= 5 * 1024 * 1024, 'CV must be less than 5MB'),
  agreedToTerms: z.boolean()
    .refine((val) => val === true, 'You must agree to terms and conditions'),
});

type JobApplicationFormData = z.infer<typeof JobApplicationSchema>;

export const JobApplicationForm: FC<JobApplicationFormProps> = ({ jobId, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<JobApplicationFormData>({
    resolver: zodResolver(JobApplicationSchema),
    defaultValues: {
      coverLetter: '',
      agreedToTerms: false,
    },
  });

  const applyMutation = useApplyToJob();

  const onSubmit = async (data: JobApplicationFormData) => {
    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('coverLetter', data.coverLetter);
      formData.append('cvFile', data.cvFile[0]);

      await applyMutation.mutateAsync(formData);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="coverLetter">Cover Letter *</Label>
        <Textarea
          id="coverLetter"
          {...register('coverLetter')}
          placeholder="Tell us why you're interested in this position..."
          className="min-h-[120px]"
          aria-describedby={errors.coverLetter ? 'coverLetter-error' : undefined}
        />
        {errors.coverLetter && (
          <p id="coverLetter-error" className="text-sm text-destructive">
            {errors.coverLetter.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cvFile">CV File *</Label>
        <Input
          id="cvFile"
          type="file"
          accept=".pdf,.doc,.docx"
          {...register('cvFile')}
          aria-describedby={errors.cvFile ? 'cvFile-error' : undefined}
        />
        {errors.cvFile && (
          <p id="cvFile-error" className="text-sm text-destructive">
            {errors.cvFile.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="agreedToTerms"
          {...register('agreedToTerms')}
        />
        <Label htmlFor="agreedToTerms" className="text-sm">
          I agree to the{' '}
          <Link href="/terms" className="text-primary underline">
            Terms and Conditions
          </Link>
        </Label>
      </div>
      {errors.agreedToTerms && (
        <p className="text-sm text-destructive">
          {errors.agreedToTerms.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  );
};
```

### 2. Data Fetching & Loading States

#### Loading States Management
```typescript
// ✅ CORRECT - Comprehensive loading state handling
export const JobsList: FC<JobsListProps> = ({ filters }) => {
  const {
    data: jobsData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useJobs(filters);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Something went wrong</h3>
        <p className="text-muted-foreground">
          {error?.message || 'Failed to load jobs'}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (!jobsData?.data?.length) {
    return (
      <div className="text-center py-12">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search filters or check back later.
        </p>
      </div>
    );
  }

  // Success state with data
  return (
    <div className="space-y-4">
      {/* Background refetch indicator */}
      {isFetching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating results...
        </div>
      )}
      
      {jobsData.data.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
      
      {/* Pagination */}
      <Pagination
        currentPage={jobsData.pagination.page}
        totalPages={jobsData.pagination.totalPages}
        onPageChange={(page) => {
          // Update URL params or filters
        }}
      />
    </div>
  );
};
```

### 3. Accessibility Rules (WCAG 2.1 AA)

#### Keyboard Navigation
```typescript
// ALWAYS implement proper keyboard navigation
export const SearchFilters: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        if (event.target === event.currentTarget) {
          setIsOpen(!isOpen);
          event.preventDefault();
        }
        break;
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="true"
      aria-label="Open search filters"
      className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <Filter className="h-4 w-4" />
      <span className="sr-only">Filter jobs</span>
    </div>
  );
};
```

#### Screen Reader Support
```typescript
// ALWAYS provide proper ARIA labels and descriptions
<div className="search-results" role="region" aria-label="Job search results">
  <div className="sr-only" aria-live="polite" aria-atomic="true">
    {isLoading ? 'Loading jobs...' : `${jobsData?.pagination.total || 0} jobs found`}
  </div>
  
  <h2 className="text-xl font-semibold mb-4">
    Search Results
    <span className="text-muted-foreground text-base font-normal">
      ({jobsData?.pagination.total || 0} jobs)
    </span>
  </h2>
  
  <div className="space-y-4" role="list">
    {jobs.map((job, index) => (
      <div key={job.id} role="listitem">
        <JobCard job={job} />
      </div>
    ))}
  </div>
</div>
```

### 4. Performance Optimization Rules

#### Image Optimization
```typescript
// ALWAYS use Next.js Image component
import Image from 'next/image';

const CompanyLogo: FC<CompanyLogoProps> = ({ company, size = 'md' }) => {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 64, height: 64 },
    lg: { width: 128, height: 128 },
  };

  return (
    <div className="relative overflow-hidden rounded-md">
      <Image
        src={company.logo || '/default-company-logo.png'}
        alt={`${company.name} logo`}
        width={sizeMap[size].width}
        height={sizeMap[size].height}
        className="object-cover"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        priority={size === 'lg'} // Priority for large images above fold
      />
    </div>
  );
};
```

#### Code Splitting & Lazy Loading
```typescript
// ✅ CORRECT - Dynamic imports for heavy components
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
const JobDetailsModal = dynamic(
  () => import('./job-details-modal'),
  {
    loading: () => <JobDetailsSkeleton />,
    ssr: false, // Don't render on server if not needed
  }
);

const CompanyProfileChart = dynamic(
  () => import('./company-profile-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

// Use Suspense for better loading states
export const JobDetailsPage: FC = ({ jobId }) => (
  <div className="space-y-6">
    <JobHeader jobId={jobId} />
    
    <Suspense fallback={<JobDetailsSkeleton />}>
      <JobDetailsModal jobId={jobId} />
    </Suspense>
    
    <Suspense fallback={<div>Loading related jobs...</div>}>
      <RelatedJobs jobId={jobId} />
    </Suspense>
  </div>
);
```

### 5. Vietnamese Localization Rules

#### Text & Formatting
```typescript
// Vietnamese date formatting
export function formatVietnameseDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

// Vietnamese currency formatting
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Vietnamese text handling
export function normalizeVietnameseText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics for search
    .trim();
}

// Usage in components
const JobSalary: FC<{ salary: SalaryRange }> = ({ salary }) => (
  <div className="flex items-center gap-1">
    <span className="text-muted-foreground">💰</span>
    <span>
      {formatVND(salary.min)} - {formatVND(salary.max)}
    </span>
  </div>
);
```

### 6. Search & Filter UI Rules

#### Search Interface Implementation
```typescript
export const JobSearchForm: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<JobFilters>({});
  const router = useRouter();
  
  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      router.push(`/jobs?${params.toString()}`);
    }, 300),
    [router]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm việc làm, công ty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 h-12"
          aria-label="Search jobs and companies"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <LocationFilter
          value={filters.location}
          onChange={(location) => setFilters({...filters, location})}
        />
        <SalaryRangeFilter
          value={filters.salary}
          onChange={(salary) => setFilters({...filters, salary})}
        />
        <ExperienceLevelFilter
          value={filters.experienceLevel}
          onChange={(level) => setFilters({...filters, experienceLevel: level})}
        />
      </div>
    </div>
  );
};
```

### 7. Mobile-First Design Rules

#### Touch-Friendly Interface
```typescript
// ✅ CORRECT - Mobile-optimized components
const MobileJobCard: FC<JobCardProps> = ({ job }) => (
  <Card className="mx-4 my-3 border-0 shadow-sm">
    <CardContent className="p-4">
      {/* Header with save button */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-3">
          <h3 className="font-semibold text-base line-clamp-2 leading-tight">
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {job.company.name}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 shrink-0" // 44px minimum touch target
          aria-label="Save job"
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{job.location.city}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          <span className="truncate">{formatSalaryRange(job.salary)}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1 mb-4">
        {job.skills.slice(0, 3).map((skill) => (
          <Badge key={skill.id} variant="secondary" className="text-xs px-2 py-1">
            {skill.name}
          </Badge>
        ))}
        {job.skills.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{job.skills.length - 3}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button className="flex-1 h-10"> {/* 44px touch target */}
          Apply Now
        </Button>
        <Button variant="outline" className="h-10 w-10">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);
```

### 8. Error Handling & User Feedback

#### Error Boundaries
```typescript
'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <div>
          <h2 className="text-lg font-semibold">Oops! Something went wrong</h2>
          <p className="text-muted-foreground">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        <Button onClick={resetErrorBoundary}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

// Wrap components that might error
export const JobsPage: FC = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <div className="container mx-auto py-6">
      <JobSearchForm />
      <JobsList />
    </div>
  </ErrorBoundary>
);
```

#### Toast Notifications
```typescript
// ✅ CORRECT - User feedback with toast notifications
import { toast } from 'sonner';

export const useJobActions = () => {
  const applyMutation = useMutation({
    mutationFn: applyToJob,
    onSuccess: (data) => {
      toast.success('Application submitted successfully!', {
        description: `Applied for ${data.job.title} at ${data.job.company.name}`,
        action: {
          label: 'View',
          onClick: () => router.push('/applications'),
        },
      });
    },
    onError: (error) => {
      toast.error('Failed to submit application', {
        description: error.message,
        action: {
          label: 'Retry',
          onClick: () => applyMutation.mutate(),
        },
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: saveJob,
    onSuccess: () => {
      toast.success('Job saved to your list');
    },
    onError: () => {
      toast.error('Failed to save job');
    },
  });

  return { applyMutation, saveMutation };
};
```

### 9. Layout & Navigation Rules

#### Responsive Layout Pattern
```typescript
export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Logo />
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <NavigationLink href="/jobs">Jobs</NavigationLink>
            <NavigationLink href="/companies">Companies</NavigationLink>
            <UserMenu />
          </nav>
        </div>
      </header>

      <div className="flex">
        {/* Mobile sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <MobileSidebar onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 border-r bg-muted/10">
          <DesktopSidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
```

### 10. Career Connect UI Specific Rules

#### Job Card Variants
```typescript
// Different job card layouts for different contexts
export const JobCardVariants = {
  // List view (default)
  list: "flex flex-col space-y-4 p-6",
  
  // Grid view
  grid: "aspect-square p-4 flex flex-col justify-between",
  
  // Featured job
  featured: "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 p-6",
  
  // Compact view for mobile
  compact: "p-4 space-y-2",
};

// Usage
<JobCard 
  job={job} 
  variant="featured"
  className="col-span-2" // For grid layouts
/>
```

#### Vietnamese UI Text Standards
```typescript
// UI text constants
export const UI_TEXT = {
  buttons: {
    apply: 'Ứng tuyển',
    save: 'Lưu tin',
    search: 'Tìm kiếm',
    filter: 'Lọc',
    viewMore: 'Xem thêm',
    viewLess: 'Thu gọn',
  },
  labels: {
    salary: 'Mức lương',
    location: 'Địa điểm',
    experience: 'Kinh nghiệm',
    skills: 'Kỹ năng',
    jobType: 'Loại hình',
    company: 'Công ty',
  },
  messages: {
    noJobsFound: 'Không tìm thấy việc làm phù hợp',
    loading: 'Đang tải...',
    error: 'Có lỗi xảy ra',
    success: 'Thành công',
  },
} as const;
```

#### Form Validation Messages
```typescript
// Vietnamese validation messages
export const ValidationMessages = {
  required: 'Trường này là bắt buộc',
  email: 'Email không hợp lệ',
  phone: 'Số điện thoại không hợp lệ',
  minLength: (min: number) => `Tối thiểu ${min} ký tự`,
  maxLength: (max: number) => `Tối đa ${max} ký tự`,
  fileSize: 'File quá lớn (tối đa 5MB)',
  fileType: 'Định dạng file không được hỗ trợ',
  password: {
    minLength: 'Mật khẩu phải có ít nhất 8 ký tự',
    complexity: 'Mật khẩu phải chứa chữ hoa, chữ thường và số',
  },
} as const;
```

### 11. Component Testing Rules

#### Unit Testing Pattern
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { JobCard } from './job-card';

const renderWithProviders = (component: ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('JobCard Component', () => {
  const mockJob: Job = {
    id: 'job-1',
    title: 'Frontend Developer',
    company: { name: 'Tech Corp', logo: '/logo.png' },
    location: { city: 'Ho Chi Minh City', province: 'Ho Chi Minh' },
    salary: { min: 15000000, max: 25000000, currency: 'VND' },
    skills: [{ id: '1', name: 'React' }, { id: '2', name: 'TypeScript' }],
    publishedAt: new Date(),
  };

  it('should display job information correctly', () => {
    renderWithProviders(<JobCard job={mockJob} />);
    
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Ho Chi Minh City, Ho Chi Minh')).toBeInTheDocument();
  });

  it('should handle apply action', async () => {
    const mockOnApply = jest.fn();
    renderWithProviders(<JobCard job={mockJob} onApply={mockOnApply} />);
    
    const applyButton = screen.getByText('Apply Now');
    fireEvent.click(applyButton);
    
    expect(mockOnApply).toHaveBeenCalledWith('job-1');
  });

  it('should be accessible with keyboard navigation', () => {
    renderWithProviders(<JobCard job={mockJob} />);
    
    const applyButton = screen.getByText('Apply Now');
    applyButton.focus();
    
    expect(applyButton).toHaveFocus();
    
    fireEvent.keyDown(applyButton, { key: 'Enter' });
    // Verify action was triggered
  });
});
```

### 12. Performance Monitoring

#### Web Vitals Tracking
```typescript
// Monitor Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log('Web Vital:', metric);
}

// Use in _app.tsx or layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
```

## Critical UI/UX Notes
- ALWAYS prioritize mobile experience (60%+ Vietnamese users are mobile)
- Support Vietnamese input methods and text display
- Use culturally appropriate icons and colors
- Implement proper loading states for slow connections
- Ensure accessibility for users with disabilities
- Test on actual mobile devices, not just browser dev tools

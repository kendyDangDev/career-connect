# Employer Job Management API Documentation

## Overview

API endpoints for employers to manage job postings (tin tuyển dụng) in the system.

## Authentication

All endpoints require employer authentication with company association.

## Base URL

`/api/employer/jobs`

## Endpoints

### 1. List Jobs

**GET** `/api/employer/jobs`

Get paginated list of jobs for the employer's company.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by title or location
- `status` (JobStatus): Filter by job status
- `jobType` (JobType): Filter by job type
- `experienceLevel` (ExperienceLevel): Filter by experience level
- `sortBy` (string): Sort field (createdAt, title, applicationDeadline, applicationCount, viewCount)
- `sortOrder` (string): Sort order (asc, desc)
- `fromDate` (string): Filter jobs created from date
- `toDate` (string): Filter jobs created to date

**Response:**

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "string",
        "title": "Senior Software Engineer",
        "slug": "senior-software-engineer-techcorp",
        "jobType": "FULL_TIME",
        "workLocationType": "HYBRID",
        "experienceLevel": "SENIOR",
        "salaryMin": 30000000,
        "salaryMax": 50000000,
        "currency": "VND",
        "salaryNegotiable": false,
        "locationCity": "Ho Chi Minh",
        "locationProvince": "Ho Chi Minh",
        "applicationDeadline": "2025-02-01T00:00:00Z",
        "status": "ACTIVE",
        "viewCount": 150,
        "applicationCount": 25,
        "featured": false,
        "urgent": false,
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z",
        "publishedAt": "2025-01-02T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    },
    "stats": {
      "totalJobs": 25,
      "activeJobs": 15,
      "draftJobs": 5,
      "closedJobs": 5
    }
  }
}
```

### 2. Create Job

**POST** `/api/employer/jobs`

Create a new job posting.

**Requirements:**

- Company must be verified
- User must have job posting permissions (ADMIN, HR_MANAGER, RECRUITER)

**Request Body:**

```json
{
  "title": "Senior Software Engineer",
  "description": "<p>We are looking for a talented senior engineer...</p>",
  "requirements": "<ul><li>5+ years experience</li><li>Strong in React/Node.js</li></ul>",
  "benefits": "<ul><li>Competitive salary</li><li>Health insurance</li></ul>",
  "jobType": "FULL_TIME",
  "workLocationType": "HYBRID",
  "experienceLevel": "SENIOR",
  "salaryMin": 30000000,
  "salaryMax": 50000000,
  "currency": "VND",
  "salaryNegotiable": false,
  "locationCity": "Ho Chi Minh",
  "locationProvince": "Ho Chi Minh",
  "locationCountry": "Vietnam",
  "applicationDeadline": "2025-02-01",
  "skills": [
    {
      "skillId": "skill-id-1",
      "requiredLevel": "REQUIRED",
      "minYearsExperience": 3
    },
    {
      "skillId": "skill-id-2",
      "requiredLevel": "PREFERRED",
      "minYearsExperience": 1
    }
  ],
  "categories": ["category-id-1", "category-id-2"],
  "featured": false,
  "urgent": false
}
```

**Validation Rules:**

- `title`: 10-200 characters, alphanumeric and basic punctuation
- `description`: 50-10,000 characters (plain text after stripping HTML)
- `requirements`: 50-5,000 characters (plain text after stripping HTML)
- `benefits`: max 3,000 characters (optional)
- `salaryMin/salaryMax`: 0-999,999,999
- `applicationDeadline`: At least 3 days from now, max 365 days

**Response:**

```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    /* Job detail object */
  }
}
```

### 3. Get Job Detail

**GET** `/api/employer/jobs/{id}`

Get detailed information about a specific job.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "Senior Software Engineer",
    "slug": "senior-software-engineer-techcorp",
    "description": "<p>Detailed job description...</p>",
    "requirements": "<ul><li>Requirements list...</li></ul>",
    "benefits": "<ul><li>Benefits list...</li></ul>",
    "jobType": "FULL_TIME",
    "workLocationType": "HYBRID",
    "experienceLevel": "SENIOR",
    "salaryMin": 30000000,
    "salaryMax": 50000000,
    "currency": "VND",
    "salaryNegotiable": false,
    "locationCity": "Ho Chi Minh",
    "locationProvince": "Ho Chi Minh",
    "locationCountry": "Vietnam",
    "applicationDeadline": "2025-02-01T00:00:00Z",
    "status": "ACTIVE",
    "viewCount": 150,
    "applicationCount": 25,
    "featured": false,
    "urgent": false,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "publishedAt": "2025-01-02T00:00:00Z",
    "company": {
      "id": "string",
      "companyName": "TechCorp",
      "companySlug": "techcorp",
      "logoUrl": "/uploads/companies/logos/techcorp.png",
      "verificationStatus": "VERIFIED"
    },
    "jobSkills": [
      {
        "id": "string",
        "requiredLevel": "REQUIRED",
        "minYearsExperience": 3,
        "skill": {
          "id": "string",
          "name": "React",
          "slug": "react",
          "category": "TECHNICAL"
        }
      }
    ],
    "jobCategories": [
      {
        "id": "string",
        "category": {
          "id": "string",
          "name": "Software Development",
          "slug": "software-development"
        }
      }
    ],
    "_count": {
      "applications": 25,
      "savedJobs": 50,
      "jobViews": 150
    }
  }
}
```

### 4. Update Job

**PUT** `/api/employer/jobs/{id}`

Update an existing job posting.

**Request Body:**
Same as create job, with all fields optional. Additionally can update `status`.

**Response:**

```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    /* Updated job detail */
  }
}
```

### 5. Update Job Status

**PATCH** `/api/employer/jobs/{id}/status`

Change the status of a job posting.

**Request Body:**

```json
{
  "status": "PAUSED",
  "reason": "Temporarily pausing to review applications",
  "notifyApplicants": true
}
```

**Status Transitions:**

- `DRAFT` → `ACTIVE` (publish job)
- `ACTIVE` → `PAUSED`, `CLOSED`, `EXPIRED`
- `PAUSED` → `ACTIVE`, `CLOSED`
- `CLOSED` and `EXPIRED` are final states

**Response:**

```json
{
  "success": true,
  "message": "Job status updated to PAUSED",
  "data": {
    "id": "string",
    "previousStatus": "ACTIVE",
    "newStatus": "PAUSED",
    "job": {
      /* Updated job detail */
    }
  }
}
```

### 6. Duplicate Job

**POST** `/api/employer/jobs/{id}/duplicate`

Create a copy of an existing job posting.

**Request Body (Optional):**

```json
{
  "title": "Senior Software Engineer (New Position)",
  "status": "DRAFT"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Job duplicated successfully",
  "data": {
    "originalJobId": "original-job-id",
    "duplicatedJob": {
      /* New job detail */
    }
  }
}
```

### 7. Delete Job

**DELETE** `/api/employer/jobs/{id}`

Delete a job posting (soft delete by changing status to CLOSED).

**Restrictions:**

- Cannot delete jobs with existing applications
- Use status change to CLOSED instead

**Response:**

```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

### 8. Get Job Statistics

**GET** `/api/employer/jobs/{id}/stats`

Get detailed statistics and analytics for a job posting.

**Response:**

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "string",
      "title": "Senior Software Engineer",
      "status": "ACTIVE",
      "createdAt": "2025-01-01T00:00:00Z",
      "publishedAt": "2025-01-02T00:00:00Z",
      "applicationDeadline": "2025-02-01T00:00:00Z",
      "salaryRange": "₫30.000.000 - ₫50.000.000"
    },
    "metrics": {
      "totalViews": 500,
      "uniqueViews": 350,
      "viewsLastWeek": 150,
      "viewsLastMonth": 400,
      "totalApplications": 50,
      "applicationsLastWeek": 15,
      "applicationsLastMonth": 45,
      "applicationsByStatus": [
        { "status": "APPLIED", "count": 30 },
        { "status": "SCREENING", "count": 10 },
        { "status": "INTERVIEWING", "count": 5 },
        { "status": "REJECTED", "count": 5 }
      ],
      "conversionRate": 10,
      "daysActive": 30,
      "daysUntilDeadline": 29,
      "applicationRate": 1.67,
      "viewToApplicationRate": 10,
      "applicationFunnel": {
        "views": 500,
        "uniqueViews": 350,
        "applications": 50,
        "viewToApplicationRate": 10
      },
      "performance": {
        "viewsPerDay": 17,
        "applicationsPerDay": 1.67,
        "trending": "up"
      }
    }
  }
}
```

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized - Please login"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "You don't have permission to create job postings"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Job not found"
}
```

### 400 Bad Request

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "title": "Title must be at least 10 characters",
    "applicationDeadline": "Application deadline must be at least 3 days from now"
  }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to create job"
}
```

## Job Status Types

- `DRAFT`: Job is saved but not published
- `ACTIVE`: Job is live and accepting applications
- `PAUSED`: Job is temporarily not accepting applications
- `CLOSED`: Job is permanently closed
- `EXPIRED`: Job has passed application deadline

## Job Type Values

- `FULL_TIME`: Full-time position
- `PART_TIME`: Part-time position
- `CONTRACT`: Contract/Freelance
- `INTERNSHIP`: Internship position

## Work Location Types

- `ONSITE`: Work from office
- `REMOTE`: Work from home
- `HYBRID`: Mix of office and remote

## Experience Levels

- `ENTRY`: Entry level (0-2 years)
- `MID`: Mid level (2-5 years)
- `SENIOR`: Senior level (5+ years)
- `LEAD`: Lead/Principal level
- `EXECUTIVE`: Executive level

## Required Levels (for skills)

- `NICE_TO_HAVE`: Optional skill
- `PREFERRED`: Preferred skill
- `REQUIRED`: Required skill

## Implementation Notes

1. **Rich Text Editor**: Description, requirements, and benefits support HTML content
2. **Auto-expire**: Jobs automatically expire when past application deadline
3. **Slug Generation**: Automatic from job title and company name
4. **View Tracking**: Each job view is tracked for analytics
5. **Application Count**: Automatically incremented when applications are received
6. **Draft Jobs**: Not visible to candidates until published (status = ACTIVE)

## Future Enhancements

1. **Job Templates**: Pre-defined templates for common positions
2. **Bulk Operations**: Update multiple jobs at once
3. **Schedule Publishing**: Set future publish date for jobs
4. **A/B Testing**: Test different job descriptions
5. **AI Suggestions**: AI-powered job description improvements
6. **Multi-language**: Support for job postings in multiple languages
7. **Job Boost**: Paid promotion options for increased visibility

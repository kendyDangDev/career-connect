# Employer Application Management API Documentation

## Overview

API endpoints for employers to manage job applications, including viewing, filtering, updating status, and analyzing candidate quality.

## Authentication

All endpoints require employer authentication:
- User must be logged in with `role = "EMPLOYER"`
- User must have a valid `companyId` association

## Base URLs

- Job Applications: `/api/employer/jobs/{jobId}/applications`
- Application Management: `/api/employer/applications`

## Endpoints

### 1. Get Job Applications

**GET** `/api/employer/jobs/{jobId}/applications`

Retrieve a paginated list of applications for a specific job posting.

**Path Parameters:**
- `jobId` (string): The ID of the job posting

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sortBy` (string): Sort field (default: "appliedAt")
  - Options: `appliedAt`, `matchScore`, `candidateName`, `experienceLevel`, `status`
- `sortOrder` (string): Sort order (default: "desc")
  - Options: `asc`, `desc`
- `search` (string): Search by candidate name, email, or skills
- `includeScores` (boolean): Include AI match scores (default: false)
- `filter` (JSON string): Advanced filter criteria

**Filter Object Structure:**
```json
{
  "status": ["APPLIED", "REVIEWING"],
  "experienceYears": {
    "min": 2,
    "max": 5
  },
  "rating": {
    "min": 3,
    "max": 5
  },
  "hasRequiredSkills": true,
  "location": ["Hanoi", "HCMC"],
  "education": ["BACHELOR", "MASTER"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "string",
        "jobId": "string",
        "candidateId": "string",
        "status": "APPLIED",
        "appliedAt": "2025-01-01T00:00:00Z",
        "statusUpdatedAt": "2025-01-01T00:00:00Z",
        "rating": 4,
        "notes": "Good candidate with strong technical skills",
        "matchScore": 85.5,
        "scoreDetails": {
          "skills": 90,
          "experience": 85,
          "education": 80,
          "location": 100
        },
        "candidate": {
          "id": "string",
          "user": {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "phone": "+84123456789"
          },
          "experienceYears": 5,
          "currentJobTitle": "Senior Developer",
          "preferredLocations": ["Hanoi"],
          "skills": [
            {
              "skill": {
                "id": "string",
                "name": "JavaScript"
              },
              "yearsOfExperience": 3,
              "proficiencyLevel": "ADVANCED"
            }
          ]
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "summary": {
      "totalApplications": 150,
      "newApplications": 25,
      "averageMatchScore": 72.5
    }
  }
}
```

### 2. Get Application Detail

**GET** `/api/employer/applications/{id}`

Retrieve detailed information about a specific application.

**Path Parameters:**
- `id` (string): The application ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "jobId": "string",
    "job": {
      "id": "string",
      "title": "Senior Software Engineer",
      "department": "Engineering"
    },
    "candidateId": "string",
    "status": "REVIEWING",
    "appliedAt": "2025-01-01T00:00:00Z",
    "statusUpdatedAt": "2025-01-02T00:00:00Z",
    "rating": 4,
    "notes": "Strong technical background, good cultural fit",
    "coverLetter": "Dear Hiring Manager...",
    "resumeUrl": "https://storage.example.com/resumes/123.pdf",
    "matchScore": 85.5,
    "scoreDetails": {
      "skills": 90,
      "experience": 85,
      "education": 80,
      "location": 100
    },
    "candidate": {
      "id": "string",
      "user": {
        "id": "string",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+84123456789"
      },
      "experienceYears": 5,
      "currentJobTitle": "Senior Developer",
      "currentCompany": "Tech Corp",
      "preferredSalary": {
        "min": 1000,
        "max": 1500,
        "currency": "USD"
      },
      "preferredLocations": ["Hanoi", "HCMC"],
      "about": "Passionate software engineer...",
      "skills": [
        {
          "skill": {
            "id": "string",
            "name": "JavaScript",
            "category": "Programming Languages"
          },
          "yearsOfExperience": 3,
          "proficiencyLevel": "ADVANCED"
        }
      ],
      "experiences": [
        {
          "id": "string",
          "jobTitle": "Senior Developer",
          "company": "Tech Corp",
          "location": "Hanoi",
          "startDate": "2020-01-01",
          "endDate": null,
          "current": true,
          "description": "Leading frontend development..."
        }
      ],
      "educations": [
        {
          "id": "string",
          "school": "FPT University",
          "degree": "BACHELOR",
          "fieldOfStudy": "Computer Science",
          "startDate": "2015-09-01",
          "endDate": "2019-06-01",
          "grade": "3.8/4.0"
        }
      ]
    },
    "timeline": [
      {
        "id": "string",
        "action": "STATUS_CHANGED",
        "fromStatus": "APPLIED",
        "toStatus": "REVIEWING",
        "notes": "Moving to review stage",
        "createdBy": {
          "id": "string",
          "name": "HR Manager"
        },
        "createdAt": "2025-01-02T00:00:00Z"
      }
    ],
    "interviewSchedule": {
      "scheduledAt": "2025-01-10T10:00:00Z",
      "type": "TECHNICAL",
      "location": "Online - Google Meet",
      "interviewers": ["John Smith", "Jane Doe"]
    }
  }
}
```

### 3. Update Application Status

**PATCH** `/api/employer/applications/{id}/status`

Update the status of an application with optional rating and notes.

**Path Parameters:**
- `id` (string): The application ID

**Request Body:**
```json
{
  "status": "REVIEWING",
  "rating": 4,
  "notes": "Good candidate, scheduling for technical interview",
  "interviewScheduledAt": "2025-01-10T10:00:00Z",
  "notifyCandidate": true
}
```

**Status Values:**
- `APPLIED`: Initial application status
- `REVIEWING`: Under review
- `SHORTLISTED`: Selected for next stage
- `INTERVIEWING`: In interview process
- `OFFERED`: Job offer extended
- `HIRED`: Candidate hired
- `REJECTED`: Application rejected
- `WITHDRAWN`: Candidate withdrew application

**Response:**
```json
{
  "success": true,
  "message": "Application status updated successfully"
}
```

### 4. Add Application Note

**POST** `/api/employer/applications/{id}/notes`

Add a note to an application. Notes are timestamped and maintain full history.

**Path Parameters:**
- `id` (string): The application ID

**Request Body:**
```json
{
  "note": "Candidate has strong technical skills but needs to improve communication during presentation"
}
```

**Validation:**
- Note is required and cannot be empty
- Maximum length: 1000 characters

**Response:**
```json
{
  "success": true,
  "message": "Note added successfully"
}
```

### 5. Filter Applications with AI Scoring

**POST** `/api/employer/jobs/{jobId}/applications/filter`

Advanced filtering with customizable AI scoring weights.

**Path Parameters:**
- `jobId` (string): The job ID

**Request Body:**
```json
{
  "filterCriteria": {
    "status": ["APPLIED", "REVIEWING"],
    "experienceYears": {
      "min": 2,
      "max": 8
    },
    "requiredSkills": ["JavaScript", "React"],
    "preferredSkills": ["TypeScript", "Node.js"],
    "education": ["BACHELOR", "MASTER"],
    "location": ["Hanoi"],
    "salaryExpectation": {
      "max": 2000
    }
  },
  "scoringConfig": {
    "weights": {
      "skills": 0.35,
      "experience": 0.25,
      "education": 0.20,
      "location": 0.10,
      "salary": 0.10
    },
    "skillsConfig": {
      "requiredSkillsWeight": 0.7,
      "preferredSkillsWeight": 0.3
    }
  }
}
```

**Scoring Weight Rules:**
- All weights must be between 0 and 1
- Total weights must sum to 1.0

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "string",
        "candidateName": "John Doe",
        "matchScore": 88.5,
        "scoreBreakdown": {
          "skills": 92,
          "experience": 85,
          "education": 90,
          "location": 100,
          "salary": 75
        },
        "status": "APPLIED",
        "appliedAt": "2025-01-01T00:00:00Z"
      }
    ],
    "totalCount": 45,
    "scoreDistribution": {
      "excellent": 10,
      "good": 20,
      "average": 12,
      "poor": 3
    },
    "filterCriteria": {...},
    "scoringConfig": {...}
  }
}
```

### 6. Bulk Update Applications

**POST** `/api/employer/applications/bulk-update`

Update multiple applications at once.

**Request Body:**
```json
{
  "applicationIds": ["id1", "id2", "id3"],
  "action": "UPDATE_STATUS",
  "status": "REJECTED",
  "rating": 2,
  "notes": "Not meeting minimum requirements",
  "notifyCandidates": true
}
```

**Supported Actions:**
- `UPDATE_STATUS`: Change application status
- `ADD_RATING`: Add or update rating
- `ADD_TAG`: Add tags (future enhancement)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Bulk update completed",
    "totalRequested": 3,
    "successCount": 3,
    "failedCount": 0,
    "results": [
      {
        "applicationId": "id1",
        "success": true
      },
      {
        "applicationId": "id2",
        "success": true
      },
      {
        "applicationId": "id3",
        "success": true
      }
    ]
  }
}
```

### 7. Get Application Statistics

**GET** `/api/employer/applications/stats`

Get comprehensive statistics about application quality and hiring metrics.

**Query Parameters:**
- `jobId` (string): Filter by specific job (optional)
- `timeRange` (string): Time period for statistics
  - Options: `7days`, `30days`, `90days`, `year`
  - Default: `30days`

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalApplications": 250,
      "averageTimeToHire": 21,
      "hireRate": 8,
      "timeRange": "30days",
      "dateRange": {
        "start": "2024-12-01T00:00:00Z",
        "end": "2025-01-01T00:00:00Z"
      }
    },
    "statusDistribution": {
      "APPLIED": {
        "count": 100,
        "percentage": 40
      },
      "REVIEWING": {
        "count": 50,
        "percentage": 20
      },
      "SHORTLISTED": {
        "count": 30,
        "percentage": 12
      },
      "INTERVIEWING": {
        "count": 25,
        "percentage": 10
      },
      "OFFERED": {
        "count": 10,
        "percentage": 4
      },
      "HIRED": {
        "count": 20,
        "percentage": 8
      },
      "REJECTED": {
        "count": 15,
        "percentage": 6
      },
      "WITHDRAWN": {
        "count": 0,
        "percentage": 0
      }
    },
    "ratingDistribution": {
      "5": 30,
      "4": 45,
      "3": 35,
      "2": 15,
      "1": 5,
      "unrated": 120
    },
    "experienceDistribution": {
      "0-2": 60,
      "3-5": 100,
      "6-10": 70,
      "10+": 20
    },
    "conversionFunnel": {
      "applied": 250,
      "reviewed": 150,
      "interviewed": 55,
      "hired": 20
    },
    "topSkills": [
      {
        "skill": "JavaScript",
        "count": 180
      },
      {
        "skill": "React",
        "count": 150
      },
      {
        "skill": "Node.js",
        "count": 120
      }
    ],
    "applicationsByJob": [
      {
        "jobId": "string",
        "jobTitle": "Senior Developer",
        "count": 80
      },
      {
        "jobId": "string",
        "jobTitle": "Frontend Engineer",
        "count": 60
      }
    ]
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden - Employer access only"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Application not found or access denied",
  "code": "APPLICATION_NOT_FOUND"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request data",
  "details": ["Specific validation errors"]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to perform operation",
  "code": "INTERNAL_ERROR"
}
```

## Error Codes

- `APPLICATION_NOT_FOUND`: Application doesn't exist or user lacks access
- `JOB_NOT_FOUND`: Job doesn't exist or user lacks access
- `INTERNAL_ERROR`: Server-side error occurred
- `INVALID_FILTER`: Filter criteria validation failed
- `INVALID_STATUS`: Invalid status transition

## Best Practices

1. **Performance Optimization**
   - Use pagination for large result sets
   - Include AI scores only when needed (`includeScores=true`)
   - Use filtering to reduce data transfer

2. **Status Management**
   - Follow logical status progression
   - Add notes when changing status
   - Notify candidates for important status changes

3. **AI Scoring**
   - Adjust weights based on job requirements
   - Use scoring for initial screening
   - Combine with manual review for best results

4. **Data Privacy**
   - Only show candidate contact info to authorized users
   - Log all status changes for audit trail
   - Respect candidate communication preferences

## Rate Limiting

- Standard rate limits apply to all endpoints
- Bulk operations count as single request
- AI scoring endpoints may have stricter limits

## Webhooks (Future Enhancement)

Planned webhooks for:
- New application received
- Application status changed
- Candidate message received
- Interview scheduled/rescheduled

## Notes

1. All timestamps are in UTC ISO 8601 format
2. Pagination is 1-indexed
3. Match scores are on a 0-100 scale
4. Ratings are on a 1-5 scale
5. All text searches are case-insensitive

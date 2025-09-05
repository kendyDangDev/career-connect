# Job Alert API Documentation

## Overview

The Job Alert API allows candidates to create, manage, and test job alerts based on their preferences. Job alerts help candidates receive notifications about new jobs matching their criteria.

## Authentication

All endpoints require authentication with a `CANDIDATE` user role.

## Endpoints

### 1. List Job Alerts

Get a paginated list of job alerts for the authenticated candidate.

**Endpoint:** `GET /api/candidate/job-alerts`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Items per page (1-100) |
| search | string | No | - | Search by alert name or keywords |
| isActive | boolean | No | - | Filter by active status |
| frequency | string | No | - | Filter by frequency (DAILY, WEEKLY, INSTANT) |
| hasKeywords | boolean | No | - | Filter alerts with/without keywords |
| hasLocations | boolean | No | - | Filter alerts with/without locations |
| hasCategories | boolean | No | - | Filter alerts with/without categories |
| sortBy | string | No | createdAt | Sort field (createdAt, alertName, lastSentAt, frequency) |
| sortOrder | string | No | desc | Sort order (asc, desc) |

**Response:**
```json
{
  "success": true,
  "message": "Job alerts retrieved successfully",
  "data": {
    "data": [
      {
        "id": "cuid",
        "candidateId": "cuid",
        "alertName": "Senior Developer Jobs",
        "keywords": "senior developer react",
        "locationIds": ["location-id-1", "location-id-2"],
        "categoryIds": ["category-id-1"],
        "jobType": "FULL_TIME",
        "salaryMin": "1000000",
        "experienceLevel": "SENIOR",
        "frequency": "WEEKLY",
        "isActive": true,
        "lastSentAt": "2025-01-01T00:00:00Z",
        "createdAt": "2025-01-01T00:00:00Z",
        "_count": {
          "matchingJobs": 15
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 2. Create Job Alert

Create a new job alert for the authenticated candidate.

**Endpoint:** `POST /api/candidate/job-alerts`

**Request Body:**
```json
{
  "alertName": "Senior Developer Jobs",
  "keywords": "senior developer react", // Optional
  "locationIds": ["location-id-1", "location-id-2"], // Optional
  "categoryIds": ["category-id-1"], // Optional
  "jobType": "FULL_TIME", // Optional: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
  "salaryMin": 1000000, // Optional
  "experienceLevel": "SENIOR", // Optional: ENTRY, MID, SENIOR, LEAD, EXECUTIVE
  "frequency": "WEEKLY" // Optional: DAILY, WEEKLY, INSTANT (default: WEEKLY)
}
```

**Validation Rules:**
- Alert name: 3-100 characters
- Keywords: Max 500 characters
- Max 10 locations
- Max 10 categories
- At least one filter criteria must be provided
- Maximum 10 alerts per candidate

**Response:**
```json
{
  "success": true,
  "message": "Job alert created successfully",
  "data": {
    "id": "cuid",
    "candidateId": "cuid",
    "alertName": "Senior Developer Jobs",
    "keywords": "senior developer react",
    "locationIds": ["location-id-1", "location-id-2"],
    "categoryIds": ["category-id-1"],
    "jobType": "FULL_TIME",
    "salaryMin": "1000000",
    "experienceLevel": "SENIOR",
    "frequency": "WEEKLY",
    "isActive": true,
    "lastSentAt": null,
    "createdAt": "2025-01-01T00:00:00Z",
    "_count": {
      "matchingJobs": 15
    }
  }
}
```

### 3. Update Job Alert

Update an existing job alert.

**Endpoint:** `PUT /api/candidate/job-alerts/{id}`

**Path Parameters:**
- `id` - Job alert ID

**Request Body:**
```json
{
  "alertName": "Updated Alert Name", // Optional
  "keywords": "new keywords", // Optional
  "locationIds": ["location-id-3"], // Optional
  "categoryIds": ["category-id-2"], // Optional
  "jobType": "REMOTE", // Optional
  "salaryMin": 1500000, // Optional
  "experienceLevel": "LEAD", // Optional
  "frequency": "DAILY", // Optional
  "isActive": true // Optional
}
```

**Response:** Same as Create Job Alert

### 4. Delete Job Alert

Delete a job alert.

**Endpoint:** `DELETE /api/candidate/job-alerts/{id}`

**Path Parameters:**
- `id` - Job alert ID

**Response:** 204 No Content

### 5. Toggle Job Alert Status

Activate or deactivate a job alert.

**Endpoint:** `PATCH /api/candidate/job-alerts/{id}/toggle-status`

**Path Parameters:**
- `id` - Job alert ID

**Request Body:**
```json
{
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job alert activated successfully",
  "data": {
    // Full job alert object
  }
}
```

### 6. Test Job Alert

Test a job alert by finding matching jobs.

**Endpoint:** `GET /api/candidate/job-alerts/{id}/test`

**Path Parameters:**
- `id` - Job alert ID

**Response:**
```json
{
  "success": true,
  "message": "Job alert tested successfully",
  "data": {
    "alert": {
      // Full job alert object
    },
    "matchingJobs": [
      {
        "id": "job-id",
        "title": "Senior React Developer",
        "slug": "senior-react-developer",
        "jobType": "FULL_TIME",
        "salaryMin": "1200000",
        "salaryMax": "1800000",
        "company": {
          "id": "company-id",
          "companyName": "Tech Company",
          "companySlug": "tech-company",
          "logoUrl": "https://...",
          "city": "Hanoi",
          "province": "Hanoi"
        },
        "_count": {
          "applications": 5,
          "savedJobs": 10
        }
      }
    ],
    "totalMatches": 15,
    "message": "Found 15 matching jobs"
  }
}
```

### 7. Get Job Alert Statistics

Get statistics about job alerts for the authenticated candidate.

**Endpoint:** `GET /api/candidate/job-alerts/stats`

**Response:**
```json
{
  "success": true,
  "message": "Job alert statistics retrieved successfully",
  "data": {
    "totalAlerts": 5,
    "activeAlerts": 3,
    "inactiveAlerts": 2,
    "byFrequency": {
      "daily": 1,
      "weekly": 3,
      "instant": 1
    }
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {} // Optional, contains additional error information
}
```

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - User not authenticated |
| 403 | Forbidden - User doesn't have required role |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource or limit reached |
| 500 | Internal Server Error |

### Validation Error Example

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "alertName": ["Tên thông báo phải có ít nhất 3 ký tự"],
    "salaryMin": ["Mức lương tối thiểu phải lớn hơn hoặc bằng 0"]
  }
}
```

## Notes

1. **Location and Category IDs**: These must be valid IDs from the system's locations and categories tables.

2. **Job Matching Logic**:
   - Keywords are searched in job title, description, and requirements
   - Location IDs match against job's city or province
   - Category IDs match through job categories relation
   - Salary matching considers negotiable jobs
   - Only active jobs with future or no deadline are matched

3. **Alert Frequency**:
   - `INSTANT`: Processed every hour
   - `DAILY`: Processed once every 24 hours
   - `WEEKLY`: Processed once every 7 days

4. **Limits**:
   - Maximum 10 job alerts per candidate
   - Maximum 10 locations per alert
   - Maximum 10 categories per alert

5. **Best Practices**:
   - Use specific keywords for better matching
   - Combine multiple criteria for more accurate results
   - Test alerts after creation to verify they match expected jobs
   - Regularly review and update alerts to keep them relevant

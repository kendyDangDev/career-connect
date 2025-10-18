# Saved Jobs API Documentation

## Overview
API endpoints for managing saved jobs functionality for candidates. All endpoints require authentication with a CANDIDATE role.

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Get Saved Jobs List
```
GET /api/candidate/saved-jobs
```

Get paginated list of saved jobs for the authenticated candidate.

#### Query Parameters
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `search` (string, optional): Search in job title or company name
- `jobType[]` (array, optional): Filter by job types (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
- `workLocationType[]` (array, optional): Filter by work location (ONSITE, REMOTE, HYBRID)
- `experienceLevel[]` (array, optional): Filter by experience level (ENTRY, MID, SENIOR, LEAD, EXECUTIVE)
- `salaryMin` (number, optional): Minimum salary filter
- `salaryMax` (number, optional): Maximum salary filter
- `locationCity` (string, optional): Filter by city
- `locationProvince` (string, optional): Filter by province
- `sortBy` (string, optional): Sort field (savedAt, deadline, salary, jobTitle) (default: savedAt)
- `sortOrder` (string, optional): Sort order (asc, desc) (default: desc)

#### Response
```json
{
  "success": true,
  "message": "Saved jobs retrieved successfully",
  "data": [
    {
      "id": "saved_job_id",
      "candidateId": "candidate_id",
      "jobId": "job_id",
      "createdAt": "2025-01-09T08:00:00Z",
      "job": {
        "id": "job_id",
        "title": "Senior Backend Developer",
        "slug": "senior-backend-developer-abc-tech",
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
        "featured": true,
        "urgent": false,
        "createdAt": "2025-01-01T00:00:00Z",
        "publishedAt": "2025-01-01T00:00:00Z",
        "company": {
          "id": "company_id",
          "companyName": "ABC Tech",
          "companySlug": "abc-tech",
          "logoUrl": "https://example.com/logo.png",
          "city": "Ho Chi Minh",
          "province": "Ho Chi Minh"
        },
        "_count": {
          "applications": 25,
          "savedJobs": 10
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Save a Job
```
POST /api/candidate/saved-jobs
```

Save a job to the candidate's saved list.

#### Request Body
```json
{
  "jobId": "job_id_to_save"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Job saved successfully",
  "data": {
    "savedJob": {
      "id": "saved_job_id",
      "candidateId": "candidate_id",
      "jobId": "job_id",
      "createdAt": "2025-01-09T08:00:00Z",
      "job": {
        // Full job details as shown above
      }
    }
  }
}
```

#### Error Responses
- 400: Validation error (missing jobId)
- 404: Job not found or not active
- 409: Job already saved

### 3. Remove Saved Job
```
DELETE /api/candidate/saved-jobs/{id}
```

Remove a job from saved list.

#### Path Parameters
- `id`: Saved job ID to remove

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Job removed from saved list successfully",
  "data": {
    "message": "Job removed from saved list successfully"
  }
}
```

#### Error Responses
- 404: Saved job not found

### 4. Check if Job is Saved
```
GET /api/candidate/saved-jobs/check/{jobId}
```

Check if a specific job is saved by the authenticated candidate.

#### Path Parameters
- `jobId`: Job ID to check

#### Response
```json
{
  "success": true,
  "message": "Check completed successfully",
  "data": {
    "isSaved": true,
    "savedAt": "2025-01-09T08:00:00Z",
    "savedJobId": "saved_job_id"
  }
}
```

Or if not saved:
```json
{
  "success": true,
  "message": "Check completed successfully",
  "data": {
    "isSaved": false
  }
}
```

## Error Response Format
All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "details": {} // Optional additional error details
}
```

## Common Status Codes
- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not a candidate)
- `404`: Not Found
- `409`: Conflict (duplicate save)
- `500`: Internal Server Error

## Rate Limiting
- 100 requests per minute per user for GET endpoints
- 30 requests per minute per user for POST/DELETE endpoints

## Example Usage

### cURL Examples

#### Get saved jobs:
```bash
curl -X GET "https://api.example.com/api/candidate/saved-jobs?page=1&limit=10&sortBy=savedAt" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Save a job:
```bash
curl -X POST "https://api.example.com/api/candidate/saved-jobs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId": "job_123"}'
```

#### Remove saved job:
```bash
curl -X DELETE "https://api.example.com/api/candidate/saved-jobs/saved_job_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Check if job is saved:
```bash
curl -X GET "https://api.example.com/api/candidate/saved-jobs/check/job_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Notes
- Only active jobs can be saved
- Each candidate can save a job only once
- Saved jobs are automatically removed if the job becomes inactive
- The API returns job details with company information for better UI display

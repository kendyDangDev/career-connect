# Interview Review API Documentation

## Overview

This document describes the REST API endpoints for managing interview reviews in the Career Connect platform. These endpoints allow candidates to share their interview experiences, helping others prepare better for their interviews.

## Authentication

Most endpoints require authentication. The authentication token should be passed in the Authorization header:

```
Authorization: Bearer <token>
```

### Role-based Access:
- **Public**: Can view all interview reviews
- **CANDIDATE**: Can create, edit, and delete their own interview reviews
- **ADMIN/EMPLOYER**: Can view reviews related to their company

## Base URL

All URLs referenced in the documentation have the following base:

```
https://api.careerconnect.com/api/reviews/interview
```

---

## Endpoints

### 1. Get Interview Reviews

Get interview reviews with filters and pagination.

**Endpoint:** `GET /`

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| companyId | string | No* | Company ID to filter reviews | - |
| companySlug | string | No* | Company slug to filter reviews | - |
| jobId | string | No* | Job ID to filter reviews | - |
| reviewerId | string | No* | User ID to filter reviews by reviewer | - |
| outcome | string | No | Filter by outcome: `OFFER`, `REJECTION`, `PENDING` | - |
| minOverallRating | number | No | Filter by minimum overall rating (1-5) | - |
| minDifficultyRating | number | No | Filter by minimum difficulty rating (1-5) | - |
| recommendation | boolean | No | Filter by recommendation status | - |
| sortBy | string | No | Sort field: `createdAt`, `overallRating`, `difficultyRating` | `createdAt` |
| sortOrder | string | No | Sort order: `asc`, `desc` | `desc` |
| page | number | No | Page number (1-based) | `1` |
| limit | number | No | Items per page (1-100) | `10` |

**Note:** At least one of `companyId`, `companySlug`, `jobId`, or `reviewerId` is required.

**Response:**

```json
{
  "success": true,
  "message": "Interview reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": "clh123...",
        "companyId": "clg456...",
        "jobId": "clj789...",
        "reviewerId": "clu012...",
        "overallRating": 4,
        "difficultyRating": 3,
        "experienceDescription": "The interview process was well-organized. Started with a phone screening...",
        "interviewQuestions": "1. Tell me about yourself\n2. Why do you want to work here?\n3. Describe a challenging project...",
        "processDescription": "Phone screening -> Technical interview -> Manager interview -> HR interview",
        "outcome": "OFFER",
        "recommendation": true,
        "isAnonymous": false,
        "createdAt": "2024-01-10T10:00:00.000Z",
        "company": {
          "id": "clg456...",
          "companyName": "Tech Corp",
          "companySlug": "tech-corp",
          "logoUrl": "https://..."
        },
        "job": {
          "id": "clj789...",
          "title": "Software Engineer",
          "slug": "software-engineer-tech-corp"
        },
        "reviewer": {
          "id": "clu012...",
          "displayName": "John Doe",
          "avatarUrl": "https://...",
          "isAnonymous": false
        }
      }
    ],
    "total": 15,
    "page": 1,
    "totalPages": 2,
    "hasMore": true,
    "statistics": {
      "totalReviews": 15,
      "averageOverallRating": 3.8,
      "averageDifficultyRating": 3.2,
      "recommendationRate": 73,
      "outcomeDistribution": {
        "OFFER": 8,
        "REJECTION": 5,
        "PENDING": 2
      },
      "ratingDistribution": {
        "overall": {
          "1": 1,
          "2": 2,
          "3": 4,
          "4": 6,
          "5": 2
        },
        "difficulty": {
          "1": 2,
          "2": 3,
          "3": 5,
          "4": 4,
          "5": 1
        }
      }
    }
  }
}
```

### 2. Get Interview Review by ID

Get a specific interview review by ID.

**Endpoint:** `GET /{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Interview review ID |

**Response:**

```json
{
  "success": true,
  "message": "Interview review retrieved successfully",
  "data": {
    "review": {
      "id": "clh123...",
      "companyId": "clg456...",
      "jobId": "clj789...",
      "reviewerId": "clu012...",
      "overallRating": 4,
      "difficultyRating": 3,
      "experienceDescription": "Full interview experience description...",
      "interviewQuestions": "Detailed list of questions asked...",
      "processDescription": "Complete process description...",
      "outcome": "OFFER",
      "recommendation": true,
      "isAnonymous": false,
      "createdAt": "2024-01-10T10:00:00.000Z",
      "company": {
        "id": "clg456...",
        "companyName": "Tech Corp",
        "companySlug": "tech-corp",
        "logoUrl": "https://..."
      },
      "job": {
        "id": "clj789...",
        "title": "Software Engineer",
        "slug": "software-engineer-tech-corp"
      },
      "reviewer": {
        "id": "clu012...",
        "displayName": "John Doe",
        "avatarUrl": "https://...",
        "isAnonymous": false
      }
    }
  }
}
```

### 3. Create Interview Review

Create a new interview review. Requires CANDIDATE authentication.

**Endpoint:** `POST /`

**Request Body:**

```json
{
  "companyId": "clg456...",
  "jobId": "clj789...",
  "overallRating": 4,
  "difficultyRating": 3,
  "experienceDescription": "I had a great interview experience with Tech Corp. The process was well-organized and transparent. The interview started with a phone screening where they asked about my background and interest in the role...",
  "interviewQuestions": "1. Tell me about yourself and your experience\n2. Why are you interested in this role?\n3. Describe a challenging project you worked on\n4. How do you handle disagreements with team members?\n5. Where do you see yourself in 5 years?",
  "processDescription": "The process consisted of 4 rounds:\n1. Phone screening (30 mins)\n2. Technical interview with senior engineer (1 hour)\n3. System design interview (1 hour)\n4. Behavioral interview with hiring manager (45 mins)",
  "outcome": "OFFER",
  "recommendation": true,
  "isAnonymous": false
}
```

**Validation Rules:**
- `overallRating`: Required, integer 1-5
- `difficultyRating`: Required, integer 1-5
- `experienceDescription`: Required, 100-3000 characters
- `interviewQuestions`: Optional, 20-2000 characters
- `processDescription`: Optional, 50-1500 characters
- `outcome`: Required, must be `OFFER`, `REJECTION`, or `PENDING`
- `recommendation`: Required, boolean
- Users can only review each company/job combination once

**Response:**

```json
{
  "success": true,
  "message": "Interview review created successfully",
  "data": {
    "review": {
      "id": "clh123...",
      "companyId": "clg456...",
      "jobId": "clj789...",
      "reviewerId": "clu012...",
      "overallRating": 4,
      "difficultyRating": 3,
      "experienceDescription": "Interview experience...",
      "outcome": "OFFER",
      "recommendation": true,
      "isAnonymous": false,
      "createdAt": "2024-01-10T10:00:00.000Z",
      // ... other fields
    }
  }
}
```

### 4. Update Interview Review

Update an existing interview review. Only the reviewer can update their own review.

**Endpoint:** `PUT /{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Interview review ID |

**Request Body:** (All fields are optional)

```json
{
  "overallRating": 5,
  "difficultyRating": 4,
  "experienceDescription": "Updated interview experience...",
  "interviewQuestions": "Updated questions list...",
  "outcome": "OFFER",
  "recommendation": true
}
```

### 5. Delete Interview Review

Delete an interview review. Only the reviewer can delete their own review.

**Endpoint:** `DELETE /{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Interview review ID |

**Response:**

```json
{
  "success": true,
  "message": "Interview review deleted successfully",
  "data": null
}
```

### 6. Get Interview Statistics

Get aggregated interview statistics for a company.

**Endpoint:** `GET /statistics`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| companyId | string | No* | Company ID |
| companySlug | string | No* | Company slug |

**Note:** Either `companyId` or `companySlug` is required.

**Response:**

```json
{
  "success": true,
  "message": "Interview statistics retrieved successfully",
  "data": {
    "statistics": {
      "totalReviews": 25,
      "averageOverallRating": 3.8,
      "averageDifficultyRating": 3.2,
      "recommendationRate": 72,
      "outcomeDistribution": {
        "OFFER": 15,
        "REJECTION": 8,
        "PENDING": 2
      },
      "ratingDistribution": {
        "overall": {
          "1": 1,
          "2": 3,
          "3": 6,
          "4": 10,
          "5": 5
        },
        "difficulty": {
          "1": 3,
          "2": 5,
          "3": 8,
          "4": 7,
          "5": 2
        }
      }
    }
  }
}
```

### 7. Get Interview Tips

Get interview preparation tips based on previous interview experiences.

**Endpoint:** `GET /tips`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| companyId | string | No* | Company ID |
| companySlug | string | No* | Company slug |

**Note:** Either `companyId` or `companySlug` is required.

**Response:**

```json
{
  "success": true,
  "message": "Interview tips retrieved successfully",
  "data": {
    "tips": {
      "companyId": "clg456...",
      "commonQuestions": [
        "Tell me about yourself and your experience",
        "Why are you interested in working at our company?",
        "Describe a challenging project you worked on",
        "How do you handle conflicts in a team?",
        "What are your salary expectations?",
        "Where do you see yourself in 5 years?"
      ],
      "processOverview": "The typical interview process consists of 4 rounds: phone screening, technical interview, system design, and behavioral interview with the hiring manager.",
      "preparationTips": [
        "Research the company culture and values",
        "Review the job description thoroughly",
        "Prepare examples using the STAR method",
        "Practice technical questions relevant to the role",
        "Be ready for challenging behavioral scenarios"
      ],
      "difficultyLevel": "Medium"
    }
  }
}
```

### 8. Get User's Interview Reviews

Get all interview reviews created by the authenticated user.

**Endpoint:** `GET /user`

**Response:**

```json
{
  "success": true,
  "message": "User interview reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": "clh123...",
        "companyId": "clg456...",
        "jobId": "clj789...",
        "overallRating": 4,
        "difficultyRating": 3,
        "outcome": "OFFER",
        "recommendation": true,
        "createdAt": "2024-01-10T10:00:00.000Z",
        "company": {
          "id": "clg456...",
          "companyName": "Tech Corp",
          "companySlug": "tech-corp",
          "logoUrl": "https://..."
        },
        "job": {
          "id": "clj789...",
          "title": "Software Engineer",
          "slug": "software-engineer-tech-corp"
        }
        // ... other fields
      }
    ],
    "total": 3
  }
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "overallRating": ["Rating must be between 1 and 5"],
    "experienceDescription": ["Experience description must be at least 100 characters"]
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Only candidates can create interview reviews"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Interview review not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "You have already reviewed this interview"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "An unexpected error occurred",
  "error": "Error details (in development only)"
}
```

---

## Data Models

### Interview Outcome Types
- `OFFER` - Received a job offer
- `REJECTION` - Application was rejected
- `PENDING` - Waiting for decision

### Rating Scale
- Overall Rating: 1-5 (1 = Very Poor, 5 = Excellent)
- Difficulty Rating: 1-5 (1 = Very Easy, 5 = Very Difficult)

### Difficulty Levels (for tips)
- `Easy` - Average difficulty rating <= 2
- `Medium` - Average difficulty rating 2-3.5
- `Hard` - Average difficulty rating > 3.5

---

## Business Rules

1. **One Review per Interview**: Each user can only create one review per company/job combination
2. **Anonymous Reviews**: When `isAnonymous: true`, reviewer information is hidden
3. **Public Access**: All interview reviews are publicly accessible
4. **Tips Generation**: Interview tips are automatically generated based on reviews with questions
5. **Statistics Calculation**: Only includes all reviews (no approval required)

---

## Best Practices

1. **Detailed Descriptions**: Encourage users to provide detailed interview experiences
2. **Question Formatting**: Format interview questions with clear numbering or bullet points
3. **Anonymous Option**: Use anonymous reviews when sharing sensitive information
4. **Regular Updates**: Update reviews if interview process changes
5. **Helpful Tips**: Focus on actionable advice in interview questions and process descriptions

---

## Change Log

- **v1.0.0** (2025-01-09): Initial release with full CRUD operations and interview tips feature

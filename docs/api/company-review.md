# Company Review API Documentation

## Overview

This document describes the REST API endpoints for managing company reviews in the Career Connect platform. These endpoints allow users to create, read, update, and delete company reviews with various filtering and moderation capabilities.

## Authentication

Most endpoints require authentication. The authentication token should be passed in the Authorization header:

```
Authorization: Bearer <token>
```

### Role-based Access:
- **Public**: Can view approved reviews only
- **CANDIDATE**: Can create, edit, and delete their own reviews
- **ADMIN**: Can view all reviews (including unapproved) and approve/reject reviews

## Base URL

All URLs referenced in the documentation have the following base:

```
https://api.careerconnect.com/api/reviews/company
```

---

## Endpoints

### 1. Get Company Reviews

Get company reviews with filters and pagination.

**Endpoint:** `GET /`

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| companyId | string | No* | Company ID to filter reviews | - |
| companySlug | string | No* | Company slug to filter reviews | - |
| reviewerId | string | No* | User ID to filter reviews by reviewer | - |
| isApproved | boolean | No | Include only approved/unapproved reviews | `true` |
| rating | number | No | Filter by exact rating (1-5) | - |
| minRating | number | No | Filter by minimum rating (1-5) | - |
| employmentStatus | string | No | Filter by employment status: `CURRENT`, `FORMER` | - |
| sortBy | string | No | Sort field: `createdAt`, `rating`, `workLifeBalanceRating`, `salaryBenefitRating`, `managementRating`, `cultureRating` | `createdAt` |
| sortOrder | string | No | Sort order: `asc`, `desc` | `desc` |
| page | number | No | Page number (1-based) | `1` |
| limit | number | No | Items per page (1-100) | `10` |

**Note:** At least one of `companyId`, `companySlug`, or `reviewerId` is required.

**Response:**

```json
{
  "success": true,
  "message": "Reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": "clh123...",
        "companyId": "clg456...",
        "reviewerId": "clh789...",
        "rating": 4,
        "title": "Great company to work for",
        "reviewText": "I've been working here for 2 years and it's been a great experience...",
        "pros": "Great work-life balance, competitive salary",
        "cons": "Limited remote work options",
        "workLifeBalanceRating": 5,
        "salaryBenefitRating": 4,
        "managementRating": 4,
        "cultureRating": 5,
        "isAnonymous": false,
        "employmentStatus": "CURRENT",
        "positionTitle": "Software Engineer",
        "employmentLength": "2 years",
        "isApproved": true,
        "createdAt": "2024-01-10T10:00:00.000Z",
        "company": {
          "id": "clg456...",
          "companyName": "Tech Corp",
          "companySlug": "tech-corp",
          "logoUrl": "https://..."
        },
        "reviewer": {
          "id": "clh789...",
          "displayName": "John Doe",
          "avatarUrl": "https://...",
          "isAnonymous": false
        }
      }
    ],
    "total": 25,
    "page": 1,
    "totalPages": 3,
    "hasMore": true,
    "statistics": {
      "totalReviews": 25,
      "averageRating": 4.2,
      "averageWorkLifeBalance": 4.1,
      "averageSalaryBenefit": 3.9,
      "averageManagement": 4.0,
      "averageCulture": 4.3,
      "ratingDistribution": {
        "1": 1,
        "2": 2,
        "3": 4,
        "4": 10,
        "5": 8
      },
      "byEmploymentStatus": {
        "CURRENT": 15,
        "FORMER": 10
      },
      "recommendationRate": 72
    }
  }
}
```

### 2. Get Review by ID

Get a specific company review by ID.

**Endpoint:** `GET /{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Review ID |

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| includeUnapproved | boolean | No | Include unapproved review (requires admin or owner) | `false` |

**Response:**

```json
{
  "success": true,
  "message": "Review retrieved successfully",
  "data": {
    "review": {
      "id": "clh123...",
      "companyId": "clg456...",
      "reviewerId": "clh789...",
      "rating": 4,
      "title": "Great company to work for",
      "reviewText": "Full review text...",
      "pros": "Pros text...",
      "cons": "Cons text...",
      "workLifeBalanceRating": 5,
      "salaryBenefitRating": 4,
      "managementRating": 4,
      "cultureRating": 5,
      "isAnonymous": false,
      "employmentStatus": "CURRENT",
      "positionTitle": "Software Engineer",
      "employmentLength": "2 years",
      "isApproved": true,
      "createdAt": "2024-01-10T10:00:00.000Z",
      "company": {
        "id": "clg456...",
        "companyName": "Tech Corp",
        "companySlug": "tech-corp",
        "logoUrl": "https://..."
      },
      "reviewer": {
        "id": "clh789...",
        "displayName": "John Doe",
        "avatarUrl": "https://...",
        "isAnonymous": false
      }
    }
  }
}
```

### 3. Create Company Review

Create a new company review. Requires CANDIDATE authentication.

**Endpoint:** `POST /`

**Request Body:**

```json
{
  "companyId": "clg456...",
  "rating": 4,
  "title": "Great company to work for",
  "reviewText": "I've been working here for 2 years and it's been a great experience. The team is supportive and the projects are challenging...",
  "pros": "Great work-life balance, competitive salary, learning opportunities",
  "cons": "Limited remote work options, slow promotion process",
  "workLifeBalanceRating": 5,
  "salaryBenefitRating": 4,
  "managementRating": 4,
  "cultureRating": 5,
  "isAnonymous": false,
  "employmentStatus": "CURRENT",
  "positionTitle": "Software Engineer",
  "employmentLength": "2 years"
}
```

**Validation Rules:**
- `rating`: Required, integer 1-5
- `title`: Required, 5-100 characters
- `reviewText`: Required, 50-2000 characters
- `pros`: Optional, 10-1000 characters
- `cons`: Optional, 10-1000 characters
- `workLifeBalanceRating`, `salaryBenefitRating`, `managementRating`, `cultureRating`: Optional, integer 1-5
- `employmentStatus`: Required, must be `CURRENT` or `FORMER`
- Users can only review a company once

**Response:**

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "id": "clh123...",
      "companyId": "clg456...",
      "reviewerId": "clh789...",
      "rating": 4,
      "title": "Great company to work for",
      "reviewText": "Full review text...",
      "isApproved": false,
      "createdAt": "2024-01-10T10:00:00.000Z",
      // ... other fields
    }
  }
}
```

### 4. Update Company Review

Update an existing company review. Only the reviewer can update their own review.

**Endpoint:** `PUT /{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Review ID |

**Request Body:** (All fields are optional)

```json
{
  "rating": 5,
  "title": "Updated: Excellent company to work for",
  "reviewText": "Updated review text...",
  "workLifeBalanceRating": 5,
  "salaryBenefitRating": 5
}
```

**Note:** When a review is updated, it will be reset to `isApproved: false` and require re-approval.

### 5. Delete Company Review

Delete a company review. Only the reviewer can delete their own review.

**Endpoint:** `DELETE /{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Review ID |

**Response:**

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": null
}
```

### 6. Approve/Reject Review (Admin Only)

Approve or reject a company review. Requires ADMIN authentication.

**Endpoint:** `PATCH /{id}/approve`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Review ID |

**Request Body:**

```json
{
  "isApproved": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Review approved successfully",
  "data": {
    "review": {
      "id": "clh123...",
      "isApproved": true,
      // ... other fields
    }
  }
}
```

### 7. Get Company Statistics

Get aggregated statistics for a company's reviews.

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
  "message": "Statistics retrieved successfully",
  "data": {
    "statistics": {
      "totalReviews": 25,
      "averageRating": 4.2,
      "averageWorkLifeBalance": 4.1,
      "averageSalaryBenefit": 3.9,
      "averageManagement": 4.0,
      "averageCulture": 4.3,
      "ratingDistribution": {
        "1": 1,
        "2": 2,
        "3": 4,
        "4": 10,
        "5": 8
      },
      "byEmploymentStatus": {
        "CURRENT": 15,
        "FORMER": 10
      },
      "recommendationRate": 72
    }
  }
}
```

### 8. Get User's Reviews

Get all reviews created by the authenticated user.

**Endpoint:** `GET /user`

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| includeUnapproved | boolean | No | Include unapproved reviews | `true` |

**Response:**

```json
{
  "success": true,
  "message": "User reviews retrieved successfully",
  "data": {
    "reviews": [
      {
        "id": "clh123...",
        "companyId": "clg456...",
        "rating": 4,
        "title": "Great company to work for",
        "isApproved": true,
        "createdAt": "2024-01-10T10:00:00.000Z",
        "company": {
          "id": "clg456...",
          "companyName": "Tech Corp",
          "companySlug": "tech-corp",
          "logoUrl": "https://..."
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
    "rating": ["Rating must be between 1 and 5"],
    "title": ["Title must be at least 5 characters"]
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
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Review not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "You have already reviewed this company"
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

## Business Rules

1. **One Review per Company**: Each user can only create one review per company
2. **Approval Required**: All new reviews start as `isApproved: false` and require admin approval
3. **Anonymous Reviews**: When `isAnonymous: true`, reviewer information is hidden in responses
4. **Edit Resets Approval**: Editing a review resets its approval status
5. **Rating Calculation**: Company statistics only include approved reviews
6. **Recommendation Rate**: Calculated as percentage of reviews with 4+ stars

---

## Best Practices

1. **Pagination**: Always use pagination for listing reviews to improve performance
2. **Caching**: Company statistics can be cached for better performance
3. **Rate Limiting**: Implement rate limiting to prevent spam reviews
4. **Content Moderation**: Reviews should be moderated for inappropriate content
5. **SEO**: Use company slugs in URLs for better SEO

---

## Change Log

- **v1.0.0** (2025-01-09): Initial release with full CRUD operations and admin features

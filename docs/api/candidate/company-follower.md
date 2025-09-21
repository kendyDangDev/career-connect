# Company Follower API Documentation

## Overview

API endpoints for managing company followers functionality, allowing candidates to follow/unfollow companies and view their followed companies.

## Authentication

All endpoints require authentication with a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The authenticated user must have the role `CANDIDATE`.

## Endpoints

### 1. Get Followed Companies

Retrieve a paginated list of companies followed by the authenticated candidate.

**Endpoint:** `GET /api/candidate/company-followers`

**Query Parameters:**

| Parameter            | Type     | Default    | Description                                                         |
| -------------------- | -------- | ---------- | ------------------------------------------------------------------- |
| page                 | number   | 1          | Page number for pagination                                          |
| limit                | number   | 20         | Number of items per page (max: 100)                                 |
| limit                | string   | -          | Search by company name or description                               |
| industryId[]         | string[] | -          | Filter by industry IDs                                              |
| companySize[]        | string[] | -          | Filter by company sizes (STARTUP, SMALL, MEDIUM, LARGE, ENTERPRISE) |
| verificationStatus[] | string[] | -          | Filter by verification status (PENDING, VERIFIED, REJECTED)         |
| city                 | string   | -          | Filter by city                                                      |
| province             | string   | -          | Filter by province                                                  |
| sortBy               | string   | followedAt | Sort field (followedAt, companyName, jobCount)                      |
| sortOrder            | string   | desc       | Sort order (asc, desc)                                              |

**Response:**

```json
{
  "success": true,
  "message": "Followed companies retrieved successfully",
  "data": {
    "data": [
      {
        "id": "string",
        "companyId": "string",
        "candidateId": "string",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "company": {
          "id": "string",
          "companyName": "string",
          "companySlug": "string",
          "logoUrl": "string | null",
          "coverImageUrl": "string | null",
          "description": "string | null",
          "city": "string | null",
          "province": "string | null",
          "country": "string | null",
          "companySize": "STARTUP | SMALL | MEDIUM | LARGE | ENTERPRISE | null",
          "websiteUrl": "string | null",
          "verificationStatus": "PENDING | VERIFIED | REJECTED",
          "_count": {
            "jobs": 10,
            "companyFollowers": 100
          },
          "industry": {
            "id": "string",
            "name": "string"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Error Responses:**

- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - User is not a candidate
- 404: Candidate profile not found
- 500: Internal server error

### 2. Follow a Company

Follow a company for the authenticated candidate.

**Endpoint:** `POST /api/candidate/company-followers`

**Request Body:**

```json
{
  "companyId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company followed successfully",
  "data": {
    "companyFollower": {
      "id": "string",
      "companyId": "string",
      "candidateId": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "company": {
        "id": "string",
        "companyName": "string",
        "companySlug": "string",
        "logoUrl": "string | null",
        "coverImageUrl": "string | null",
        "description": "string | null",
        "city": "string | null",
        "province": "string | null",
        "country": "string | null",
        "companySize": "STARTUP | SMALL | MEDIUM | LARGE | ENTERPRISE | null",
        "websiteUrl": "string | null",
        "verificationStatus": "PENDING | VERIFIED | REJECTED",
        "_count": {
          "jobs": 10,
          "companyFollowers": 101
        },
        "industry": {
          "id": "string",
          "name": "string"
        }
      }
    },
    "message": "Company followed successfully"
  }
}
```

**Error Responses:**

- 400: Validation error - Missing company ID
- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - User is not a candidate
- 404: Candidate profile or company not found
- 409: Conflict - Already following this company
- 500: Internal server error

### 3. Unfollow a Company

Unfollow a company for the authenticated candidate.

**Endpoint:** `DELETE /api/candidate/company-followers/{companyId}`

**Path Parameters:**

| Parameter | Type   | Description                   |
| --------- | ------ | ----------------------------- |
| companyId | string | ID of the company to unfollow |

**Response:**

```
Status: 204 No Content
```

**Error Responses:**

- 400: Company ID is required
- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - User is not a candidate
- 404: Not following this company or candidate profile not found
- 500: Internal server error

### 4. Check if Following a Company

Check if the authenticated candidate is following a specific company.

**Endpoint:** `GET /api/candidate/company-followers/check/{companyId}`

**Path Parameters:**

| Parameter | Type   | Description                |
| --------- | ------ | -------------------------- |
| companyId | string | ID of the company to check |

**Response:**

```json
{
  "success": true,
  "message": "Follow status retrieved successfully",
  "data": {
    "companyId": "string",
    "isFollowing": true
  }
}
```

**Error Responses:**

- 400: Company ID is required
- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - User is not a candidate
- 404: Candidate profile not found
- 500: Internal server error

### 5. Bulk Follow Companies

Follow multiple companies at once.

**Endpoint:** `POST /api/candidate/company-followers/bulk`

**Request Body:**

```json
{
  "companyIds": ["string", "string", "string"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bulk follow operation completed",
  "data": {
    "followed": ["companyId1", "companyId2"],
    "alreadyFollowed": ["companyId3"],
    "notFound": ["companyId4"],
    "summary": {
      "followed": 2,
      "alreadyFollowed": 1,
      "notFound": 1
    }
  }
}
```

**Error Responses:**

- 400: Validation error - Invalid company IDs format
- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - User is not a candidate
- 404: Candidate profile not found
- 500: Internal server error

**Validation Rules:**

- Company IDs must be an array
- At least one company ID is required
- Maximum 50 companies can be followed at once

### 6. Bulk Unfollow Companies

Unfollow multiple companies at once.

**Endpoint:** `DELETE /api/candidate/company-followers/bulk`

**Request Body:**

```json
{
  "companyIds": ["string", "string", "string"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Bulk unfollow operation completed",
  "data": {
    "unfollowed": ["companyId1", "companyId2"],
    "notFollowing": ["companyId3"],
    "summary": {
      "unfollowed": 2,
      "notFollowing": 1
    }
  }
}
```

**Error Responses:**

- 400: Validation error - Invalid company IDs format
- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - User is not a candidate
- 404: Candidate profile not found
- 500: Internal server error

**Validation Rules:**

- Company IDs must be an array
- At least one company ID is required
- Maximum 50 companies can be unfollowed at once

## Data Types

### Company Size Enum

```
STARTUP
SMALL
MEDIUM
LARGE
ENTERPRISE
```

### Verification Status Enum

```
PENDING
VERIFIED
REJECTED
```

### Sort Options

```
followedAt - Sort by follow date
companyName - Sort by company name
jobCount - Sort by number of active jobs
```

## Rate Limiting

These endpoints are subject to rate limiting:

- 100 requests per minute for GET endpoints
- 30 requests per minute for POST/DELETE endpoints

## Examples

### Example 1: Get all followed companies

```bash
curl -X GET "https://api.career-connect.com/api/candidate/company-followers?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Example 2: Follow a company

```bash
curl -X POST "https://api.career-connect.com/api/candidate/company-followers" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"companyId": "123e4567-e89b-12d3-a456-426614174000"}'
```

### Example 3: Unfollow a company

```bash
curl -X DELETE "https://api.career-connect.com/api/candidate/company-followers/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>"
```

### Example 4: Check follow status

```bash
curl -X GET "https://api.career-connect.com/api/candidate/company-followers/check/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>"
```

### Example 5: Bulk follow companies

```bash
curl -X POST "https://api.career-connect.com/api/candidate/company-followers/bulk" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "companyIds": [
      "123e4567-e89b-12d3-a456-426614174000",
      "223e4567-e89b-12d3-a456-426614174001",
      "323e4567-e89b-12d3-a456-426614174002"
    ]
  }'
```

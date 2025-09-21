# Candidate Experience & Certification API Documentation

## Overview

This document describes the REST API endpoints for managing candidate experience records and certifications in the Career Connect platform.

## Authentication

All endpoints require authentication with a `CANDIDATE` role. The authentication token should be passed in the Authorization header:

```
Authorization: Bearer <token>
```

## Base URL

All URLs referenced in the documentation have the following base:

```
https://api.careerconnect.com/api/candidate
```

---

## Candidate Experience Endpoints

### 1. Get All Experience Records

Get all experience records for the authenticated candidate.

**Endpoint:** `GET /experience`

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| sortBy | string | No | Sort field: `startDate`, `endDate`, `createdAt` | `startDate` |
| sortOrder | string | No | Sort order: `asc`, `desc` | `desc` |
| includeDescription | boolean | No | Include description and achievements fields | `true` |
| isCurrent | boolean | No | Filter by current positions | - |

**Response:**

```json
{
  "success": true,
  "message": "Experience records retrieved successfully",
  "data": {
    "experiences": [
      {
        "id": "clh123...",
        "candidateId": "clg456...",
        "companyName": "Tech Corp",
        "positionTitle": "Senior Developer",
        "employmentType": "FULL_TIME",
        "startDate": "2020-01-15T00:00:00.000Z",
        "endDate": null,
        "isCurrent": true,
        "description": "Leading development team...",
        "achievements": "Increased performance by 40%...",
        "createdAt": "2024-01-10T10:00:00.000Z"
      }
    ],
    "total": 3,
    "statistics": {
      "totalExperiences": 3,
      "byEmploymentType": {
        "FULL_TIME": 2,
        "CONTRACT": 1
      },
      "totalYearsOfExperience": 8,
      "currentJobs": 1,
      "averageJobDuration": 32
    },
    "summary": {
      "totalYears": 8,
      "positions": ["Senior Developer", "Developer", "Junior Developer"],
      "companies": ["Tech Corp", "StartupXYZ", "DevHouse"]
    }
  }
}
```

### 2. Create Experience Record

Add a new experience record for the authenticated candidate.

**Endpoint:** `POST /experience`

**Request Body:**

```json
{
  "companyName": "Tech Corp",
  "positionTitle": "Senior Developer",
  "employmentType": "FULL_TIME",
  "startDate": "2020-01-15",
  "endDate": null,
  "isCurrent": true,
  "description": "Leading development team on key projects",
  "achievements": "Increased system performance by 40%"
}
```

**Employment Types:** `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`

**Validation Rules:**
- If `isCurrent` is true, `endDate` must be null
- If `isCurrent` is false, `endDate` is required
- `endDate` must be after `startDate`

**Response:**

```json
{
  "success": true,
  "message": "Experience record added successfully",
  "data": {
    "experience": {
      "id": "clh123...",
      "candidateId": "clg456...",
      "companyName": "Tech Corp",
      "positionTitle": "Senior Developer",
      "employmentType": "FULL_TIME",
      "startDate": "2020-01-15T00:00:00.000Z",
      "endDate": null,
      "isCurrent": true,
      "description": "Leading development team...",
      "achievements": "Increased performance by 40%...",
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  }
}
```

### 3. Bulk Create Experience Records

Add multiple experience records at once.

**Endpoint:** `POST /experience`

**Request Body:**

```json
{
  "experiences": [
    {
      "companyName": "Tech Corp",
      "positionTitle": "Senior Developer",
      "employmentType": "FULL_TIME",
      "startDate": "2020-01-15",
      "endDate": null,
      "isCurrent": true,
      "description": "Leading development team",
      "achievements": "Increased performance by 40%"
    },
    {
      "companyName": "StartupXYZ",
      "positionTitle": "Developer",
      "employmentType": "FULL_TIME",
      "startDate": "2018-06-01",
      "endDate": "2019-12-31",
      "isCurrent": false,
      "description": "Full-stack development",
      "achievements": "Built core features"
    }
  ]
}
```

**Limits:** Maximum 10 records per request

### 4. Get Single Experience Record

Get a specific experience record by ID.

**Endpoint:** `GET /experience/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Experience record ID |

**Response:**

```json
{
  "success": true,
  "message": "Experience record retrieved successfully",
  "data": {
    "experience": {
      "id": "clh123...",
      "candidateId": "clg456...",
      "companyName": "Tech Corp",
      "positionTitle": "Senior Developer",
      "employmentType": "FULL_TIME",
      "startDate": "2020-01-15T00:00:00.000Z",
      "endDate": null,
      "isCurrent": true,
      "description": "Leading development team...",
      "achievements": "Increased performance by 40%...",
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  }
}
```

### 5. Update Experience Record

Update an existing experience record.

**Endpoint:** `PUT /experience/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Experience record ID |

**Request Body:** (All fields are optional)

```json
{
  "companyName": "Tech Corp International",
  "positionTitle": "Lead Developer",
  "endDate": "2024-01-15",
  "isCurrent": false
}
```

### 6. Delete Experience Record

Delete an experience record.

**Endpoint:** `DELETE /experience/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Experience record ID |

**Response:**

```json
{
  "success": true,
  "message": "Experience record deleted successfully",
  "data": null
}
```

---

## Candidate Certification Endpoints

### 1. Get All Certification Records

Get all certification records for the authenticated candidate.

**Endpoint:** `GET /certifications`

**Query Parameters:**

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| sortBy | string | No | Sort field: `issueDate`, `expiryDate`, `createdAt`, `certificationName` | `issueDate` |
| sortOrder | string | No | Sort order: `asc`, `desc` | `desc` |
| isExpired | boolean | No | Filter expired certifications | - |
| isValid | boolean | No | Filter valid (non-expired) certifications | - |

**Response:**

```json
{
  "success": true,
  "message": "Certification records retrieved successfully",
  "data": {
    "certifications": [
      {
        "id": "clh789...",
        "candidateId": "clg456...",
        "certificationName": "AWS Solutions Architect",
        "issuingOrganization": "Amazon Web Services",
        "issueDate": "2023-01-15T00:00:00.000Z",
        "expiryDate": "2026-01-15T00:00:00.000Z",
        "credentialId": "ABC123XYZ",
        "credentialUrl": "https://aws.amazon.com/verify/ABC123XYZ",
        "createdAt": "2024-01-10T10:00:00.000Z"
      }
    ],
    "total": 5,
    "statistics": {
      "totalCertifications": 5,
      "validCertifications": 4,
      "expiredCertifications": 1,
      "expiringInNextMonth": 1,
      "byOrganization": {
        "Amazon Web Services": 2,
        "Microsoft": 2,
        "Google": 1
      }
    },
    "summary": {
      "total": 5,
      "valid": 4,
      "expired": 1,
      "topOrganizations": ["Amazon Web Services", "Microsoft", "Google"]
    },
    "expiringCertifications": [
      {
        "id": "clh890...",
        "certificationName": "Azure Developer Associate",
        "expiryDate": "2024-02-10T00:00:00.000Z"
      }
    ]
  }
}
```

### 2. Create Certification Record

Add a new certification record for the authenticated candidate.

**Endpoint:** `POST /certifications`

**Request Body:**

```json
{
  "certificationName": "AWS Solutions Architect",
  "issuingOrganization": "Amazon Web Services",
  "issueDate": "2023-01-15",
  "expiryDate": "2026-01-15",
  "credentialId": "ABC123XYZ",
  "credentialUrl": "https://aws.amazon.com/verify/ABC123XYZ"
}
```

**Validation Rules:**
- `expiryDate` must be after `issueDate` (if provided)
- `credentialUrl` must be a valid URL (if provided)

**Response:**

```json
{
  "success": true,
  "message": "Certification record added successfully",
  "data": {
    "certification": {
      "id": "clh789...",
      "candidateId": "clg456...",
      "certificationName": "AWS Solutions Architect",
      "issuingOrganization": "Amazon Web Services",
      "issueDate": "2023-01-15T00:00:00.000Z",
      "expiryDate": "2026-01-15T00:00:00.000Z",
      "credentialId": "ABC123XYZ",
      "credentialUrl": "https://aws.amazon.com/verify/ABC123XYZ",
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  }
}
```

### 3. Bulk Create Certification Records

Add multiple certification records at once.

**Endpoint:** `POST /certifications`

**Request Body:**

```json
{
  "certifications": [
    {
      "certificationName": "AWS Solutions Architect",
      "issuingOrganization": "Amazon Web Services",
      "issueDate": "2023-01-15",
      "expiryDate": "2026-01-15",
      "credentialId": "ABC123",
      "credentialUrl": "https://aws.amazon.com/verify/ABC123"
    },
    {
      "certificationName": "Azure Developer Associate",
      "issuingOrganization": "Microsoft",
      "issueDate": "2023-06-01",
      "expiryDate": "2025-06-01",
      "credentialId": "XYZ789",
      "credentialUrl": "https://microsoft.com/verify/XYZ789"
    }
  ]
}
```

**Limits:** Maximum 10 records per request

### 4. Get Single Certification Record

Get a specific certification record by ID.

**Endpoint:** `GET /certifications/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Certification record ID |

### 5. Update Certification Record

Update an existing certification record.

**Endpoint:** `PUT /certifications/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Certification record ID |

**Request Body:** (All fields are optional)

```json
{
  "certificationName": "AWS Solutions Architect Professional",
  "expiryDate": "2027-01-15"
}
```

### 6. Delete Certification Record

Delete a certification record.

**Endpoint:** `DELETE /certifications/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Certification record ID |

---

## Error Responses

All endpoints follow a consistent error response format:

### 400 Bad Request (Validation Error)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": ["Error message"]
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
  "message": "Resource not found"
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

## Rate Limiting

API requests are limited to:
- 1000 requests per hour per user
- Bulk operations count as multiple requests

---

## Best Practices

1. **Date Format**: Always use ISO 8601 date format (YYYY-MM-DD) in requests
2. **Bulk Operations**: Use bulk endpoints when adding multiple records to improve performance
3. **Filtering**: Use query parameters to filter results and reduce payload size
4. **Error Handling**: Always check the `success` field in responses before processing data
5. **Validation**: Validate data client-side before making API requests to reduce errors

---

## Change Log

- **v1.0.0** (2025-01-09): Initial release with Experience and Certification endpoints

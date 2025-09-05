# Admin Company Management API Documentation

## Overview

API endpoints for administrators to manage companies in the system.

## Authentication

All endpoints require admin authentication (UserType = ADMIN).

## Base URL

`/api/admin/companies`

## Endpoints

### 1. List Companies

**GET** `/api/admin/companies`

Get paginated list of companies with filters and search.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by name, email, phone, city
- `status` (VerificationStatus): Filter by verification status
- `companySize` (CompanySize): Filter by company size
- `industryId` (string): Filter by industry
- `sortBy` (string): Sort field (createdAt, companyName, verificationStatus, activeJobCount)
- `sortOrder` (string): Sort order (asc, desc)
- `fromDate` (string): Filter companies created from date
- `toDate` (string): Filter companies created to date

**Response:**

```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "string",
        "companyName": "string",
        "companySlug": "string",
        "industry": {
          "id": "string",
          "name": "string"
        },
        "companySize": "MEDIUM_51_200",
        "verificationStatus": "VERIFIED",
        "logoUrl": "string",
        "city": "string",
        "province": "string",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z",
        "_count": {
          "companyUsers": 5,
          "jobs": 10,
          "companyFollowers": 100
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    },
    "filters": {
      "status": "VERIFIED",
      "companySize": "MEDIUM_51_200",
      "industryId": "string"
    }
  }
}
```

### 2. Get Company Detail

**GET** `/api/admin/companies/{id}`

Get detailed information about a specific company.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "companyName": "string",
    "companySlug": "string",
    "industry": {
      "id": "string",
      "name": "string"
    },
    "companySize": "MEDIUM_51_200",
    "websiteUrl": "string",
    "description": "string",
    "logoUrl": "string",
    "coverImageUrl": "string",
    "address": "string",
    "city": "string",
    "province": "string",
    "country": "string",
    "phone": "string",
    "email": "string",
    "foundedYear": 2020,
    "verificationStatus": "VERIFIED",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "_count": {
      "companyUsers": 5,
      "jobs": 10,
      "companyFollowers": 100,
      "companyReviews": 20
    },
    "companyUsers": [
      {
        "id": "string",
        "role": "ADMIN",
        "isPrimaryContact": true,
        "user": {
          "id": "string",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+84123456789"
        }
      }
    ],
    "stats": {
      "totalJobs": 50,
      "activeJobs": 10,
      "totalApplications": 500,
      "pendingApplications": 50,
      "totalFollowers": 100,
      "totalReviews": 20,
      "averageRating": 4.5,
      "totalViews": 10000,
      "viewsLastMonth": 1000,
      "primaryContact": {
        "id": "string",
        "name": "John Doe",
        "email": "john@company.com",
        "phone": "+84123456789"
      }
    }
  }
}
```

### 3. Update Company

**PUT** `/api/admin/companies/{id}`

Update company information. Admin can update all fields including verification status.

**Request Body:**

```json
{
  "companyName": "string",
  "companySlug": "string",
  "industryId": "string",
  "companySize": "LARGE_201_500",
  "websiteUrl": "https://example.com",
  "description": "Updated company description",
  "logoUrl": "string",
  "coverImageUrl": "string",
  "address": "string",
  "city": "string",
  "province": "string",
  "country": "string",
  "phone": "+84123456789",
  "email": "contact@company.com",
  "foundedYear": 2020,
  "verificationStatus": "VERIFIED"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    /* Updated company detail */
  }
}
```

### 4. Update Verification Status

**PATCH** `/api/admin/companies/{id}/status`

Update only the verification status of a company.

**Request Body:**

```json
{
  "verificationStatus": "VERIFIED",
  "verificationNotes": "Company verified after document review",
  "notifyCompany": true
}
```

**Verification Status Values:**

- `PENDING`: Awaiting verification
- `VERIFIED`: Company verified
- `REJECTED`: Company rejected

**Response:**

```json
{
  "success": true,
  "message": "Company verification status updated to VERIFIED",
  "data": {
    "id": "string",
    "verificationStatus": "VERIFIED",
    "previousStatus": "PENDING",
    "notificationSent": true
  }
}
```

### 5. Delete Company

**DELETE** `/api/admin/companies/{id}`

Delete or deactivate a company.

**Query Parameters:**

- `hard` (boolean): If true, permanently delete. If false, soft delete (default: false)

**Response:**

```json
{
  "success": true,
  "message": "Company deactivated successfully"
}
```

### 6. Bulk Update Status

**POST** `/api/admin/companies`

Perform bulk operations on multiple companies.

**Request Body:**

```json
{
  "action": "bulk-update-status",
  "companyIds": ["id1", "id2", "id3"],
  "status": "VERIFIED"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully updated 3 companies",
  "data": {
    "updatedCount": 3
  }
}
```

### 7. Get Statistics

**GET** `/api/admin/companies/stats`

Get dashboard statistics about companies.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalCompanies": 500,
    "verifiedCompanies": 400,
    "pendingVerification": 50,
    "rejectedCompanies": 50,
    "companiesBySize": [
      {
        "size": "STARTUP_1_10",
        "count": 100
      },
      {
        "size": "SMALL_11_50",
        "count": 200
      }
    ],
    "companiesByIndustry": [
      {
        "industryId": "string",
        "industryName": "Technology",
        "count": 150
      }
    ],
    "recentCompanies": [
      {
        "id": "string",
        "companyName": "New Company",
        "createdAt": "2025-01-01T00:00:00Z",
        "verificationStatus": "PENDING"
      }
    ],
    "growthStats": [
      {
        "month": "Jan 2025",
        "newCompanies": 50,
        "verifiedCompanies": 40
      }
    ]
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
  "error": "Forbidden - Admin access required"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Company not found"
}
```

### 400 Bad Request

```json
{
  "success": false,
  "error": "Invalid request data"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to perform operation"
}
```

## Audit Trail

All admin actions are logged in the audit_logs table with:

- User ID and details
- Action performed
- Table and record affected
- Old and new values
- IP address and user agent
- Timestamp

## Security Features

1. **Authentication**: Session-based admin authentication
2. **Authorization**: UserType must be ADMIN
3. **Audit Logging**: All modifications are logged
4. **Input Validation**: All inputs are validated
5. **Rate Limiting**: Should be implemented at API gateway level

## Best Practices

1. Always check company existence before operations
2. Log all administrative actions
3. Use transactions for data consistency
4. Implement proper error handling
5. Validate all input data
6. Use pagination for list endpoints
7. Cache statistics when possible

## Future Enhancements

1. **Export/Import**: Bulk export and import companies
2. **Advanced Filters**: More filtering options
3. **Batch Processing**: Queue-based bulk operations
4. **Webhooks**: Notify external systems of changes
5. **Analytics**: Advanced analytics and reporting
6. **Role-Based Permissions**: Granular admin permissions
7. **API Versioning**: Version the API endpoints

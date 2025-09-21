# ApplicationTimeline API Documentation

## Overview

The ApplicationTimeline API provides endpoints for managing and tracking the timeline of job applications throughout the recruitment process. This API allows tracking status changes including APPLIED, SCREENING, INTERVIEWING, OFFERED, HIRED, REJECTED, and WITHDRAWN statuses.

## Base URL

```
https://api.career-connect.com/api/application-timeline
```

## Authentication

All endpoints require authentication using Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Status Enum Values

The following status values are supported:

- `APPLIED` - Initial application submitted
- `SCREENING` - Application under review
- `INTERVIEWING` - Candidate in interview process
- `OFFERED` - Job offer extended
- `HIRED` - Candidate hired
- `REJECTED` - Application rejected
- `WITHDRAWN` - Application withdrawn by candidate

## Status Transition Rules

Valid status transitions:

- **APPLIED** → SCREENING, REJECTED, WITHDRAWN
- **SCREENING** → INTERVIEWING, REJECTED, WITHDRAWN
- **INTERVIEWING** → OFFERED, REJECTED, WITHDRAWN
- **OFFERED** → HIRED, REJECTED, WITHDRAWN
- **HIRED** → (terminal state)
- **REJECTED** → (terminal state)
- **WITHDRAWN** → (terminal state)

---

## Endpoints

### 1. List Timeline Entries

Get a paginated list of timeline entries with optional filters.

**Endpoint:** `GET /api/application-timeline`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| applicationId | string | No | Filter by specific application ID |
| status | string/array | No | Filter by status(es). Can pass multiple as status[] |
| changedBy | string | No | Filter by user who made the change |
| fromDate | string (ISO 8601) | No | Filter entries from this date |
| toDate | string (ISO 8601) | No | Filter entries until this date |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |
| sortBy | string | No | Sort field: 'createdAt' or 'status' (default: 'createdAt') |
| sortOrder | string | No | Sort order: 'asc' or 'desc' (default: 'desc') |

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Timeline entries retrieved successfully",
  "data": {
    "data": [
      {
        "id": "clx1234567890",
        "applicationId": "clx0987654321",
        "status": "SCREENING",
        "note": "Candidate meets all requirements",
        "changedBy": "usr123",
        "createdAt": "2024-01-15T10:30:00Z",
        "application": {
          "id": "clx0987654321",
          "jobId": "job123",
          "candidateId": "cand456",
          "userId": "usr789",
          "status": "SCREENING",
          "appliedAt": "2024-01-10T09:00:00Z",
          "job": {
            "id": "job123",
            "title": "Senior Software Engineer",
            "slug": "senior-software-engineer",
            "company": {
              "id": "comp123",
              "companyName": "Tech Corp",
              "companySlug": "tech-corp"
            }
          },
          "candidate": {
            "id": "cand456",
            "user": {
              "id": "usr789",
              "email": "candidate@example.com",
              "firstName": "John",
              "lastName": "Doe",
              "userType": "CANDIDATE"
            }
          }
        },
        "user": {
          "id": "usr123",
          "email": "recruiter@example.com",
          "firstName": "Jane",
          "lastName": "Smith",
          "userType": "EMPLOYER"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `400 Bad Request` - Invalid query parameters

---

### 2. Create Timeline Entry

Create a new timeline entry for an application.

**Endpoint:** `POST /api/application-timeline`

**Request Body:**

```json
{
  "applicationId": "clx0987654321",
  "status": "SCREENING",
  "note": "Moving to screening phase after initial review"
}
```

**Required Fields:**

- `applicationId` (string) - The application ID
- `status` (string) - New status (must be valid transition)

**Optional Fields:**

- `note` (string) - Additional notes (max 1000 characters)

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Timeline entry created successfully",
  "data": {
    "id": "clx1234567890",
    "applicationId": "clx0987654321",
    "status": "SCREENING",
    "note": "Moving to screening phase after initial review",
    "changedBy": "usr123",
    "createdAt": "2024-01-15T10:30:00Z",
    "user": {
      "id": "usr123",
      "email": "recruiter@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "userType": "EMPLOYER"
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User lacks permission (only EMPLOYER and ADMIN)
- `400 Bad Request` - Invalid status transition or validation error
- `404 Not Found` - Application not found

---

### 3. Get Timeline Entry

Get a specific timeline entry by ID.

**Endpoint:** `GET /api/application-timeline/{id}`

**Path Parameters:**

- `id` (string) - Timeline entry ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Timeline entry retrieved successfully",
  "data": {
    "id": "clx1234567890",
    "applicationId": "clx0987654321",
    "status": "SCREENING",
    "note": "Candidate meets all requirements",
    "changedBy": "usr123",
    "createdAt": "2024-01-15T10:30:00Z",
    "application": {
      // Full application details with relations
    },
    "user": {
      // User who made the change
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User lacks access to this timeline entry
- `404 Not Found` - Timeline entry not found

---

### 4. Update Timeline Entry

Update a timeline entry (only note can be updated).

**Endpoint:** `PUT /api/application-timeline/{id}`

**Path Parameters:**

- `id` (string) - Timeline entry ID

**Request Body:**

```json
{
  "note": "Updated note with additional information"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Timeline entry updated successfully",
  "data": {
    "id": "clx1234567890",
    "applicationId": "clx0987654321",
    "status": "SCREENING",
    "note": "Updated note with additional information",
    "changedBy": "usr123",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User lacks permission (only EMPLOYER and ADMIN)
- `404 Not Found` - Timeline entry not found
- `400 Bad Request` - Validation error (note too long)

---

### 5. Delete Timeline Entry

Delete a timeline entry (Admin only).

**Endpoint:** `DELETE /api/application-timeline/{id}`

**Path Parameters:**

- `id` (string) - Timeline entry ID

**Response:** `204 No Content`

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User lacks permission (only ADMIN)
- `404 Not Found` - Timeline entry not found

---

### 6. Bulk Create Timeline Entries

Create multiple timeline entries at once.

**Endpoint:** `POST /api/application-timeline/bulk`

**Request Body:**

```json
{
  "entries": [
    {
      "applicationId": "app1",
      "status": "SCREENING",
      "note": "Initial screening"
    },
    {
      "applicationId": "app2",
      "status": "REJECTED",
      "note": "Does not meet requirements"
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "3 timeline entries created successfully",
  "data": {
    "created": 3,
    "timelines": [
      // Array of created timeline entries
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User lacks permission (only EMPLOYER and ADMIN)
- `400 Bad Request` - Validation errors or invalid transitions
- `404 Not Found` - One or more applications not found

---

### 7. Bulk Update Status

Update status for multiple applications at once.

**Endpoint:** `PUT /api/application-timeline/bulk`

**Request Body:**

```json
{
  "applicationIds": ["app1", "app2", "app3"],
  "status": "REJECTED",
  "note": "Position filled"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "2 applications updated successfully",
  "data": {
    "updated": 2,
    "skipped": 1,
    "timelines": [
      // Array of created timeline entries
    ]
  }
}
```

**Note:** Applications with invalid status transitions will be skipped.

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User lacks permission (only EMPLOYER and ADMIN)
- `400 Bad Request` - Validation errors

---

### 8. Get Timeline Statistics

Get comprehensive statistics for an application's timeline.

**Endpoint:** `GET /api/application-timeline/stats/{applicationId}`

**Path Parameters:**

- `applicationId` (string) - Application ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Timeline statistics retrieved successfully",
  "data": {
    "applicationId": "clx0987654321",
    "totalStatusChanges": 4,
    "currentStatus": "OFFERED",
    "statusCounts": {
      "APPLIED": 1,
      "SCREENING": 1,
      "INTERVIEWING": 1,
      "OFFERED": 1
    },
    "averageTimeInStatus": {
      "APPLIED": 24.5,
      "SCREENING": 48.0,
      "INTERVIEWING": 72.0,
      "OFFERED": 12.0
    },
    "lastUpdateDate": "2024-01-20T15:00:00Z",
    "timelineProgress": [
      {
        "status": "APPLIED",
        "enteredAt": "2024-01-10T09:00:00Z",
        "exitedAt": "2024-01-11T09:30:00Z",
        "durationHours": 24.5,
        "note": "Application received",
        "changedBy": {
          "id": "usr789",
          "email": "candidate@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "userType": "CANDIDATE"
        }
      },
      {
        "status": "SCREENING",
        "enteredAt": "2024-01-11T09:30:00Z",
        "exitedAt": "2024-01-13T09:30:00Z",
        "durationHours": 48.0,
        "note": "Under review",
        "changedBy": {
          "id": "usr123",
          "email": "recruiter@example.com",
          "firstName": "Jane",
          "lastName": "Smith",
          "userType": "EMPLOYER"
        }
      }
    ]
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User lacks access to view statistics
- `404 Not Found` - Application or timeline not found

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message description",
  "details": {
    // Optional additional error details
  }
}
```

## Rate Limiting

API endpoints are rate limited to:

- **Standard users:** 100 requests per minute
- **Authenticated users:** 500 requests per minute
- **Bulk operations:** 10 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642334400
```

## Pagination

Paginated endpoints support the following parameters:

- `page` - Page number (starts at 1)
- `limit` - Items per page (max 100)

Pagination metadata is included in responses:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Webhooks

The ApplicationTimeline API can trigger webhooks on the following events:

- `timeline.created` - New timeline entry created
- `timeline.updated` - Timeline entry updated
- `status.changed` - Application status changed

Webhook payload example:

```json
{
  "event": "status.changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "applicationId": "clx0987654321",
    "oldStatus": "APPLIED",
    "newStatus": "SCREENING",
    "timelineId": "clx1234567890",
    "changedBy": "usr123"
  }
}
```

## Code Examples

### JavaScript/TypeScript

```typescript
// List timeline entries
const response = await fetch('/api/application-timeline?applicationId=clx0987654321', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Create timeline entry
const response = await fetch('/api/application-timeline', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    applicationId: 'clx0987654321',
    status: 'SCREENING',
    note: 'Moving to screening'
  })
});
```

### cURL

```bash
# List timeline entries
curl -X GET "https://api.career-connect.com/api/application-timeline?applicationId=clx0987654321" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create timeline entry
curl -X POST "https://api.career-connect.com/api/application-timeline" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "clx0987654321",
    "status": "SCREENING",
    "note": "Moving to screening"
  }'
```

## Support

For API support, please contact:

- Email: api-support@career-connect.com
- Documentation: https://docs.career-connect.com
- Status Page: https://status.career-connect.com
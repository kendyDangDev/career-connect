# CV Management API Documentation

## Overview

This document describes the CV Management API endpoints for handling user CVs and CV sections in the Career Connect platform.

## Base URL

```
/api/cv
```

## Authentication

All endpoints require authentication via NextAuth session. Include valid session cookies with each request.

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional: validation errors or additional details
}
```

## Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## UserCV Endpoints

### 1. List CVs

Get a paginated list of user CVs with optional filtering.

**Endpoint:** `GET /api/cv`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| userId | string | No | Current user | Filter by specific user ID |
| templateId | string | No | - | Filter by template ID |
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page |
| sortBy | string | No | createdAt | Sort field (createdAt, updatedAt, cv_name) |
| sortOrder | string | No | desc | Sort order (asc, desc) |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "CVs retrieved successfully",
  "data": [
    {
      "id": "cv_id",
      "userId": "user_id",
      "templateId": "template_id",
      "cv_name": "My Resume",
      "cvData": {},
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "template": {
        "id": "template_id",
        "name": "Professional Template",
        "category": "Modern",
        "previewImage": "url",
        "isPremium": false
      },
      "sections": [...],
      "_count": {
        "sections": 5
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Create CV

Create a new CV for the authenticated user.

**Endpoint:** `POST /api/cv`

**Request Body:**

```json
{
  "templateId": "template_id", // Optional
  "cv_name": "My Professional Resume",
  "cvData": {
    // Any JSON data for the CV
  }
}
```

**Validation Rules:**
- `cv_name` is required and must not be empty
- `templateId` is optional but must be valid if provided
- `cvData` can be any valid JSON object

**Success Response:** `201 Created`

```json
{
  "success": true,
  "message": "CV created successfully",
  "data": {
    "id": "new_cv_id",
    "userId": "user_id",
    "templateId": "template_id",
    "cv_name": "My Professional Resume",
    "cvData": {},
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "template": {...},
    "sections": []
  }
}
```

### 3. Get Single CV

Retrieve a specific CV by ID.

**Endpoint:** `GET /api/cv/{id}`

**Path Parameters:**
- `id` - CV ID (must be valid UUID)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "CV retrieved successfully",
  "data": {
    "id": "cv_id",
    "userId": "user_id",
    "templateId": "template_id",
    "cv_name": "My Resume",
    "cvData": {},
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "template": {
      "id": "template_id",
      "name": "Professional Template",
      "category": "Modern",
      "previewImage": "url",
      "structure": {},
      "styling": {},
      "isPremium": false
    },
    "sections": [
      {
        "id": "section_id",
        "cvId": "cv_id",
        "title": "Personal Information",
        "content": {},
        "order": 1,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### 4. Update CV

Update an existing CV.

**Endpoint:** `PUT /api/cv/{id}`

**Path Parameters:**
- `id` - CV ID (must be valid UUID)

**Request Body:**

```json
{
  "templateId": "new_template_id", // Optional
  "cv_name": "Updated Resume Name", // Optional
  "cvData": {} // Optional
}
```

**Success Response:** `200 OK`

Returns the updated CV object.

### 5. Delete CV

Delete a CV and all its sections.

**Endpoint:** `DELETE /api/cv/{id}`

**Path Parameters:**
- `id` - CV ID (must be valid UUID)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "CV deleted successfully",
  "data": null
}
```

---

## CVSection Endpoints

### 1. List Sections

Get a paginated list of CV sections.

**Endpoint:** `GET /api/cv/sections`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| cvId | string | No | - | Filter by CV ID |
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page |
| sortBy | string | No | order | Sort field (order, createdAt, updatedAt, title) |
| sortOrder | string | No | asc | Sort order (asc, desc) |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Sections retrieved successfully",
  "data": [
    {
      "id": "section_id",
      "cvId": "cv_id",
      "title": "Experience",
      "content": {
        "jobs": [...]
      },
      "order": 2,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "cv": {
        "id": "cv_id",
        "cv_name": "My Resume",
        "userId": "user_id"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 2. Create Section

Create a new section in a CV.

**Endpoint:** `POST /api/cv/sections`

**Request Body:**

```json
{
  "cvId": "cv_id", // Required
  "title": "Skills", // Required
  "content": {
    // Any JSON content
  },
  "order": 3 // Optional, auto-incremented if not provided
}
```

**Validation Rules:**
- `cvId` is required and must be valid
- `title` is required (max 100 characters)
- `order` is optional (auto-calculated if not provided)

**Success Response:** `201 Created`

```json
{
  "success": true,
  "message": "Section created successfully",
  "data": {
    "id": "new_section_id",
    "cvId": "cv_id",
    "title": "Skills",
    "content": {},
    "order": 3,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "cv": {
      "id": "cv_id",
      "cv_name": "My Resume"
    }
  }
}
```

### 3. Get Single Section

Retrieve a specific section by ID.

**Endpoint:** `GET /api/cv/sections/{id}`

**Path Parameters:**
- `id` - Section ID (must be valid UUID)

**Success Response:** `200 OK`

Returns the section object with CV details.

### 4. Update Section

Update an existing section.

**Endpoint:** `PUT /api/cv/sections/{id}`

**Path Parameters:**
- `id` - Section ID (must be valid UUID)

**Request Body:**

```json
{
  "title": "Updated Title", // Optional
  "content": {}, // Optional
  "order": 4 // Optional
}
```

**Success Response:** `200 OK`

Returns the updated section object.

### 5. Delete Section

Delete a section and reorder remaining sections.

**Endpoint:** `DELETE /api/cv/sections/{id}`

**Path Parameters:**
- `id` - Section ID (must be valid UUID)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Section deleted successfully",
  "data": null
}
```

**Note:** When a section is deleted, all sections with higher order values are automatically decremented by 1.

### 6. Batch Update Sections

Update multiple sections in a single request.

**Endpoint:** `PUT /api/cv/sections/batch`

**Request Body:**

```json
{
  "sections": [
    {
      "id": "section_id_1",
      "title": "New Title 1",
      "content": {},
      "order": 1
    },
    {
      "id": "section_id_2",
      "title": "New Title 2",
      "order": 2
    }
  ]
}
```

**Validation Rules:**
- All sections must belong to the same CV
- User must have access to the CV
- All section IDs must be valid UUIDs

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Sections updated successfully",
  "data": [
    // Array of updated sections
  ]
}
```

### 7. Reorder Sections

Reorder all sections of a CV.

**Endpoint:** `POST /api/cv/sections/batch`

**Request Body:**

```json
{
  "cvId": "cv_id",
  "sectionIds": [
    "section_id_3",
    "section_id_1",
    "section_id_2"
  ]
}
```

**Validation Rules:**
- All section IDs must belong to the specified CV
- All sections of the CV must be included
- Order is determined by the array position (1-indexed)

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Sections reordered successfully",
  "data": [
    // Array of sections in new order
  ]
}
```

---

## Data Models

### UserCV Model

```typescript
{
  id: string;           // CUID
  userId?: string;      // User ID (owner)
  templateId?: string;  // Template ID
  cv_name: string;      // CV name
  cvData?: object;      // JSON data
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
  template?: Template;  // Related template
  sections?: CvSection[]; // Related sections
}
```

### CVSection Model

```typescript
{
  id: string;         // CUID
  cvId: string;       // Parent CV ID
  title: string;      // Section title (max 100 chars)
  content?: object;   // JSON content
  order?: number;     // Display order
  createdAt: Date;    // Creation timestamp
  updatedAt: Date;    // Last update timestamp
  cv?: UserCv;        // Parent CV
}
```

### Template Model

```typescript
{
  id: string;           // CUID
  name: string;         // Template name (max 100 chars)
  category?: string;    // Category (max 50 chars)
  previewImage?: string; // Preview image URL
  structure?: object;   // JSON structure
  styling?: object;     // JSON styling
  isPremium: boolean;   // Premium flag
  createdAt: Date;      // Creation timestamp
}
```

---

## Usage Examples

### Create a CV with sections

```javascript
// 1. Create a CV
const cvResponse = await fetch('/api/cv', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cv_name: 'Software Engineer Resume',
    templateId: 'template_123'
  })
});
const { data: cv } = await cvResponse.json();

// 2. Add sections
const sections = [
  { title: 'Personal Information', content: {...}, order: 1 },
  { title: 'Experience', content: {...}, order: 2 },
  { title: 'Education', content: {...}, order: 3 },
  { title: 'Skills', content: {...}, order: 4 }
];

for (const section of sections) {
  await fetch('/api/cv/sections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cvId: cv.id,
      ...section
    })
  });
}
```

### Update multiple sections

```javascript
await fetch('/api/cv/sections/batch', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sections: [
      { id: 'section_1', title: 'Work Experience' },
      { id: 'section_2', content: { skills: [...] } }
    ]
  })
});
```

### Reorder sections

```javascript
await fetch('/api/cv/sections/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cvId: 'cv_123',
    sectionIds: ['section_3', 'section_1', 'section_4', 'section_2']
  })
});
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting in production:
- General endpoints: 100 requests per minute
- Create/Update endpoints: 20 requests per minute
- Batch operations: 10 requests per minute

---

## Security Considerations

1. **Authentication**: All endpoints require valid authentication
2. **Authorization**: Users can only access their own CVs and sections
3. **Input Validation**: All inputs are validated using Zod schemas
4. **SQL Injection**: Protected via Prisma ORM
5. **XSS Protection**: JSON content is stored as-is; sanitization should be done on the client side when rendering

---

## Future Enhancements

1. **Template Management API**: CRUD operations for templates
2. **CV Sharing**: Generate shareable links for CVs
3. **Export API**: Export CV to PDF, Word, or other formats
4. **Version Control**: Track CV versions and allow rollback
5. **Collaboration**: Allow multiple users to work on the same CV
6. **Analytics**: Track CV views and downloads
7. **AI Integration**: AI-powered content suggestions
8. **Bulk Operations**: Import/export multiple CVs

---

## Support

For issues or questions regarding the CV API, please contact the development team or create an issue in the project repository.
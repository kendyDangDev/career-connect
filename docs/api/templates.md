# Template API Documentation

## Overview

The Template API provides endpoints for managing CV templates in the Career Connect system. These templates are pre-designed CV layouts that users can choose from when creating their CVs.

**Base URL:** `/api/admin/templates`

**Authentication:** All endpoints require admin authentication via `withAdminAuth` middleware.

## Table of Contents

- [Data Models](#data-models)
- [Endpoints](#endpoints)
  - [List Templates](#1-list-templates)
  - [Get Template by ID](#2-get-template-by-id)
  - [Create Template](#3-create-template)
  - [Update Template](#4-update-template)
  - [Delete Template](#5-delete-template)
  - [Duplicate Template](#6-duplicate-template)
  - [Upload Preview Image](#7-upload-preview-image)
  - [Get Template Statistics](#8-get-template-statistics)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)

## Data Models

### Template Schema

```typescript
interface Template {
  id: string;
  name: string;
  category?: string;
  previewImage?: string;
  structure?: TemplateStructure;
  styling?: TemplateStyling;
  isPremium: boolean;
  createdAt: DateTime;
  usageCount?: number;
  recentUsages?: Array<{
    id: string;
    cv_name: string;
    createdAt: DateTime;
  }>;
}
```

### Template Structure

```typescript
interface TemplateStructure {
  sections?: Array<{
    id: string;
    type: 'personal_info' | 'summary' | 'experience' | 'education' | 
          'skills' | 'certifications' | 'languages' | 'references' | 'custom';
    title: string;
    required: boolean;
    order: number;
    config?: Record<string, any>;
  }>;
  layout?: {
    columns: 1 | 2 | 3;
    spacing: 'compact' | 'normal' | 'relaxed';
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  };
}
```

### Template Styling

```typescript
interface TemplateStyling {
  colors?: {
    primary?: string;    // Hex color
    secondary?: string;  // Hex color
    text?: string;       // Hex color
    background?: string; // Hex color
    accent?: string;     // Hex color
  };
  fonts?: {
    heading?: string;
    body?: string;
    size?: {
      base?: number;     // 8-20
      heading1?: number; // 16-48
      heading2?: number; // 14-36
      heading3?: number; // 12-28
    };
  };
  borderRadius?: number; // 0-20
  theme?: 'professional' | 'modern' | 'creative' | 'minimal' | 'classic';
}
```

## Endpoints

### 1. List Templates

Get a paginated list of templates with optional filters.

**Endpoint:** `GET /api/admin/templates`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Items per page (max: 100) |
| search | string | No | - | Search by name or category |
| category | string | No | - | Filter by category |
| isPremium | boolean | No | - | Filter by premium status |
| sortBy | string | No | 'createdAt' | Sort field: 'name', 'createdAt', 'category' |
| sortOrder | string | No | 'desc' | Sort order: 'asc' or 'desc' |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cm4...",
      "name": "Professional CV",
      "category": "professional",
      "previewImage": "https://...",
      "structure": {...},
      "styling": {...},
      "isPremium": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "usageCount": 150
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Get Template by ID

Get detailed information about a specific template.

**Endpoint:** `GET /api/admin/templates/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Template ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cm4...",
    "name": "Professional CV",
    "category": "professional",
    "previewImage": "https://...",
    "structure": {
      "sections": [...],
      "layout": {...}
    },
    "styling": {
      "colors": {...},
      "fonts": {...}
    },
    "isPremium": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "usageCount": 150,
    "recentUsages": [
      {
        "id": "cv123",
        "cv_name": "My Resume",
        "createdAt": "2024-01-15T00:00:00Z"
      }
    ]
  }
}
```

### 3. Create Template

Create a new CV template.

**Endpoint:** `POST /api/admin/templates`

**Request Body:**

```json
{
  "name": "Modern CV Template",
  "category": "modern",
  "previewImage": "https://cloudinary.com/...",
  "description": "A clean and modern CV template",
  "structure": {
    "sections": [
      {
        "id": "sec1",
        "type": "personal_info",
        "title": "Personal Information",
        "required": true,
        "order": 1
      }
    ],
    "layout": {
      "columns": 2,
      "spacing": "normal"
    }
  },
  "styling": {
    "colors": {
      "primary": "#2563eb",
      "text": "#1f2937"
    },
    "theme": "modern"
  },
  "isPremium": false,
  "tags": ["modern", "clean", "professional"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cm4...",
    "name": "Modern CV Template",
    ...
  },
  "message": "Template created successfully"
}
```

### 4. Update Template

Update an existing template.

**Endpoint:** `PUT /api/admin/templates/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Template ID |

**Request Body:**

All fields are optional. Only include fields you want to update.

```json
{
  "name": "Updated Template Name",
  "category": "creative",
  "isPremium": true,
  "styling": {
    "colors": {
      "primary": "#dc2626"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cm4...",
    "name": "Updated Template Name",
    ...
  },
  "message": "Template updated successfully"
}
```

### 5. Delete Template

Delete a template. Cannot delete if template is being used by any CVs.

**Endpoint:** `DELETE /api/admin/templates/{id}`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Template ID |

**Response:**

```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

**Error Response (if template is in use):**

```json
{
  "success": false,
  "error": "Cannot delete template. It is being used by 25 CV(s)."
}
```

### 6. Duplicate Template

Create a copy of an existing template.

**Endpoint:** `POST /api/admin/templates/{id}/duplicate`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Source template ID |

**Request Body:**

```json
{
  "name": "Copy of Professional CV"  // Optional, defaults to "{original} (Copy)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "cm5...",
    "name": "Copy of Professional CV",
    ...
  },
  "message": "Template duplicated successfully"
}
```

### 7. Upload Preview Image

Upload a preview image for a template.

**Endpoint:** `POST /api/admin/templates/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Image file (JPEG, PNG, or WebP, max 5MB) |
| templateId | string | No | Template ID to update with the uploaded image |

**Response:**

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://res.cloudinary.com/...",
    "template": {
      "id": "cm4...",
      "previewImage": "https://res.cloudinary.com/...",
      ...
    }
  },
  "message": "Image uploaded successfully"
}
```

### 8. Get Template Statistics

Get aggregated statistics about templates.

**Endpoint:** `GET /api/admin/templates/stats`

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 45,
    "premium": 12,
    "free": 33,
    "byCategory": [
      {
        "category": "professional",
        "count": 15
      },
      {
        "category": "modern",
        "count": 10
      }
    ],
    "mostUsed": [
      {
        "id": "cm4...",
        "name": "Professional CV",
        "category": "professional",
        "usageCount": 250
      }
    ]
  }
}
```

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "details": [...]  // Optional, for validation errors
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate or constraint violation |
| 500 | Internal Server Error |

## Rate Limiting

- Default rate limit: 100 requests per minute per IP
- Upload endpoint: 10 requests per minute per user

## Validation Rules

### Template Name
- Minimum length: 3 characters
- Maximum length: 100 characters
- Must be unique (case-insensitive)

### Template Category
- Allowed values: `professional`, `creative`, `modern`, `simple`, `technical`, `executive`, `student`

### Preview Image
- Allowed formats: JPEG, PNG, WebP
- Maximum file size: 5MB
- Automatically resized to 800x1130px

### Colors
- Must be valid hex color codes (e.g., `#2563eb`)

### Font Sizes
- Base: 8-20px
- Heading1: 16-48px
- Heading2: 14-36px
- Heading3: 12-28px

## Audit Logging

All template operations are logged in the audit_logs table with the following information:
- User ID
- Action (CREATE_TEMPLATE, UPDATE_TEMPLATE, DELETE_TEMPLATE, DUPLICATE_TEMPLATE, UPDATE_TEMPLATE_IMAGE)
- Old and new values
- IP address
- User agent
- Timestamp

## Notes

1. **Premium Templates**: Premium templates may have restricted access based on user subscription level.

2. **Template Usage**: Templates cannot be deleted if they are being used by any CVs. The system will return an error with the count of CVs using the template.

3. **Image Processing**: Uploaded images are automatically optimized using Sharp library before being stored in Cloudinary.

4. **Caching**: Template lists are cached for 5 minutes to improve performance. Individual template details are cached for 10 minutes.

5. **Permissions**: All endpoints require admin role. Future updates may include different permission levels for different operations.

## Examples

### cURL Example - Create Template

```bash
curl -X POST https://career-connect.com/api/admin/templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Executive CV",
    "category": "executive",
    "isPremium": true,
    "structure": {
      "sections": [
        {
          "id": "sec1",
          "type": "personal_info",
          "title": "Contact",
          "required": true,
          "order": 1
        }
      ]
    }
  }'
```

### JavaScript/TypeScript Example

```typescript
// Using fetch API
const createTemplate = async (templateData: CreateTemplateInput) => {
  const response = await fetch('/api/admin/templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(templateData)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// Upload preview image
const uploadPreviewImage = async (file: File, templateId?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  if (templateId) {
    formData.append('templateId', templateId);
  }

  const response = await fetch('/api/admin/templates/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

## Change Log

### Version 1.0.0 (2025-01-17)
- Initial release with full CRUD operations
- Template duplication feature
- Preview image upload
- Statistics endpoint
- Audit logging for all operations
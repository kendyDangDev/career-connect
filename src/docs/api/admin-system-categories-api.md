# Admin System Categories API Documentation

## Overview

The System Categories API provides endpoints for managing various system-level categorization data including job categories, industries, skills, and locations. These categories are fundamental building blocks used throughout the Career Connect platform.

**Base URL**: `/api/admin/system-categories`

## Authentication

All endpoints require Admin authentication via NextAuth session.

```javascript
// Required headers
{
  "Cookie": "next-auth.session-token=<session_token>"
}
```

### Authorization Errors

| Status Code | Error Code | Description |
|------------|------------|-------------|
| 401 | `UNAUTHORIZED` | User is not authenticated |
| 403 | `FORBIDDEN` | User does not have admin privileges |

## Rate Limiting

API endpoints implement rate limiting to prevent abuse:

| Operation Type | Limit | Time Window |
|---------------|-------|-------------|
| GET requests | No limit | - |
| POST/PUT requests | 10 requests | 60 seconds |
| DELETE requests | 5 requests | 60 seconds |
| Bulk operations | 3 requests | 60 seconds |
| Import operations | 1 request | 5 minutes |

Rate limit error response:
```json
{
  "success": false,
  "error": "RATE_LIMIT",
  "message": "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
  "statusCode": 429
}
```

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Success message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of resources */ ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Detailed error message",
  "statusCode": 400
}
```

## Common Query Parameters

### Pagination Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Current page number |
| `limit` | integer | 10 | 100 | Number of items per page |

### Sorting Parameters

| Parameter | Type | Default | Values | Description |
|-----------|------|---------|--------|-------------|
| `sortBy` | string | createdAt | name, createdAt, sortOrder | Field to sort by |
| `sortOrder` | string | desc | asc, desc | Sort direction |

### Filtering Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search in name and description fields |
| `isActive` | boolean | Filter by active status |

---

## 1. Categories API

Manage hierarchical job categories with parent-child relationships.

### 1.1 Get Categories List

`GET /categories`

Retrieve paginated list of job categories with optional hierarchy.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, max: 100) |
| `search` | string | No | Search in name and description |
| `isActive` | boolean | No | Filter by active status |
| `parentId` | string | No | Filter by parent category ID (use "null" for root categories) |
| `includeChildren` | boolean | No | Include full category tree |
| `sortBy` | string | No | Sort field (name, createdAt, sortOrder) |
| `sortOrder` | string | No | Sort direction (asc, desc) |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "cm123abc",
      "name": "Information Technology",
      "slug": "information-technology",
      "parentId": null,
      "description": "IT and software development jobs",
      "iconUrl": "https://example.com/icon.png",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "parent": null,
      "_count": {
        "children": 5,
        "jobCategories": 150
      },
      "children": [
        {
          "id": "cm456def",
          "name": "Web Development",
          "slug": "web-development",
          "parentId": "cm123abc",
          "isActive": true,
          "_count": {
            "children": 0,
            "jobCategories": 50
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 1.2 Get Category Details

`GET /categories/{id}`

Retrieve detailed information about a specific category including its children.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Category ID |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "cm123abc",
    "name": "Information Technology",
    "slug": "information-technology",
    "parentId": null,
    "description": "IT and software development jobs",
    "iconUrl": "https://example.com/icon.png",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "parent": null,
    "children": [
      {
        "id": "cm456def",
        "name": "Web Development",
        "slug": "web-development",
        "isActive": true,
        "_count": {
          "children": 0,
          "jobCategories": 50
        }
      }
    ],
    "_count": {
      "children": 5,
      "jobCategories": 150
    }
  }
}
```

### 1.3 Create Category

`POST /categories`

Create a new job category.

#### Request Body

```json
{
  "name": "Mobile Development",
  "parentId": "cm123abc",
  "description": "Mobile app development for iOS and Android",
  "iconUrl": "https://example.com/mobile-icon.png",
  "sortOrder": 2
}
```

#### Field Validation

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `name` | string | Yes | Min 2, max 100 characters, unique within same level |
| `parentId` | string | No | Must be valid existing category ID |
| `description` | string | No | Max 500 characters |
| `iconUrl` | string | No | Valid URL format |
| `sortOrder` | integer | No | Min 0 |

#### Business Rules

- Maximum nesting depth: 3 levels
- Name must be unique within the same parent category
- Cannot create circular references

#### Response

```json
{
  "success": true,
  "data": {
    "id": "cm789ghi",
    "name": "Mobile Development",
    "slug": "mobile-development",
    "parentId": "cm123abc",
    "description": "Mobile app development for iOS and Android",
    "iconUrl": "https://example.com/mobile-icon.png",
    "sortOrder": 2,
    "isActive": true,
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z",
    "parent": {
      "id": "cm123abc",
      "name": "Information Technology"
    },
    "_count": {
      "children": 0,
      "jobCategories": 0
    }
  },
  "message": "Tạo danh mục thành công",
  "statusCode": 201
}
```

### 1.4 Update Category

`PUT /categories/{id}`

Update an existing category.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Category ID |

#### Request Body

```json
{
  "name": "Mobile & Cross-Platform Development",
  "parentId": "cm123abc",
  "description": "Updated description",
  "iconUrl": "https://example.com/new-icon.png",
  "sortOrder": 3,
  "isActive": true
}
```

#### Business Rules

- Cannot set a category as its own parent
- Cannot set a child category as parent (circular reference)
- Cannot exceed maximum nesting depth when changing parent

#### Response

```json
{
  "success": true,
  "data": { /* updated category object */ },
  "message": "Cập nhật danh mục thành công"
}
```

### 1.5 Delete Category

`DELETE /categories/{id}`

Delete a category if it's not in use.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Category ID |

#### Business Rules

- Cannot delete if category has child categories
- Cannot delete if category is assigned to any jobs

#### Response

```json
{
  "success": true,
  "data": {
    "id": "cm789ghi"
  },
  "message": "Xóa danh mục thành công"
}
```

---

## 2. Industries API

Manage industry categories for company classification.

### 2.1 Get Industries List

`GET /industries`

Retrieve paginated list of industries.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, max: 100) |
| `search` | string | No | Search in name and description |
| `isActive` | boolean | No | Filter by active status |
| `sortBy` | string | No | Sort field (name, createdAt, sortOrder) |
| `sortOrder` | string | No | Sort direction (asc, desc) |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "ind123abc",
      "name": "Technology",
      "slug": "technology",
      "description": "Technology and software companies",
      "iconUrl": "https://example.com/tech-icon.png",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "_count": {
        "companies": 250
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### 2.2 Get Industry Details

`GET /industries/{id}`

Retrieve detailed information about a specific industry.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Industry ID |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "ind123abc",
    "name": "Technology",
    "slug": "technology",
    "description": "Technology and software companies",
    "iconUrl": "https://example.com/tech-icon.png",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "_count": {
      "companies": 250
    }
  }
}
```

### 2.3 Create Industry

`POST /industries`

Create a new industry.

#### Request Body

```json
{
  "name": "Healthcare",
  "description": "Healthcare and medical services",
  "iconUrl": "https://example.com/health-icon.png",
  "sortOrder": 2
}
```

#### Field Validation

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `name` | string | Yes | Min 2, max 100 characters, unique |
| `description` | string | No | Max 500 characters |
| `iconUrl` | string | No | Valid URL format |
| `sortOrder` | integer | No | Min 0 |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "ind456def",
    "name": "Healthcare",
    "slug": "healthcare",
    "description": "Healthcare and medical services",
    "iconUrl": "https://example.com/health-icon.png",
    "sortOrder": 2,
    "isActive": true,
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z",
    "_count": {
      "companies": 0
    }
  },
  "message": "Tạo ngành nghề thành công",
  "statusCode": 201
}
```

### 2.4 Update Industry

`PUT /industries/{id}`

Update an existing industry.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Industry ID |

#### Request Body

```json
{
  "name": "Healthcare & Medical",
  "description": "Updated description",
  "iconUrl": "https://example.com/new-health-icon.png",
  "sortOrder": 3,
  "isActive": true
}
```

#### Response

```json
{
  "success": true,
  "data": { /* updated industry object */ },
  "message": "Cập nhật ngành nghề thành công"
}
```

### 2.5 Delete Industry

`DELETE /industries/{id}`

Delete an industry if it's not in use.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Industry ID |

#### Business Rules

- Cannot delete if any companies are using this industry

#### Response

```json
{
  "success": true,
  "data": {
    "id": "ind456def"
  },
  "message": "Xóa ngành nghề thành công"
}
```

### 2.6 Bulk Update Industry Status

`POST /industries/bulk/update-status`

Update active status for multiple industries.

#### Request Body

```json
{
  "ids": ["ind123abc", "ind456def", "ind789ghi"],
  "isActive": false
}
```

#### Field Validation

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `ids` | array | Yes | Array of valid industry IDs, max 100 items |
| `isActive` | boolean | Yes | Active status to set |

#### Response

```json
{
  "success": true,
  "data": {
    "updated": 3,
    "ids": ["ind123abc", "ind456def", "ind789ghi"]
  },
  "message": "Đã cập nhật trạng thái cho 3 ngành nghề"
}
```

### 2.7 Bulk Delete Industries

`DELETE /industries/bulk`

Delete multiple industries at once.

#### Request Body

```json
{
  "ids": ["ind123abc", "ind456def"]
}
```

#### Field Validation

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `ids` | array | Yes | Array of valid industry IDs, max 50 items |

#### Business Rules

- Will only delete industries that are not in use
- Returns error if any industry is being used

#### Response

```json
{
  "success": true,
  "data": {
    "deleted": 2,
    "ids": ["ind123abc", "ind456def"]
  },
  "message": "Đã xóa 2 ngành nghề"
}
```

---

## 3. Skills API

Manage skills categorized by type (Technical, Soft, Language, Tool).

### 3.1 Get Skills List

`GET /skills`

Retrieve paginated list of skills with category statistics.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, max: 100) |
| `search` | string | No | Search in name and description |
| `isActive` | boolean | No | Filter by active status |
| `category` | enum | No | Filter by category (TECHNICAL, SOFT, LANGUAGE, TOOL) |
| `sortBy` | string | No | Sort field (name, createdAt) |
| `sortOrder` | string | No | Sort direction (asc, desc) |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "sk123abc",
      "name": "JavaScript",
      "slug": "javascript",
      "category": "TECHNICAL",
      "description": "JavaScript programming language",
      "iconUrl": "https://example.com/js-icon.png",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "_count": {
        "candidateSkills": 500,
        "jobSkills": 200
      }
    }
  ],
  "meta": {
    "total": 300,
    "page": 1,
    "limit": 10,
    "totalPages": 30,
    "categoryStats": {
      "TECHNICAL": 150,
      "SOFT": 50,
      "LANGUAGE": 30,
      "TOOL": 70
    }
  }
}
```

### 3.2 Get Skill Details

`GET /skills/{id}`

Retrieve detailed information about a specific skill.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Skill ID |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "sk123abc",
    "name": "JavaScript",
    "slug": "javascript",
    "category": "TECHNICAL",
    "description": "JavaScript programming language",
    "iconUrl": "https://example.com/js-icon.png",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "_count": {
      "candidateSkills": 500,
      "jobSkills": 200
    }
  }
}
```

### 3.3 Create Skill

`POST /skills`

Create a new skill.

#### Request Body

```json
{
  "name": "Python",
  "category": "TECHNICAL",
  "description": "Python programming language",
  "iconUrl": "https://example.com/python-icon.png"
}
```

#### Field Validation

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `name` | string | Yes | Min 2, max 100 characters, unique |
| `category` | enum | Yes | One of: TECHNICAL, SOFT, LANGUAGE, TOOL |
| `description` | string | No | Max 500 characters |
| `iconUrl` | string | No | Valid URL format |

#### Skill Categories

| Category | Description |
|----------|-------------|
| `TECHNICAL` | Technical/hard skills (programming, frameworks, etc.) |
| `SOFT` | Soft skills (communication, teamwork, etc.) |
| `LANGUAGE` | Language proficiencies |
| `TOOL` | Tools and software proficiency |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "sk456def",
    "name": "Python",
    "slug": "python",
    "category": "TECHNICAL",
    "description": "Python programming language",
    "iconUrl": "https://example.com/python-icon.png",
    "isActive": true,
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z",
    "_count": {
      "candidateSkills": 0,
      "jobSkills": 0
    }
  },
  "message": "Tạo kỹ năng thành công",
  "statusCode": 201
}
```

### 3.4 Update Skill

`PUT /skills/{id}`

Update an existing skill.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Skill ID |

#### Request Body

```json
{
  "name": "Python 3",
  "category": "TECHNICAL",
  "description": "Python 3 programming language",
  "iconUrl": "https://example.com/python3-icon.png",
  "isActive": true
}
```

#### Response

```json
{
  "success": true,
  "data": { /* updated skill object */ },
  "message": "Cập nhật kỹ năng thành công"
}
```

### 3.5 Delete Skill

`DELETE /skills/{id}`

Delete a skill if it's not in use.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Skill ID |

#### Business Rules

- Cannot delete if skill is assigned to any candidates or jobs

#### Response

```json
{
  "success": true,
  "data": {
    "id": "sk456def"
  },
  "message": "Xóa kỹ năng thành công"
}
```

### 3.6 Import Skills

`POST /skills/import`

Import multiple skills from a CSV or JSON file.

#### Request Format

Content-Type: `multipart/form-data`

#### Form Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | CSV or JSON file containing skills |

#### CSV Format

```csv
name,category,description,iconUrl
JavaScript,TECHNICAL,JavaScript programming language,https://example.com/js.png
Python,TECHNICAL,Python programming language,https://example.com/python.png
Communication,SOFT,Effective communication skills,
English,LANGUAGE,English language proficiency,
Git,TOOL,Version control with Git,
```

#### JSON Format

```json
[
  {
    "name": "JavaScript",
    "category": "TECHNICAL",
    "description": "JavaScript programming language",
    "iconUrl": "https://example.com/js.png"
  },
  {
    "name": "Communication",
    "category": "SOFT",
    "description": "Effective communication skills"
  }
]
```

#### Response

```json
{
  "success": true,
  "data": {
    "total": 5,
    "success": 4,
    "failed": 1,
    "errors": [
      {
        "row": 3,
        "error": "Kỹ năng \"JavaScript\" đã tồn tại"
      }
    ]
  },
  "message": "Import hoàn tất: 4 thành công, 1 thất bại"
}
```

---

## 4. Locations API

Manage hierarchical geographic locations (Country → Province → City → District).

### 4.1 Get Locations List

`GET /locations`

Retrieve paginated list of locations with optional hierarchy.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 10, max: 100) |
| `search` | string | No | Search in name |
| `isActive` | boolean | No | Filter by active status |
| `type` | enum | No | Filter by type (COUNTRY, PROVINCE, CITY, DISTRICT) |
| `parentId` | string | No | Filter by parent location ID (use "null" for root) |
| `includeChildren` | boolean | No | Include full location tree |
| `sortBy` | string | No | Sort field (name, createdAt) |
| `sortOrder` | string | No | Sort direction (asc, desc) |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "loc123abc",
      "name": "Vietnam",
      "type": "COUNTRY",
      "parentId": null,
      "latitude": 14.058324,
      "longitude": 108.277199,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "parent": null,
      "_count": {
        "children": 63
      },
      "children": [
        {
          "id": "loc456def",
          "name": "Hà Nội",
          "type": "PROVINCE",
          "parentId": "loc123abc",
          "_count": {
            "children": 30
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "typeStats": {
      "COUNTRY": 1,
      "PROVINCE": 63,
      "CITY": 713,
      "DISTRICT": 9000
    }
  }
}
```

### 4.2 Get Location Details

`GET /locations/{id}`

Retrieve detailed information about a specific location.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Location ID |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "loc456def",
    "name": "Hà Nội",
    "type": "PROVINCE",
    "parentId": "loc123abc",
    "latitude": 21.028511,
    "longitude": 105.804817,
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "parent": {
      "id": "loc123abc",
      "name": "Vietnam",
      "type": "COUNTRY"
    },
    "children": [
      {
        "id": "loc789ghi",
        "name": "Quận Ba Đình",
        "type": "DISTRICT",
        "_count": {
          "children": 0
        }
      }
    ],
    "_count": {
      "children": 30
    }
  }
}
```

### 4.3 Create Location

`POST /locations`

Create a new location.

#### Request Body

```json
{
  "name": "Quận 1",
  "type": "DISTRICT",
  "parentId": "loc789ghi",
  "latitude": 10.7756587,
  "longitude": 106.7004238
}
```

#### Field Validation

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `name` | string | Yes | Min 2, max 100 characters |
| `type` | enum | Yes | One of: COUNTRY, PROVINCE, CITY, DISTRICT |
| `parentId` | string | Conditional | Required for non-COUNTRY types |
| `latitude` | number | No | Valid latitude (-90 to 90) |
| `longitude` | number | No | Valid longitude (-180 to 180) |

#### Location Type Hierarchy

| Type | Required Parent Type |
|------|---------------------|
| `COUNTRY` | None (root level) |
| `PROVINCE` | COUNTRY |
| `CITY` | PROVINCE |
| `DISTRICT` | CITY |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "loc999xyz",
    "name": "Quận 1",
    "type": "DISTRICT",
    "parentId": "loc789ghi",
    "latitude": 10.7756587,
    "longitude": 106.7004238,
    "isActive": true,
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z",
    "parent": {
      "id": "loc789ghi",
      "name": "TP. Hồ Chí Minh",
      "type": "CITY"
    },
    "_count": {
      "children": 0
    }
  },
  "message": "Tạo địa điểm thành công",
  "statusCode": 201
}
```

### 4.4 Update Location

`PUT /locations/{id}`

Update an existing location.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Location ID |

#### Request Body

```json
{
  "name": "Quận 1 - TP.HCM",
  "latitude": 10.7756587,
  "longitude": 106.7004238,
  "isActive": true
}
```

#### Business Rules

- Cannot change type if location has children with incompatible types
- Must maintain hierarchy rules when changing parent

#### Response

```json
{
  "success": true,
  "data": { /* updated location object */ },
  "message": "Cập nhật địa điểm thành công"
}
```

### 4.5 Delete Location

`DELETE /locations/{id}`

Delete a location if it's not in use.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Location ID |

#### Business Rules

- Cannot delete if location has child locations
- Cannot delete if location is being used by companies or jobs

#### Response

```json
{
  "success": true,
  "data": {
    "id": "loc999xyz"
  },
  "message": "Xóa địa điểm thành công"
}
```

### 4.6 Get Popular Cities

`GET /locations/popular`

Retrieve list of popular cities for quick selection.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "loc_hn",
      "name": "Hà Nội",
      "type": "CITY",
      "parent": {
        "id": "loc_vn",
        "name": "Vietnam"
      }
    },
    {
      "id": "loc_hcm",
      "name": "TP. Hồ Chí Minh",
      "type": "CITY",
      "parent": {
        "id": "loc_vn",
        "name": "Vietnam"
      }
    },
    {
      "id": "loc_dn",
      "name": "Đà Nẵng",
      "type": "CITY",
      "parent": {
        "id": "loc_vn",
        "name": "Vietnam"
      }
    }
  ]
}
```

---

## Error Codes Reference

### General Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `UNAUTHORIZED` | 401 | User is not authenticated |
| `FORBIDDEN` | 403 | User lacks required permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_NAME` | 400 | Name already exists |
| `IN_USE` | 400 | Resource cannot be deleted as it's in use |
| `RATE_LIMIT` | 429 | Too many requests |

### Category-Specific Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_PARENT` | 400 | Parent category/location does not exist |
| `MAX_DEPTH_EXCEEDED` | 400 | Maximum nesting depth exceeded |
| `CIRCULAR_REFERENCE` | 400 | Action would create circular reference |
| `SELF_PARENT` | 400 | Cannot set item as its own parent |

### Location-Specific Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_TYPE_HIERARCHY` | 400 | Invalid location type hierarchy |
| `PARENT_REQUIRED` | 400 | Parent location is required for this type |

### Import-Specific Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `NO_FILE` | 400 | No file provided |
| `INVALID_FILE_TYPE` | 400 | Unsupported file type |
| `INVALID_JSON` | 400 | Invalid JSON format |
| `INVALID_CSV_HEADERS` | 400 | Required CSV headers missing |

---

## Audit Logging

All CREATE, UPDATE, and DELETE operations are automatically logged with the following information:

- User ID performing the action
- Action type (CREATE, UPDATE, DELETE, BULK_DELETE, UPDATE_STATUS, IMPORT_SKILLS)
- Table name affected
- Record ID(s) affected
- Previous values (for updates and deletes)
- New values (for creates and updates)
- Request metadata (IP address, user agent)
- Timestamp

---

## Best Practices

### Pagination

- Always use pagination for list endpoints to avoid performance issues
- Default limit is 10 items per page
- Maximum limit is 100 items per page
- Use `meta.totalPages` to determine available pages

### Searching and Filtering

- Use the `search` parameter for text-based searching
- Combine multiple filters for more precise results
- Use `isActive` filter to exclude inactive items

### Hierarchical Data

- Use `includeChildren=true` to get full tree structure
- Use `parentId=null` to get only root-level items
- Be mindful of depth when creating nested categories/locations

### Error Handling

- Always check the `success` field in responses
- Use the `error` code for programmatic error handling
- Display the `message` field to users for human-readable errors

### Performance Considerations

- Avoid requesting large datasets without pagination
- Use specific filters to reduce result sets
- Cache frequently accessed data like popular cities
- Be mindful of rate limits for write operations

---

## Examples

### Example 1: Creating a Complete Category Hierarchy

```javascript
// 1. Create root category
const rootCategory = await fetch('/api/admin/system-categories/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Engineering',
    description: 'Engineering positions'
  })
});

// 2. Create sub-category
const subCategory = await fetch('/api/admin/system-categories/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Software Engineering',
    parentId: rootCategory.data.id,
    description: 'Software development positions'
  })
});

// 3. Create leaf category
const leafCategory = await fetch('/api/admin/system-categories/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Frontend Development',
    parentId: subCategory.data.id,
    description: 'Frontend engineering positions'
  })
});
```

### Example 2: Searching and Filtering Skills

```javascript
// Get all technical skills containing "Java"
const response = await fetch('/api/admin/system-categories/skills?' + 
  new URLSearchParams({
    search: 'Java',
    category: 'TECHNICAL',
    isActive: true,
    page: 1,
    limit: 20
  })
);

const result = await response.json();
console.log(`Found ${result.meta.total} Java-related technical skills`);
```

### Example 3: Bulk Operations on Industries

```javascript
// Update status for multiple industries
const updateResponse = await fetch('/api/admin/system-categories/industries/bulk/update-status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ids: ['ind1', 'ind2', 'ind3'],
    isActive: false
  })
});

// Delete unused industries
const deleteResponse = await fetch('/api/admin/system-categories/industries/bulk', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    ids: ['ind4', 'ind5']
  })
});
```

### Example 4: Building Location Hierarchy

```javascript
// Get all provinces of a country with their cities
const response = await fetch('/api/admin/system-categories/locations?' + 
  new URLSearchParams({
    type: 'PROVINCE',
    parentId: 'vietnam_country_id',
    includeChildren: true,
    sortBy: 'name',
    sortOrder: 'asc'
  })
);

const provinces = await response.json();
// Each province will include its cities in the children array
```

---

## Migration Guide

### Migrating from Previous API Versions

If migrating from an older API version, note these changes:

1. **Authentication**: All endpoints now require admin authentication
2. **Response Format**: Standardized success/error response format
3. **Pagination**: Meta information now includes `totalPages`
4. **Rate Limiting**: Stricter rate limits for write operations
5. **Validation**: More comprehensive input validation
6. **Audit Logging**: All modifications are now logged

---

## Support and Contact

For API support, bug reports, or feature requests, please contact:

- Technical Support: api-support@careerconnect.com
- Documentation Issues: docs@careerconnect.com
- Security Concerns: security@careerconnect.com

## Changelog

### Version 1.0.0 (2024-01-20)
- Initial release of System Categories API
- Support for Categories, Industries, Skills, and Locations
- Hierarchical data structures for Categories and Locations
- Bulk operations for Industries
- Import functionality for Skills
- Comprehensive audit logging
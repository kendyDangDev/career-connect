# Company Management API Documentation

## Overview
API endpoints for managing company information in the employer portal.

## Authentication
All endpoints (except public viewing) require employer authentication with appropriate permissions.

## Endpoints

### 1. Get Company Profile (Employer)
**GET** `/api/companies/profile`

Get current employer's company profile with statistics.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "company": {
      "id": "string",
      "companyName": "string",
      "companySlug": "string",
      "industry": {
        "id": "string",
        "name": "string"
      },
      "companySize": "SMALL_11_50",
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
      "employeeCount": 10,
      "activeJobCount": 5,
      "followerCount": 100
    },
    "userRole": "ADMIN",
    "canManage": true,
    "stats": {
      "activeJobs": 5,
      "totalApplications": 50,
      "newApplications": 10,
      "followers": 100,
      "views": 1000,
      "averageRating": 4.5
    }
  }
}
```

### 2. Update Company Profile
**PUT** `/api/companies/profile`

Update company information.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "companyName": "string",
  "industryId": "string",
  "companySize": "MEDIUM_51_200",
  "websiteUrl": "https://example.com",
  "description": "Company description (min 50 chars)",
  "address": "string",
  "city": "string", 
  "province": "string",
  "country": "Vietnam",
  "phone": "+84123456789",
  "email": "contact@company.com",
  "foundedYear": 2020
}
```

**Validation Rules:**
- `companyName`: 2-200 characters, alphanumeric and basic punctuation
- `description`: 50-5000 characters
- `websiteUrl`: Valid URL format
- `email`: Valid email format
- `phone`: Vietnamese phone format (+84 or 0 prefix)
- `foundedYear`: Between 1900 and current year

**Response:**
```json
{
  "success": true,
  "message": "Company profile updated successfully",
  "data": {
    "company": { ... }
  }
}
```

### 3. Upload Company Media
**POST** `/api/companies/media`

Upload logo, cover image, gallery images, or videos.

**Headers:**
```
Authorization: Bearer {token}
```

**Body (FormData):**
- `type`: "logo" | "cover" | "gallery" | "video"
- `file`: File (for single uploads)
- `files`: File[] (for gallery uploads)

**File Constraints:**

**Logo:**
- Max size: 5MB
- Formats: JPEG, PNG, WebP
- Dimensions: 200x200px to 1000x1000px

**Cover Image:**
- Max size: 10MB
- Formats: JPEG, PNG, WebP
- Dimensions: 1200x400px to 3000x1000px

**Gallery:**
- Max size: 10MB per image
- Max files: 20
- Formats: JPEG, PNG, WebP

**Video:**
- Max size: 100MB
- Formats: MP4, WebM, OGG
- Max duration: 5 minutes

**Response:**
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "data": {
    "logoUrl": "/uploads/companies/logos/company_123_logo_1234567890_abc123.jpg"
  }
}
```

### 4. Delete Company Media
**DELETE** `/api/companies/media`

Remove logo or cover image.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "mediaType": "logo" | "cover",
  "fileUrl": "/uploads/companies/logos/filename.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logo deleted successfully"
}
```

### 5. Get Public Company Profile
**GET** `/api/companies/{slug}`

Get public company profile (for candidates viewing).

**Parameters:**
- `slug`: Company URL slug

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
    "foundedYear": 2020,
    "verificationStatus": "VERIFIED",
    "activeJobCount": 10,
    "followerCount": 250,
    "reviewStats": {
      "totalReviews": 15,
      "averageRating": 4.2
    }
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
  "success": false,
  "error": "You don't have permission to update company information"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "companyName": "Company name must be at least 2 characters",
    "email": "Invalid email format"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Company not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to update company profile"
}
```

## Implementation Notes

1. **Authentication**: Uses NextAuth session to verify user identity
2. **Authorization**: Checks CompanyUser role (ADMIN, HR_MANAGER can manage)
3. **File Storage**: Files are stored in `/public/uploads/companies/`
4. **Slug Generation**: Automatic from company name, ensures uniqueness
5. **Media Replacement**: Old files are deleted when uploading new ones

## Future Enhancements

1. **Company Offices**: Separate table for multiple office locations
2. **Social Links**: Store LinkedIn, Facebook, etc. links
3. **Company Benefits**: Manage and display employee benefits
4. **Media Gallery**: Proper table for gallery images and videos
5. **Audit Trail**: Track all company profile changes
6. **Bulk Operations**: Update multiple fields in transaction
7. **CDN Integration**: Upload files to cloud storage instead of local

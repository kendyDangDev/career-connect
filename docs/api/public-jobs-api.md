# Public Jobs API Documentation

## Overview
Các API công khai cho phép ứng viên và người dùng xem danh sách việc làm và chi tiết công việc mà không cần xác thực.

## Endpoints

### 1. GET /api/jobs
Lấy danh sách các công việc đang tuyển dụng (status = ACTIVE).

**Method:** GET  
**Authentication:** Không yêu cầu  
**URL:** `/api/jobs`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Số trang (default: 1) |
| limit | number | No | Số items mỗi trang (default: 10, max: 50) |
| search | string | No | Tìm kiếm theo tiêu đề job hoặc địa điểm |
| jobType | string | No | Loại công việc (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP) |
| experienceLevel | string | No | Cấp độ kinh nghiệm (ENTRY, MID, SENIOR, LEAD, EXECUTIVE) |
| locationCity | string | No | Thành phố |
| locationProvince | string | No | Tỉnh/thành |
| categoryId | string | No | ID danh mục công việc |
| companyId | string | No | ID công ty |
| sortBy | string | No | Sắp xếp theo (createdAt, publishedAt, viewCount, applicationCount) - default: publishedAt |
| sortOrder | string | No | Thứ tự sắp xếp (asc, desc) - default: desc |

#### Response
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": {
    "jobs": [
      {
        "id": "job-id",
        "title": "Senior Frontend Developer",
        "slug": "senior-frontend-developer-company-name",
        "jobType": "FULL_TIME",
        "workLocationType": "HYBRID",
        "experienceLevel": "SENIOR",
        "salaryMin": 25000000,
        "salaryMax": 40000000,
        "currency": "VND",
        "salaryNegotiable": false,
        "locationCity": "Ho Chi Minh City",
        "locationProvince": "Ho Chi Minh",
        "applicationDeadline": "2024-01-31T23:59:59.000Z",
        "status": "ACTIVE",
        "viewCount": 150,
        "applicationCount": 12,
        "featured": true,
        "urgent": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "publishedAt": "2024-01-02T08:00:00.000Z",
        "company": {
          "id": "company-id",
          "companyName": "Tech Company Ltd",
          "companySlug": "tech-company-ltd",
          "logoUrl": "https://example.com/logo.png",
          "verificationStatus": "VERIFIED"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### Examples
```bash
# Lấy danh sách jobs cơ bản
GET /api/jobs

# Tìm kiếm jobs frontend với phân trang
GET /api/jobs?search=frontend&page=1&limit=20

# Lọc jobs theo loại và kinh nghiệm
GET /api/jobs?jobType=FULL_TIME&experienceLevel=SENIOR

# Lọc theo địa điểm
GET /api/jobs?locationCity=Ho%20Chi%20Minh%20City&locationProvince=Ho%20Chi%20Minh

# Sắp xếp theo lượt xem
GET /api/jobs?sortBy=viewCount&sortOrder=desc
```

### 2. GET /api/jobs/[id]
Lấy thông tin chi tiết của một công việc cụ thể.

**Method:** GET  
**Authentication:** Không yêu cầu  
**URL:** `/api/jobs/{id_or_slug}`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Job ID hoặc slug |

#### Response
```json
{
  "success": true,
  "message": "Job details retrieved successfully",
  "data": {
    "id": "job-id",
    "title": "Senior Frontend Developer",
    "slug": "senior-frontend-developer-company-name",
    "description": "Job description content...",
    "requirements": "Job requirements content...",
    "benefits": "Job benefits content...",
    "jobType": "FULL_TIME",
    "workLocationType": "HYBRID",
    "experienceLevel": "SENIOR",
    "salaryMin": 25000000,
    "salaryMax": 40000000,
    "currency": "VND",
    "salaryNegotiable": false,
    "locationCity": "Ho Chi Minh City",
    "locationProvince": "Ho Chi Minh",
    "applicationDeadline": "2024-01-31T23:59:59.000Z",
    "status": "ACTIVE",
    "viewCount": 151,
    "applicationCount": 12,
    "featured": true,
    "urgent": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "publishedAt": "2024-01-02T08:00:00.000Z",
    "company": {
      "id": "company-id",
      "companyName": "Tech Company Ltd",
      "companySlug": "tech-company-ltd",
      "logoUrl": "https://example.com/logo.png",
      "verificationStatus": "VERIFIED",
      "website": "https://techcompany.com",
      "city": "Ho Chi Minh City",
      "province": "Ho Chi Minh"
    },
    "jobSkills": [
      {
        "id": "job-skill-id",
        "requiredLevel": "REQUIRED",
        "minYearsExperience": 3,
        "skill": {
          "id": "skill-id",
          "name": "React",
          "category": "Frontend"
        }
      }
    ],
    "jobCategories": [
      {
        "id": "job-category-id",
        "category": {
          "id": "category-id",
          "name": "Technology",
          "slug": "technology"
        }
      }
    ],
    "_count": {
      "applications": 12,
      "savedJobs": 8,
      "jobViews": 151
    }
  }
}
```

#### Examples
```bash
# Lấy job bằng ID
GET /api/jobs/123e4567-e89b-12d3-a456-426614174000

# Lấy job bằng slug
GET /api/jobs/senior-frontend-developer-company-name
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message",
  "message": "Thông báo lỗi bằng tiếng Việt"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Job not found",
  "message": "Không tìm thấy công việc hoặc công việc đã ngừng tuyển dụng"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch jobs",
  "message": "Đã xảy ra lỗi khi tải danh sách công việc"
}
```

## Features

### ✅ Implemented Features
- **Public Access**: Không yêu cầu authentication
- **Job Listing**: Danh sách jobs với pagination và filtering
- **Job Details**: Chi tiết đầy đủ về job
- **Search & Filter**: Tìm kiếm và lọc theo nhiều tiêu chí
- **Company Information**: Thông tin công ty đi kèm
- **Skills & Categories**: Thông tin skills và categories yêu cầu
- **View Counter**: Tự động tăng view count khi xem chi tiết
- **Slug Support**: Hỗ trợ cả ID và slug cho job details

### 🔒 Security Notes
- Chỉ hiển thị jobs có status = ACTIVE
- Không hiển thị thông tin nhạy cảm của công ty
- Rate limiting thông qua middleware
- Pagination limit tối đa 50 items

### 📱 Usage in Frontend
```javascript
// Fetch jobs list
const response = await fetch('/api/jobs?page=1&limit=10&search=frontend');
const { data } = await response.json();

// Fetch job details
const jobResponse = await fetch('/api/jobs/job-slug-or-id');
const { data: job } = await jobResponse.json();
```

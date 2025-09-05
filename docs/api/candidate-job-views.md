# API Documentation: Job View Management

## Overview
Các API endpoint để quản lý lịch sử xem việc làm của ứng viên. Hệ thống cho phép:
- Ghi nhận lượt xem việc làm (cả user đã đăng nhập và anonymous)
- Xem lịch sử các việc làm đã xem
- Thống kê lượt xem theo thời gian
- Kiểm tra xem user đã xem một job cụ thể chưa

## Base URL
```
https://career-connect.vn/api
```

## Authentication
- Các API lấy danh sách và thống kê yêu cầu authentication với role CANDIDATE
- API ghi nhận lượt xem không bắt buộc authentication (hỗ trợ anonymous views)

---

## 1. Ghi nhận lượt xem việc làm

### Endpoint
```
POST /jobs/{id}/view
```

### Description
Ghi nhận khi user xem chi tiết một công việc. API này sẽ:
- Tạo record trong bảng job_views
- Tăng view_count của job lên 1
- Lưu thông tin IP và User Agent

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | ID của job cần ghi nhận view |

### Headers
```
Content-Type: application/json
Authorization: Bearer {token} (optional)
```

### Response
**Success (200 OK):**
```json
{
  "success": true,
  "message": "Đã ghi nhận lượt xem việc làm",
  "data": {
    "id": "clxyz123",
    "viewedAt": "2024-01-05T10:30:00Z"
  }
}
```

**Job Not Found (404):**
```json
{
  "error": "Not Found",
  "message": "Công việc không tồn tại hoặc đã ngừng tuyển dụng"
}
```

### Example Request
```bash
curl -X POST https://career-connect.vn/api/jobs/clxyz123/view \
  -H "Authorization: Bearer {token}"
```

---

## 2. Kiểm tra user đã xem job chưa

### Endpoint
```
GET /jobs/{id}/view
```

### Description
Kiểm tra xem user hiện tại đã xem job này chưa

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | ID của job cần kiểm tra |

### Response
**Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "hasViewed": true,
    "userId": "user123",
    "jobId": "job456"
  }
}
```

**Not Authenticated:**
```json
{
  "success": true,
  "data": {
    "hasViewed": false,
    "message": "User not authenticated"
  }
}
```

---

## 3. Lấy danh sách việc làm đã xem

### Endpoint
```
GET /candidate/job-views
```

### Description
Lấy danh sách các việc làm mà ứng viên đã xem, có phân trang và filter

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Số trang (bắt đầu từ 1) |
| limit | number | 10 | Số lượng items mỗi trang (max: 50) |
| sortBy | string | viewedAt | Sắp xếp theo: viewedAt, jobTitle |
| sortOrder | string | desc | Thứ tự sắp xếp: asc, desc |
| startDate | string | null | Lọc từ ngày (format: YYYY-MM-DD) |
| endDate | string | null | Lọc đến ngày (format: YYYY-MM-DD) |

### Response
**Success (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "view123",
      "jobId": "job456",
      "userId": "user789",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "viewedAt": "2024-01-05T10:30:00Z",
      "job": {
        "id": "job456",
        "title": "Senior Backend Developer",
        "slug": "senior-backend-developer",
        "company": {
          "id": "company123",
          "companyName": "Tech Corp",
          "logoUrl": "https://..."
        },
        "locationCity": "Hà Nội",
        "locationProvince": "Hà Nội",
        "jobType": "FULL_TIME",
        "salaryMin": 20000000,
        "salaryMax": 35000000,
        "currency": "VND",
        "status": "ACTIVE"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**Unauthorized (401):**
```json
{
  "error": "Unauthorized",
  "message": "Bạn cần đăng nhập để xem lịch sử xem việc làm"
}
```

**Forbidden (403):**
```json
{
  "error": "Forbidden",
  "message": "Chỉ ứng viên mới có thể xem lịch sử xem việc làm"
}
```

### Example Request
```bash
curl -X GET "https://career-connect.vn/api/candidate/job-views?page=1&limit=20&sortBy=viewedAt&sortOrder=desc" \
  -H "Authorization: Bearer {token}"
```

---

## 4. Lấy thống kê lượt xem

### Endpoint
```
GET /candidate/job-views/stats
```

### Description
Lấy thống kê tổng quan về lượt xem việc làm của ứng viên

### Response
**Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalViews": 125,
    "uniqueJobs": 45,
    "viewsByDate": [
      {
        "date": "2024-01-05",
        "count": 12
      },
      {
        "date": "2024-01-04",
        "count": 8
      }
    ],
    "topViewedJobs": [
      {
        "jobId": "job123",
        "jobTitle": "Senior Backend Developer",
        "companyName": "Tech Corp",
        "viewCount": 5
      }
    ],
    "recentViews": [
      {
        "id": "view789",
        "jobId": "job456",
        "viewedAt": "2024-01-05T15:30:00Z",
        "job": {
          "title": "Frontend Developer",
          "company": {
            "companyName": "Startup XYZ"
          }
        }
      }
    ]
  }
}
```

### Example Request
```bash
curl -X GET https://career-connect.vn/api/candidate/job-views/stats \
  -H "Authorization: Bearer {token}"
```

---

## Error Responses

### Common Error Codes
| Code | Description |
|------|-------------|
| 401 | Unauthorized - Yêu cầu đăng nhập |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy resource |
| 500 | Internal Server Error - Lỗi hệ thống |

### Error Response Format
```json
{
  "error": "Error Type",
  "message": "Mô tả chi tiết lỗi bằng tiếng Việt"
}
```

---

## Data Models

### JobView
```typescript
interface JobView {
  id: string;
  jobId: string;
  userId: string | null;
  ipAddress: string;
  userAgent: string;
  viewedAt: Date;
  job?: {
    id: string;
    title: string;
    slug: string;
    company: {
      id: string;
      companyName: string;
      logoUrl: string | null;
    };
    locationCity: string | null;
    locationProvince: string | null;
    jobType: string;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    status: string;
  };
}
```

### JobViewStats
```typescript
interface JobViewStats {
  totalViews: number;
  uniqueJobs: number;
  viewsByDate: {
    date: string;
    count: number;
  }[];
  topViewedJobs: {
    jobId: string;
    jobTitle: string;
    companyName: string;
    viewCount: number;
  }[];
  recentViews: JobView[];
}
```

---

## Implementation Notes

### Performance Considerations
1. **Indexing**: Đảm bảo có indexes trên các trường:
   - job_views.user_id
   - job_views.job_id
   - job_views.viewed_at

2. **Caching**: Consider caching thống kê trong 5-10 phút

3. **Rate Limiting**: 
   - POST /jobs/{id}/view: 100 requests/minute per IP
   - GET endpoints: 1000 requests/hour per user

### Security
1. **IP Tracking**: Lưu IP address cho mục đích phân tích, không expose ra client
2. **User Agent**: Sanitize user agent string trước khi lưu
3. **Anonymous Views**: Cho phép xem anonymous nhưng không lưu thông tin cá nhân

### Database Schema
```sql
-- job_views table
CREATE TABLE job_views (
  id VARCHAR(25) PRIMARY KEY,
  job_id VARCHAR(25) NOT NULL REFERENCES jobs(id),
  user_id VARCHAR(25) REFERENCES users(id),
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_job_views_user (user_id),
  INDEX idx_job_views_job (job_id),
  INDEX idx_job_views_date (viewed_at)
);
```

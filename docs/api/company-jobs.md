# Company Jobs API Documentation

## Overview
API endpoints để quản lý và lấy danh sách các công việc (jobs) của một công ty cụ thể trong hệ thống Career Connect.

## Base URL
```
https://your-domain.com/api
```

## Authentication
Các API này là public endpoints, không yêu cầu authentication. Tuy nhiên, một số thông tin chi tiết có thể bị giới hạn cho người dùng chưa đăng nhập.

---

## Endpoints

### 1. Get Company Jobs
Lấy danh sách tất cả các công việc đang tuyển dụng của một công ty.

#### Endpoint
```
GET /api/companies/{slug}/jobs
```

#### Parameters

##### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| slug | string | Yes | Company slug hoặc ID |

##### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Số trang (phân trang) |
| limit | integer | 10 | Số lượng items mỗi trang (tối đa 50) |
| search | string | - | Tìm kiếm theo tiêu đề công việc |
| jobType | string | - | Lọc theo loại công việc: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP` |
| experienceLevel | string | - | Lọc theo cấp độ kinh nghiệm: `ENTRY`, `MID`, `SENIOR`, `LEAD`, `EXECUTIVE` |
| workLocationType | string | - | Lọc theo hình thức làm việc: `ONSITE`, `REMOTE`, `HYBRID` |
| sortBy | string | publishedAt | Sắp xếp theo: `createdAt`, `publishedAt`, `salaryMin`, `salaryMax`, `applicationDeadline` |
| sortOrder | string | desc | Thứ tự sắp xếp: `asc`, `desc` |
| includeExpired | boolean | false | Bao gồm cả các công việc đã hết hạn |

#### Response

##### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Company jobs retrieved successfully",
  "data": {
    "company": {
      "id": "company_id",
      "companyName": "Tech Company",
      "companySlug": "tech-company",
      "logoUrl": "https://example.com/logo.png",
      "coverImageUrl": "https://example.com/cover.jpg",
      "description": "Company description",
      "websiteUrl": "https://company.com",
      "address": "123 Street",
      "city": "Hanoi",
      "province": "Hanoi",
      "country": "Vietnam",
      "companySize": "MEDIUM_51_200",
      "foundedYear": 2010,
      "verificationStatus": "VERIFIED",
      "industry": {
        "id": "industry_id",
        "name": "Information Technology",
        "slug": "it"
      },
      "stats": {
        "totalJobs": 50,
        "activeJobs": 25,
        "totalFollowers": 100
      }
    },
    "jobs": [
      {
        "id": "job_id",
        "title": "Senior Backend Developer",
        "slug": "senior-backend-developer",
        "jobType": "FULL_TIME",
        "workLocationType": "HYBRID",
        "experienceLevel": "SENIOR",
        "salaryMin": "30000000",
        "salaryMax": "50000000",
        "currency": "VND",
        "salaryNegotiable": true,
        "locationCity": "Hanoi",
        "locationProvince": "Hanoi",
        "locationCountry": "Vietnam",
        "applicationDeadline": "2024-12-31T23:59:59Z",
        "status": "ACTIVE",
        "viewCount": 150,
        "applicationCount": 25,
        "featured": true,
        "urgent": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T00:00:00Z",
        "publishedAt": "2024-01-02T00:00:00Z",
        "jobSkills": [
          {
            "requiredLevel": "REQUIRED",
            "minYearsExperience": 3,
            "skill": {
              "id": "skill_id",
              "name": "Node.js",
              "slug": "nodejs",
              "category": "TECHNICAL"
            }
          }
        ],
        "jobCategories": [
          {
            "category": {
              "id": "category_id",
              "name": "Software Development",
              "slug": "software-development"
            }
          }
        ],
        "_count": {
          "applications": 25,
          "savedJobs": 10
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "jobStats": {
      "active": 25,
      "paused": 5,
      "closed": 10,
      "expired": 8,
      "draft": 2,
      "total": 50
    }
  }
}
```

##### Error Responses

**404 Not Found - Company not found**
```json
{
  "success": false,
  "error": "Company not found",
  "message": "Không tìm thấy công ty"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to fetch company jobs",
  "message": "Đã xảy ra lỗi khi tải danh sách công việc của công ty"
}
```

---

### 2. Get Company Job Statistics
Lấy thống kê chi tiết về các công việc của công ty.

#### Endpoint
```
GET /api/companies/{slug}/jobs/stats
```

#### Parameters

##### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| slug | string | Yes | Company slug hoặc ID |

#### Response

##### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Company job statistics retrieved successfully",
  "data": {
    "company": {
      "id": "company_id",
      "name": "Tech Company",
      "slug": "tech-company"
    },
    "stats": {
      "totalJobs": 50,
      "activeJobs": 25,
      "totalApplications": 500,
      "totalViews": 5000,
      "jobsByType": [
        {
          "type": "FULL_TIME",
          "count": 20
        },
        {
          "type": "PART_TIME",
          "count": 3
        },
        {
          "type": "INTERNSHIP",
          "count": 2
        }
      ],
      "topLocations": [
        {
          "city": "Hanoi",
          "count": 15
        },
        {
          "city": "Ho Chi Minh",
          "count": 10
        }
      ],
      "recentJobs": [
        {
          "id": "job_id",
          "title": "Senior Backend Developer",
          "slug": "senior-backend-developer",
          "createdAt": "2024-01-15T00:00:00Z",
          "applicationCount": 25
        }
      ],
      "averageApplicationsPerJob": 20,
      "averageViewsPerJob": 200
    }
  }
}
```

##### Error Responses

**404 Not Found - Company not found**
```json
{
  "success": false,
  "error": "Company not found",
  "message": "Không tìm thấy công ty"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to fetch company job statistics",
  "message": "Đã xảy ra lỗi khi tải thống kê công việc của công ty"
}
```

---

## Database Schema

### Relevant Tables

#### Company Table
```prisma
model Company {
  id                 String            @id @default(cuid())
  companyName        String
  companySlug        String            @unique
  industryId         String?
  companySize        CompanySize?
  websiteUrl         String?
  description        String?
  logoUrl            String?
  coverImageUrl      String?
  address            String?
  city               String?
  province           String?
  country            String?
  verificationStatus VerificationStatus @default(PENDING)
  
  // Relations
  jobs             Job[]
  companyFollowers CompanyFollower[]
}
```

#### Job Table
```prisma
model Job {
  id                   String           @id @default(cuid())
  companyId            String
  title                String
  slug                 String           @unique
  description          String
  requirements         String
  benefits             String?
  jobType              JobType
  workLocationType     WorkLocationType
  experienceLevel      ExperienceLevel
  salaryMin            Decimal?
  salaryMax            Decimal?
  currency             String?
  salaryNegotiable     Boolean
  locationCity         String?
  locationProvince     String?
  locationCountry      String?
  applicationDeadline  DateTime?
  status               JobStatus
  viewCount            Int
  applicationCount     Int
  featured             Boolean
  urgent               Boolean
  publishedAt          DateTime?
  
  // Relations
  company       Company       @relation(fields: [companyId], references: [id])
  jobSkills     JobSkill[]
  jobCategories JobCategory[]
  applications  Application[]
  savedJobs     SavedJob[]
  jobViews      JobView[]
}
```

#### JobSkill Table
```prisma
model JobSkill {
  id                  String        @id @default(cuid())
  jobId               String
  skillId             String
  requiredLevel       RequiredLevel
  minYearsExperience  Int?
  
  job   Job   @relation(fields: [jobId], references: [id])
  skill Skill @relation(fields: [skillId], references: [id])
}
```

---

## Enums

### JobType
- `FULL_TIME` - Toàn thời gian
- `PART_TIME` - Bán thời gian
- `CONTRACT` - Hợp đồng
- `INTERNSHIP` - Thực tập

### WorkLocationType
- `ONSITE` - Làm việc tại văn phòng
- `REMOTE` - Làm việc từ xa
- `HYBRID` - Kết hợp

### ExperienceLevel
- `ENTRY` - Mới vào nghề
- `MID` - Trung cấp
- `SENIOR` - Cao cấp
- `LEAD` - Trưởng nhóm
- `EXECUTIVE` - Quản lý cấp cao

### JobStatus
- `DRAFT` - Nháp
- `ACTIVE` - Đang tuyển
- `PAUSED` - Tạm dừng
- `CLOSED` - Đã đóng
- `EXPIRED` - Hết hạn

### RequiredLevel
- `NICE_TO_HAVE` - Ưu tiên có
- `PREFERRED` - Ưu tiên
- `REQUIRED` - Bắt buộc

### CompanySize
- `STARTUP_1_10` - 1-10 nhân viên
- `SMALL_11_50` - 11-50 nhân viên
- `MEDIUM_51_200` - 51-200 nhân viên
- `LARGE_201_500` - 201-500 nhân viên
- `ENTERPRISE_500_PLUS` - Trên 500 nhân viên

### VerificationStatus
- `PENDING` - Đang chờ xác thực
- `VERIFIED` - Đã xác thực
- `REJECTED` - Bị từ chối

---

## Example Usage

### JavaScript/TypeScript

```typescript
// Get all active jobs of a company
async function getCompanyJobs(companySlug: string) {
  const response = await fetch(
    `https://your-domain.com/api/companies/${companySlug}/jobs?page=1&limit=10`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch company jobs');
  }
  
  const data = await response.json();
  return data.data;
}

// Get company job statistics
async function getCompanyJobStats(companySlug: string) {
  const response = await fetch(
    `https://your-domain.com/api/companies/${companySlug}/jobs/stats`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch company job statistics');
  }
  
  const data = await response.json();
  return data.data;
}

// Example with filters
async function getFilteredCompanyJobs(companySlug: string) {
  const params = new URLSearchParams({
    page: '1',
    limit: '20',
    jobType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    workLocationType: 'HYBRID',
    sortBy: 'salaryMax',
    sortOrder: 'desc'
  });

  const response = await fetch(
    `https://your-domain.com/api/companies/${companySlug}/jobs?${params}`
  );
  
  const data = await response.json();
  return data.data;
}
```

### cURL

```bash
# Get company jobs
curl -X GET "https://your-domain.com/api/companies/tech-company/jobs?page=1&limit=10" \
  -H "Accept: application/json"

# Get company job statistics
curl -X GET "https://your-domain.com/api/companies/tech-company/jobs/stats" \
  -H "Accept: application/json"

# Get filtered jobs
curl -X GET "https://your-domain.com/api/companies/tech-company/jobs?jobType=FULL_TIME&experienceLevel=SENIOR" \
  -H "Accept: application/json"
```

---

## Notes

1. **Performance**: API sử dụng pagination để tối ưu hiệu suất. Khuyến nghị sử dụng limit 10-20 items mỗi trang.

2. **Caching**: Response có thể được cache trong 5 phút cho các request giống nhau.

3. **Rate Limiting**: API có giới hạn 100 requests/phút cho mỗi IP.

4. **CORS**: API hỗ trợ CORS cho tất cả origins. Nếu cần bảo mật hơn, có thể cấu hình whitelist domains.

5. **Job Status**: Mặc định chỉ trả về các job có status = `ACTIVE`. Sử dụng parameter `includeExpired=true` để bao gồm cả job đã hết hạn.

6. **Company Identification**: API hỗ trợ cả company ID và slug để định danh công ty, giúp linh hoạt trong việc tích hợp.

---

## Changelog

### Version 1.0.0 (2025-01-18)
- Initial release
- Implement GET /api/companies/{slug}/jobs endpoint
- Implement GET /api/companies/{slug}/jobs/stats endpoint
- Support filtering, sorting and pagination
- Add job statistics aggregation
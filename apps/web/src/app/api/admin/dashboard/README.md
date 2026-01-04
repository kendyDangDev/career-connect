# Admin Dashboard & Analytics API

API endpoints cho trang Dashboard và Analytics của Admin, cung cấp thống kê toàn diện về tình trạng tuyển dụng và hiệu quả hệ thống.

## Authentication & Authorization

Tất cả endpoints yêu cầu:
- **Authentication**: NextAuth session hoặc JWT Bearer token
- **Authorization**: ADMIN role (RBAC)

```typescript
// Request headers
Authorization: Bearer <token>
// hoặc NextAuth session cookie
```

---

## Endpoints

### 1. GET `/api/admin/dashboard/overview`

Lấy tổng quan dashboard với thống kê toàn hệ thống.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `includeTopPerformers` | boolean | true | Bao gồm top performers (companies, jobs, categories, locations) |
| `topLimit` | number | 5 | Số lượng top performers trả về (1-20) |

#### Response

```typescript
{
  success: true,
  data: {
    systemStats: {
      totalUsers: number,
      totalCompanies: number,
      totalJobs: number,
      totalApplications: number,
      activeUsers: number,
      verifiedCompanies: number,
      activeJobs: number,
      trends: {
        users: { value: "+15%", isPositive: true, count: 120 },
        companies: { value: "+8%", isPositive: true, count: 45 },
        jobs: { value: "-3%", isPositive: false, count: -12 },
        applications: { value: "+22%", isPositive: true, count: 340 }
      }
    },
    recruitmentMetrics: {
      totalApplications: number,
      totalHired: number,
      hireRate: number,        // percentage
      averageTimeToHire: number,  // days
      conversionRate: number,     // percentage
      totalJobViews: number
    },
    userBreakdown: {
      candidates: number,
      employers: number,
      admins: number
    },
    jobStatusBreakdown: {
      active: number,
      pending: number,
      closed: number,
      expired: number,
      draft: number
    },
    applicationPipeline: {
      applied: number,
      screening: number,
      interviewing: number,
      offered: number,
      hired: number,
      rejected: number
    },
    topPerformers: {
      companies: TopCompany[],
      jobs: TopJob[],
      categories: TopCategory[],
      locations: TopLocation[]
    }
  },
  timestamp: "2025-10-21T03:00:00.000Z"
}
```

#### Example Request

```bash
GET /api/admin/dashboard/overview?includeTopPerformers=true&topLimit=10
```

---

### 2. GET `/api/admin/dashboard/analytics`

Lấy analytics chi tiết với time series data và insights sâu hơn.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `timeRange` | TimeRange | '30days' | '7days' \| '30days' \| '90days' \| '6months' \| 'year' \| 'custom' \| 'all' |
| `dateFrom` | ISO string | - | Ngày bắt đầu (cho custom range) |
| `dateTo` | ISO string | - | Ngày kết thúc (cho custom range) |
| `includeTimeSeries` | boolean | true | Bao gồm time series data |
| `groupBy` | string | auto | 'day' \| 'week' \| 'month' (tự động nếu không cung cấp) |

#### Response

```typescript
{
  success: true,
  data: {
    timeRange: "30days",
    dateRange: {
      from: "2025-09-21T00:00:00.000Z",
      to: "2025-10-21T23:59:59.999Z"
    },
    timeSeries: {
      daily: DailyMetrics[],      // nếu groupBy = 'day'
      weekly: WeeklyMetrics[],    // nếu groupBy = 'week'
      monthly: MonthlyMetrics[]   // nếu groupBy = 'month'
    },
    conversionFunnel: {
      jobViews: number,
      applications: number,
      screening: number,
      interviewing: number,
      offered: number,
      hired: number,
      rejected: number
    },
    growthMetrics: {
      userGrowth: {
        current: 1500,
        previous: 1200,
        growthRate: 25.0,
        growthCount: 300,
        isPositive: true
      },
      companyGrowth: { ... },
      jobGrowth: { ... },
      applicationGrowth: { ... }
    },
    topSkills: [
      {
        skillId: string,
        skillName: string,
        count: number,
        percentage: number,
        averageSalary: number,
        category: string
      }
    ],
    industryDistribution: IndustryStats[],
    locationDistribution: LocationStats[],
    salaryInsights: {
      averageSalary: number,
      medianSalary: number,
      salaryRanges: [
        {
          range: "10-20M",
          min: 10000000,
          max: 20000000,
          count: 150,
          percentage: 30.5
        }
      ]
    },
    performanceMetrics: {
      averageApplicationsPerJob: number,
      averageViewsPerJob: number,
      averageTimeToFirstApplication: number,  // hours
      averageResponseTime: number,            // hours
      jobFillRate: number                     // percentage
    }
  },
  timestamp: "2025-10-21T03:00:00.000Z"
}
```

#### Example Requests

```bash
# Last 30 days (default)
GET /api/admin/dashboard/analytics

# Last 7 days với daily grouping
GET /api/admin/dashboard/analytics?timeRange=7days&groupBy=day

# Custom range
GET /api/admin/dashboard/analytics?timeRange=custom&dateFrom=2025-09-01&dateTo=2025-09-30

# Last 6 months với monthly grouping (auto)
GET /api/admin/dashboard/analytics?timeRange=6months

# Không include time series (faster)
GET /api/admin/dashboard/analytics?includeTimeSeries=false
```

---

### 3. GET `/api/admin/dashboard/activities`

Lấy recent activities trong hệ thống từ audit logs.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Trang hiện tại |
| `limit` | number | 50 | Số items mỗi trang (max 100) |
| `type` | ActivityType \| ActivityType[] | - | Filter theo loại activity (comma-separated) |
| `dateFrom` | ISO string | - | Lọc từ ngày |
| `dateTo` | ISO string | - | Lọc đến ngày |
| `userId` | string | - | Lọc theo user ID cụ thể |
| `search` | string | - | Tìm kiếm trong action/tableName |

#### Activity Types

```typescript
type ActivityType =
  | 'USER_REGISTRATION'
  | 'USER_LOGIN'
  | 'USER_UPDATE'
  | 'COMPANY_REGISTRATION'
  | 'COMPANY_VERIFICATION'
  | 'COMPANY_UPDATE'
  | 'JOB_CREATION'
  | 'JOB_UPDATE'
  | 'JOB_STATUS_CHANGE'
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_STATUS_CHANGE'
  | 'ADMIN_ACTION'
  | 'SYSTEM_EVENT';
```

#### Response

```typescript
{
  success: true,
  data: {
    recentActivities: [
      {
        id: string,
        type: ActivityType,
        action: string,
        description: string,
        userId: string,
        userName: string,
        userType: string,
        targetId: string,
        targetType: string,
        metadata: {
          newValues: object,
          oldValues: object
        },
        timestamp: string,
        ipAddress: string
      }
    ],
    pagination: {
      page: 1,
      limit: 50,
      total: 1234,
      totalPages: 25
    },
    filters: {
      type: ['JOB_CREATION', 'USER_REGISTRATION'],
      dateFrom: "2025-10-01T00:00:00.000Z",
      dateTo: "2025-10-21T23:59:59.999Z"
    }
  },
  timestamp: "2025-10-21T03:00:00.000Z"
}
```

#### Example Requests

```bash
# Recent 50 activities
GET /api/admin/dashboard/activities

# Page 2 với 100 items
GET /api/admin/dashboard/activities?page=2&limit=100

# Filter by multiple activity types
GET /api/admin/dashboard/activities?type=JOB_CREATION,USER_REGISTRATION,COMPANY_VERIFICATION

# Filter by date range
GET /api/admin/dashboard/activities?dateFrom=2025-10-01&dateTo=2025-10-21

# Filter by specific user
GET /api/admin/dashboard/activities?userId=clx123456

# Search
GET /api/admin/dashboard/activities?search=job

# Combined filters
GET /api/admin/dashboard/activities?type=JOB_CREATION&dateFrom=2025-10-01&page=1&limit=20
```

---

## Data Types

### TopCompany

```typescript
interface TopCompany {
  id: string;
  name: string;
  logoUrl?: string;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  hireRate: number;
  verificationStatus: string;
}
```

### TopJob

```typescript
interface TopJob {
  id: string;
  title: string;
  companyName: string;
  companyId: string;
  applications: number;
  views: number;
  conversionRate: number;
  status: string;
  createdAt: string;
}
```

### DailyMetrics

```typescript
interface DailyMetrics {
  date: string;        // "2025-10-21"
  users: number;
  companies: number;
  jobs: number;
  applications: number;
  jobViews: number;
}
```

### MonthlyMetrics

```typescript
interface MonthlyMetrics {
  month: string;       // "Tháng 10 2025"
  year: number;
  monthNumber: number;
  users: number;
  companies: number;
  jobs: number;
  applications: number;
  jobViews: number;
  hired: number;
}
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized - Please login to continue"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden - You do not have permission to access this resource"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to fetch dashboard data",
  "message": "Đã xảy ra lỗi khi tải dữ liệu",
  "details": "Error details here"
}
```

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Using fetch
const getOverview = async () => {
  const response = await fetch('/api/admin/dashboard/overview', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

// Using axios
import axios from 'axios';

const getAnalytics = async (timeRange: string) => {
  const { data } = await axios.get('/api/admin/dashboard/analytics', {
    params: { timeRange, includeTimeSeries: true },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// Get activities with filters
const getActivities = async (filters: {
  page?: number;
  type?: string[];
  dateFrom?: string;
}) => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.type) params.append('type', filters.type.join(','));
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);

  const response = await fetch(
    `/api/admin/dashboard/activities?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.json();
};
```

---

## Performance Considerations

### Caching

- **Overview**: Cache 5 phút (dữ liệu tổng quan ít thay đổi)
- **Analytics**: Cache 15 phút theo timeRange
- **Activities**: Không cache (real-time data)

### Optimization Tips

1. **Overview endpoint**: Set `includeTopPerformers=false` nếu không cần
2. **Analytics endpoint**: Set `includeTimeSeries=false` khi chỉ cần metrics
3. **Activities endpoint**: Sử dụng pagination hợp lý (không request quá nhiều items)
4. **Date ranges**: Tránh query range quá lớn (> 1 năm) khi không cần thiết

### Rate Limiting

- **Limit**: 100 requests/minute per user
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Security

- ✅ NextAuth authentication
- ✅ RBAC với ADMIN role check
- ✅ Audit logging cho tất cả actions
- ✅ Input validation và sanitization
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection
- ✅ Rate limiting

---

## Notes

- Tất cả timestamps theo ISO 8601 format (UTC)
- Currency mặc định: VND
- Locale: vi-VN
- Time trends: So sánh với period trước đó (same duration)
- Percentages: Làm tròn 1-2 chữ số thập phân

---

## Support

Liên hệ development team nếu cần hỗ trợ hoặc có câu hỏi về API.

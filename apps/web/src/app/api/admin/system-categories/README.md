# System Categories API Documentation

## Overview
API endpoints để quản lý các danh mục hệ thống bao gồm: Ngành nghề (Industries), Danh mục công việc (Categories), Kỹ năng (Skills), và Địa điểm (Locations).

## Authentication
Tất cả các endpoint yêu cầu xác thực Admin thông qua NextAuth session.

## Base URL
```
/api/admin/system-categories
```

## Industries API

### GET /industries
Lấy danh sách ngành nghề với phân trang.

**Query Parameters:**
- `page` (number): Trang hiện tại (mặc định: 1)
- `limit` (number): Số lượng mỗi trang (mặc định: 10, max: 100)
- `search` (string): Tìm kiếm theo tên hoặc mô tả
- `isActive` (boolean): Lọc theo trạng thái
- `sortBy` (string): Sắp xếp theo field (name, createdAt, sortOrder)
- `sortOrder` (string): Thứ tự sắp xếp (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "slug": "string",
      "description": "string",
      "iconUrl": "string",
      "isActive": true,
      "sortOrder": 0,
      "createdAt": "date",
      "_count": {
        "companies": 0
      }
    }
  ],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### GET /industries/{id}
Lấy thông tin chi tiết ngành nghề.

### POST /industries
Tạo ngành nghề mới.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string",
  "iconUrl": "string",
  "sortOrder": 0
}
```

### PUT /industries/{id}
Cập nhật ngành nghề.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "iconUrl": "string",
  "sortOrder": 0,
  "isActive": true
}
```

### DELETE /industries/{id}
Xóa ngành nghề (chỉ khi không có công ty nào sử dụng).

### POST /industries/bulk/update-status
Cập nhật trạng thái hàng loạt.

**Request Body:**
```json
{
  "ids": ["id1", "id2"],
  "isActive": true
}
```

### DELETE /industries/bulk
Xóa hàng loạt.

**Request Body:**
```json
{
  "ids": ["id1", "id2"]
}
```

## Categories API

### GET /categories
Lấy danh sách danh mục với hỗ trợ phân cấp.

**Query Parameters:**
- Tương tự Industries API
- `parentId` (string): Lọc theo danh mục cha (dùng "null" cho root)
- `includeChildren` (boolean): Bao gồm cây danh mục con

### GET /categories/{id}
Lấy thông tin chi tiết danh mục kèm danh sách con.

### POST /categories
Tạo danh mục mới.

**Request Body:**
```json
{
  "name": "string (required)",
  "parentId": "string",
  "description": "string",
  "iconUrl": "string",
  "sortOrder": 0
}
```

**Validation Rules:**
- Danh mục con không thể vượt quá 3 cấp
- Tên phải unique trong cùng cấp

### PUT /categories/{id}
Cập nhật danh mục.

**Validation Rules:**
- Không thể đặt danh mục con làm cha
- Không thể tạo vòng lặp reference

### DELETE /categories/{id}
Xóa danh mục (chỉ khi không có danh mục con hoặc job nào sử dụng).

## Skills API

### GET /skills
Lấy danh sách kỹ năng.

**Query Parameters:**
- Tương tự Industries API
- `category` (enum): Lọc theo loại (TECHNICAL, SOFT, LANGUAGE, TOOL)

**Response bao gồm thống kê theo category:**
```json
{
  "meta": {
    "categoryStats": {
      "TECHNICAL": 150,
      "SOFT": 50,
      "LANGUAGE": 30,
      "TOOL": 70
    }
  }
}
```

### POST /skills
Tạo kỹ năng mới.

**Request Body:**
```json
{
  "name": "string (required)",
  "category": "TECHNICAL|SOFT|LANGUAGE|TOOL (required)",
  "description": "string",
  "iconUrl": "string"
}
```

### POST /skills/import
Import kỹ năng từ file CSV hoặc JSON.

**Form Data:**
- `file`: File CSV hoặc JSON

**CSV Format:**
```csv
name,category,description
JavaScript,TECHNICAL,JavaScript programming language
Communication,SOFT,Communication skills
```

### PUT /skills/{id}
Cập nhật kỹ năng.

### DELETE /skills/{id}
Xóa kỹ năng (chỉ khi không được sử dụng).

## Locations API

### GET /locations
Lấy danh sách địa điểm với hỗ trợ phân cấp.

**Query Parameters:**
- Tương tự Categories API
- `type` (enum): Lọc theo loại (COUNTRY, PROVINCE, CITY, DISTRICT)

**Response bao gồm thống kê theo type.**

### POST /locations
Tạo địa điểm mới.

**Request Body:**
```json
{
  "name": "string (required)",
  "type": "COUNTRY|PROVINCE|CITY|DISTRICT (required)",
  "parentId": "string",
  "latitude": 0,
  "longitude": 0
}
```

**Validation Rules:**
- COUNTRY: không cần parent
- PROVINCE: parent phải là COUNTRY
- CITY: parent phải là PROVINCE
- DISTRICT: parent phải là CITY

### GET /locations/popular
Lấy danh sách thành phố phổ biến.

### PUT /locations/{id}
Cập nhật địa điểm.

**Validation Rules:**
- Không thể thay đổi type nếu có địa điểm con không phù hợp
- Phải tuân thủ hierarchy rules

### DELETE /locations/{id}
Xóa địa điểm (chỉ khi không có địa điểm con).

## Error Responses

Tất cả các endpoint trả về format lỗi thống nhất:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Mô tả lỗi chi tiết"
}
```

**Common Error Codes:**
- `UNAUTHORIZED`: Chưa đăng nhập
- `FORBIDDEN`: Không có quyền admin
- `VALIDATION_ERROR`: Dữ liệu không hợp lệ
- `DUPLICATE_NAME`: Tên đã tồn tại
- `NOT_FOUND`: Không tìm thấy
- `IN_USE`: Đang được sử dụng, không thể xóa
- `RATE_LIMIT`: Gửi request quá nhiều
- `INVALID_PARENT`: Parent không hợp lệ
- `MAX_DEPTH_EXCEEDED`: Vượt quá độ sâu cho phép
- `CIRCULAR_REFERENCE`: Tạo vòng lặp reference

## Rate Limiting

- POST/PUT: 10 requests/phút
- DELETE: 5 requests/phút
- Import: 1 request/5 phút

## Audit Logging

Tất cả các thao tác CREATE, UPDATE, DELETE đều được ghi log với thông tin:
- User ID
- Action type
- Table name
- Record ID
- Old values (for update/delete)
- New values (for create/update)
- IP address
- User agent
- Timestamp

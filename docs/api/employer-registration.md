# API Employer Registration

## Tổng quan

Tài liệu này mô tả các API endpoints cho chức năng đăng ký và xác thực tài khoản nhà tuyển dụng.

## Endpoints

### 1. Đăng ký công ty

**POST** `/api/employer/auth/register`

Đăng ký tài khoản nhà tuyển dụng mới với thông tin công ty và tài liệu xác thực.

#### Request

- **Content-Type**: `multipart/form-data`

**Body Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| companyName | string | Yes | Tên công ty (3-255 ký tự) |
| taxCode | string | Yes | Mã số thuế (10 số hoặc 10-3 số) |
| industryId | string | No | ID ngành nghề |
| companySize | enum | No | Quy mô công ty |
| websiteUrl | string | No | Website công ty |
| description | string | No | Mô tả công ty (max 5000 ký tự) |
| address | string | Yes | Địa chỉ (10-255 ký tự) |
| city | string | Yes | Thành phố (2-100 ký tự) |
| province | string | Yes | Tỉnh/thành phố (2-100 ký tự) |
| companyPhone | string | Yes | SĐT công ty |
| companyEmail | string | Yes | Email công ty |
| foundedYear | number | No | Năm thành lập |
| firstName | string | Yes | Họ người đại diện |
| lastName | string | Yes | Tên người đại diện |
| position | string | Yes | Chức vụ |
| userEmail | string | Yes | Email người dùng |
| userPhone | string | Yes | SĐT người dùng |
| password | string | Yes | Mật khẩu |
| confirmPassword | string | Yes | Xác nhận mật khẩu |
| businessLicenseFile | file | Yes | File giấy phép kinh doanh |
| authorizationLetterFile | file | No | File ủy quyền (nếu có) |

**Company Size Values:**
- `STARTUP_1_10`: 1-10 nhân viên
- `SMALL_11_50`: 11-50 nhân viên  
- `MEDIUM_51_200`: 51-200 nhân viên
- `LARGE_201_500`: 201-500 nhân viên
- `ENTERPRISE_500_PLUS`: Trên 500 nhân viên

#### Response

**Success (200):**
```json
{
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
  "userId": "clxxxxxx",
  "companyId": "clxxxxxx",
  "requiresEmailVerification": true,
  "requiresPhoneVerification": true
}
```

**Error (400):**
```json
{
  "error": "Email này đã được sử dụng"
}
```

### 2. Xác thực Email

**POST** `/api/employer/auth/verify-email`

**GET** `/api/employer/auth/verify-email?token={token}`

Xác thực địa chỉ email bằng token được gửi qua email.

#### Request

**Body (POST):**
```json
{
  "token": "verification_token_string"
}
```

**Query Parameters (GET):**
- `token`: Token xác thực từ email

#### Response

**Success (200):**
```json
{
  "message": "Email đã được xác thực thành công",
  "emailVerified": true,
  "phoneVerified": false,
  "nextStep": "PHONE_VERIFICATION",
  "company": {
    "id": "clxxxxxx",
    "name": "Tên công ty",
    "verificationStatus": "PENDING"
  }
}
```

### 3. Xác thực Số điện thoại

**POST** `/api/employer/auth/verify-phone`

Xác thực số điện thoại bằng mã OTP.

#### Request

```json
{
  "phone": "+84912345678",
  "otp": "123456"
}
```

#### Response

**Success (200):**
```json
{
  "message": "Số điện thoại đã được xác thực thành công",
  "phoneVerified": true,
  "emailVerified": true,
  "nextStep": "AWAITING_APPROVAL",
  "company": {
    "id": "clxxxxxx",
    "name": "Tên công ty",
    "verificationStatus": "PENDING"
  }
}
```

### 4. Gửi lại mã OTP

**PUT** `/api/employer/auth/verify-phone`

Yêu cầu gửi lại mã OTP mới (giới hạn 3 lần/giờ).

#### Request

```json
{
  "phone": "+84912345678"
}
```

#### Response

**Success (200):**
```json
{
  "message": "Mã OTP mới đã được gửi đến số điện thoại của bạn",
  "phone": "+849***678"
}
```

### 5. Kiểm tra Trạng thái Đăng ký

**GET** `/api/employer/auth/registration-status`

Kiểm tra trạng thái hiện tại của quá trình đăng ký.

#### Query Parameters

- `userId`: ID người dùng
- `companyId`: ID công ty  
- `email`: Email người dùng

(Cần cung cấp ít nhất 1 trong 3 parameters)

#### Response

```json
{
  "status": {
    "currentStep": "AWAITING_APPROVAL",
    "nextAction": "Đang chờ quản trị viên phê duyệt",
    "emailVerified": true,
    "phoneVerified": true,
    "companyVerificationStatus": "PENDING",
    "userStatus": "INACTIVE"
  },
  "user": {
    "id": "clxxxxxx",
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "phone": "+84912345678"
  },
  "company": {
    "id": "clxxxxxx",
    "name": "Công ty ABC",
    "slug": "cong-ty-abc",
    "verificationStatus": "PENDING"
  },
  "timeline": [
    {
      "step": "REGISTRATION",
      "status": "COMPLETED",
      "completedAt": "2025-01-01T10:00:00Z",
      "description": "Đăng ký tài khoản"
    },
    {
      "step": "EMAIL_VERIFICATION",
      "status": "COMPLETED",
      "completedAt": "2025-01-01T10:15:00Z",
      "description": "Xác thực email"
    },
    {
      "step": "PHONE_VERIFICATION",
      "status": "COMPLETED",
      "completedAt": "2025-01-01T10:20:00Z",
      "description": "Xác thực số điện thoại"
    },
    {
      "step": "ADMIN_APPROVAL",
      "status": "PENDING",
      "description": "Phê duyệt từ quản trị viên"
    }
  ]
}
```

## Luồng đăng ký

1. **Đăng ký**: Gửi thông tin công ty và tài liệu → Nhận userId và companyId
2. **Xác thực Email**: Click link trong email hoặc gọi API với token
3. **Xác thực SĐT**: Nhập mã OTP được gửi qua SMS
4. **Chờ duyệt**: Admin kiểm tra thông tin và phê duyệt
5. **Kích hoạt**: Nhận email thông báo và có thể đăng nhập

## Lưu ý

- Token email có hiệu lực trong 24 giờ
- Mã OTP có hiệu lực trong 10 phút
- Giới hạn gửi lại OTP: 3 lần/giờ
- File upload tối đa 10MB, chấp nhận PDF, JPG, PNG
- Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt

## Environment Variables

Cần cấu hình các biến môi trường sau:

```env
# Database
DATABASE_URL=postgresql://...

# Email Service
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@career-connect.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+84xxxxx

# Storage (AWS S3)
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=career-connect-uploads
AWS_CLOUDFRONT_URL=https://dxxxxx.cloudfront.net

# Or Cloudinary
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# App
NEXT_PUBLIC_APP_URL=https://career-connect.com
JWT_SECRET=xxxxx
```

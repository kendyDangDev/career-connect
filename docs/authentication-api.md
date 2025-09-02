# Authentication API Documentation

## Overview

Hệ thống xác thực Career Connect hỗ trợ đa phương thức đăng ký và đăng nhập:
- Đăng ký/đăng nhập bằng email & mật khẩu
- Xác thực email qua link hoặc token
- Xác thực số điện thoại qua SMS
- Đăng nhập bằng Google OAuth

## Base URL
```
http://localhost:3000/api/auth
```

## Endpoints

### 1. Đăng ký tài khoản

**POST** `/register`

Đăng ký tài khoản mới với email và mật khẩu.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "phone": "0901234567", // optional
  "dateOfBirth": "1990-01-01", // optional
  "acceptTerms": true,
  "acceptPrivacy": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "emailVerified": null
  }
}
```

**Rate Limit:** 3 requests per hour per IP

---

### 2. Xác thực email

**POST** `/verify-email`

Xác thực email bằng token nhận được qua email.

**Request Body:**
```json
{
  "token": "email-verification-token"
}
```

**GET** `/verify-email?token=email-verification-token`

Xác thực email qua URL link (redirect từ email).

**Response (200):**
```json
{
  "success": true,
  "message": "Email đã được xác thực thành công!",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

**Rate Limit:** 5 attempts per 15 minutes per IP

---

### 3. Gửi mã xác thực SMS

**POST** `/send-phone-verification`

Gửi mã xác thực 6 chữ số đến số điện thoại.

**Request Body:**
```json
{
  "phone": "0901234567"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Mã xác thực đã được gửi đến số điện thoại của bạn",
  "expiresIn": 600
}
```

**Rate Limit:** 1 SMS per minute per IP

---

### 4. Xác thực số điện thoại

**POST** `/verify-phone`

Xác thực số điện thoại bằng mã 6 chữ số.

**Request Body:**
```json
{
  "phone": "0901234567",
  "token": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Số điện thoại đã được xác thực thành công!",
  "user": {
    "id": "user-id",
    "phone": "0901234567",
    "phoneVerified": true
  }
}
```

**Rate Limit:** 5 attempts per 15 minutes per IP

---

### 5. NextAuth.js Endpoints

**Authentication với NextAuth.js:**

- **GET/POST** `/api/auth/signin` - Trang đăng nhập
- **GET/POST** `/api/auth/callback/:provider` - OAuth callbacks
- **POST** `/api/auth/signout` - Đăng xuất
- **GET** `/api/auth/session` - Lấy thông tin session
- **GET** `/api/auth/providers` - Danh sách providers

**Đăng nhập bằng credentials:**
```javascript
import { signIn } from 'next-auth/react';

const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'password',
  redirect: false
});
```

**Đăng nhập bằng Google:**
```javascript
import { signIn } from 'next-auth/react';

const result = await signIn('google', {
  callbackUrl: '/dashboard'
});
```

---

## Error Responses

Tất cả API có thể trả về các lỗi sau:

**400 Bad Request:**
```json
{
  "error": "Dữ liệu không hợp lệ",
  "details": [
    {
      "field": "email",
      "message": "Email không hợp lệ"
    }
  ]
}
```

**409 Conflict:**
```json
{
  "error": "Email này đã được sử dụng"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
  "retryAfter": 300
}
```

**500 Internal Server Error:**
```json
{
  "error": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại."
}
```

---

## Security Features

### 1. Rate Limiting
- **Registration:** 3 attempts per hour
- **Login:** 5 attempts per 15 minutes  
- **Email verification:** 5 attempts per 15 minutes
- **SMS verification:** 1 SMS per minute
- **General API:** 100 requests per 15 minutes

### 2. Password Security
- Minimum 8 characters
- Must contain uppercase, lowercase, number and special character
- Hashed with bcrypt (12 rounds)

### 3. Token Security
- Email verification: 24 hours expiry
- Phone verification: 10 minutes expiry
- JWT tokens with secure secrets
- Automatic cleanup of expired tokens

### 4. Data Validation
- Input sanitization với Joi schema
- Email format validation
- Phone number format validation (Vietnamese)
- XSS protection

---

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` và cấu hình:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/career_connect_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret"

# JWT
JWT_SECRET="your-jwt-secret"

# Services
RESEND_API_KEY="re_your-api-key"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 2. Database Migration
```bash
npx prisma generate
npx prisma db push
```

### 3. Start Development Server
```bash
npm run dev
```

---

## Testing

### Manual Testing

1. **Đăng ký tài khoản:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!",
    "firstName": "Test",
    "lastName": "User",
    "acceptTerms": true,
    "acceptPrivacy": true
  }'
```

2. **Xác thực email:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "your-email-token"}'
```

3. **Gửi SMS xác thực:**
```bash
curl -X POST http://localhost:3000/api/auth/send-phone-verification \
  -H "Content-Type: application/json" \
  -d '{"phone": "0901234567"}'
```

---

## Integration Examples

### React Component Example
```typescript
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Đăng ký thành công! Kiểm tra email để xác thực.');
      } else {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Next.js Server Component
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <h1>Welcome {session.user.email}</h1>
      <p>User Type: {session.user.userType}</p>
      <p>Email Verified: {session.user.emailVerified ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

# 🔐 Career Connect - Authentication System Setup

## 📋 Tổng quan

Hệ thống authentication đã được triển khai với các tính năng sau:

✅ **Đã hoàn thành:**

- [x] Đăng ký tài khoản với email/password
- [x] Xác thực email qua token/link
- [x] Xác thực số điện thoại qua SMS
- [x] Đăng nhập bằng Google OAuth
- [x] Rate limiting cho bảo mật
- [x] Validation dữ liệu đầu vào
- [x] Password hashing với bcrypt
- [x] Token management
- [x] Database schema hoàn chỉnh

## 🚀 Cài đặt và Cấu hình

### 1. Cài đặt Dependencies

```bash
# Đã được cài đặt tự động:
npm install next-auth @next-auth/prisma-adapter nodemailer twilio joi resend
```

### 2. Cấu hình Environment Variables

**Tạo file `.env` từ `.env.example`:**

```bash
cp .env.example .env
```

**Cấu hình các biến môi trường cần thiết:**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/career_connect_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="random-secret-key-here-change-in-production"

# JWT
JWT_SECRET="different-jwt-secret-key-here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
FROM_EMAIL="no-reply@career-connect.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Service (Resend)
RESEND_API_KEY="re_your-resend-api-key"

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+84xxxxxxxxx"
```

### 3. Database Setup

**Generate Prisma Client:**

```bash
npx prisma generate
```

**Migrate Database:**

```bash
# Development
npx prisma db push

# Production
npx prisma migrate deploy
```

**Seed Database (optional):**

```bash
npx prisma db seed
```

### 4. Cấu hình Google OAuth

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project existing
3. Enable Google+ API
4. Tạo OAuth 2.0 credentials
5. Thêm authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### 5. Cấu hình Email Service (Resend)

1. Tạo tài khoản tại [Resend](https://resend.com/)
2. Verify domain của bạn
3. Tạo API key
4. Thêm vào `.env` file

### 6. Cấu hình SMS Service (Twilio)

1. Tạo tài khoản tại [Twilio](https://www.twilio.com/)
2. Verify số điện thoại
3. Lấy Account SID và Auth Token
4. Mua số điện thoại hoặc sử dụng trial number
5. Thêm thông tin vào `.env` file

---

## 🏗️ Cấu trúc File

```
src/
├── lib/
│   ├── auth-config.ts        # NextAuth.js configuration
│   ├── auth-utils.ts         # Helper functions
│   ├── prisma.ts            # Prisma client
│   ├── rate-limiter.ts      # Rate limiting
│   └── validations.ts       # Joi validation schemas
├── app/api/auth/
│   ├── [...nextauth]/route.ts    # NextAuth.js endpoints
│   ├── register/route.ts         # User registration
│   ├── verify-email/route.ts     # Email verification
│   ├── verify-phone/route.ts     # Phone verification
│   └── send-phone-verification/route.ts
├── types/
│   └── next-auth.d.ts       # NextAuth type extensions
└── prisma/
    └── schema.prisma        # Database schema
```

---

## 🧪 Testing

### Manual API Testing

**1. Test Registration:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "confirmPassword": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User",
    "acceptTerms": true,
    "acceptPrivacy": true
  }'
```

**2. Test Email Verification:**

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "email-verification-token-here"}'
```

**3. Test Phone Verification:**

```bash
# Send SMS
curl -X POST http://localhost:3000/api/auth/send-phone-verification \
  -H "Content-Type: application/json" \
  -d '{"phone": "0901234567"}'

# Verify code
curl -X POST http://localhost:3000/api/auth/verify-phone \
  -H "Content-Type: application/json" \
  -d '{"phone": "0901234567", "token": "123456"}'
```

### Frontend Integration Testing

**1. NextAuth.js Integration:**

```typescript
import { signIn, signOut, useSession } from 'next-auth/react';

// Component example
export function AuthTest() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>

  if (session) {
    return (
      <>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      <p>Not signed in</p>
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}
```

---

## 📊 Monitoring và Debugging

### 1. Enable Debug Mode

```env
# Development only
NODE_ENV=development
```

### 2. Database Queries

```bash
# View database in browser
npx prisma studio
```

### 3. Logs

- Authentication errors: Console logs
- Email sending: Check Resend dashboard
- SMS sending: Check Twilio console
- Rate limiting: Check API responses

---

## 🔒 Security Checklist

### Production Security

- [ ] Change all default secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up Redis for rate limiting
- [ ] Enable database connection pooling
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup strategy
- [ ] Review user permissions

### Development Security

- [x] Input validation với Joi
- [x] Password hashing với bcrypt
- [x] Rate limiting implemented
- [x] SQL injection protection (Prisma ORM)
- [x] XSS protection
- [x] CSRF protection (NextAuth.js)

---

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Issues:**

```bash
# Check connection
npx prisma db push --preview-feature
```

**2. Google OAuth Issues:**

- Kiểm tra redirect URIs
- Verify domain trong Google Console
- Check client ID/secret

**3. Email Not Sending:**

- Verify Resend domain
- Check API key
- Review from_email address

**4. SMS Not Sending:**

- Verify Twilio credentials
- Check phone number format
- Ensure sufficient balance

**5. Rate Limiting Issues:**

```typescript
// Reset rate limiter (development only)
// Restart server to clear in-memory store
```

### Debug Commands

```bash
# Generate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset

# View database
npx prisma studio

# Check environment variables
npm run env-check
```

---

## 📈 Next Steps

### Immediate Priorities

1. Setup production environment
2. Configure monitoring
3. Create user dashboard
4. Add password reset functionality

### Future Enhancements

1. Add Facebook OAuth
2. Implement 2FA
3. Add password strength meter
4. Create admin panel
5. Add audit logging

---

## 📚 Documentation Links

- [API Documentation](./authentication-api.md)
- [Database Schema](./database_schema.md)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs/)

---

## 💡 Tips

1. **Development:** Use ngrok để test OAuth callbacks
2. **Testing:** Sử dụng temporary email services
3. **Security:** Regularly rotate API keys
4. **Performance:** Consider Redis for production rate limiting
5. **Monitoring:** Set up health checks cho external services

---

**🎉 Authentication System đã sẵn sàng sử dụng!**

Tất cả API endpoints đã được implement và test. Bạn có thể bắt đầu xây dựng frontend components và integrate với backend.

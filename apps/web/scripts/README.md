# Database Seeding Scripts

Các scripts này được sử dụng để khởi tạo dữ liệu mẫu cho hệ thống Career Connect.

## Scripts có sẵn

### 1. `seed-database.js` - Script seed dữ liệu chính
Tạo dữ liệu mẫu đầy đủ cho hệ thống bao gồm:
- Industries (8 ngành nghề)
- Categories (8 danh mục công việc)
- Skills (24 kỹ năng khác nhau)
- Users (1 admin, 5 candidates, 3 employers)
- Companies (3 công ty)
- Jobs (20 công việc)
- Applications (30 đơn ứng tuyển)
- Notifications, Job Views, Company Reviews
- System Settings

**Cách sử dụng:**
```bash
npm run db:seed
```

### 2. `cleanup-database.js` - Script dọn dẹp dữ liệu
Xóa toàn bộ dữ liệu trong database (trừ migrations).

**Cách sử dụng:**
```bash
npm run db:cleanup
```

### 3. `reset-and-seed.js` - Script reset và seed
Kết hợp cleanup + seed để tạo dữ liệu mới hoàn toàn.

**Cách sử dụng:**
```bash
npm run db:reset
```

### 4. `create-test-user.js` - Script tạo user test
Tạo 2 user test cơ bản (candidate và employer).

**Cách sử dụng:**
```bash
npm run db:create-user
```

### 5. `seed-cv-template.js` - Script seed CV templates
Tạo các template CV mẫu.

**Cách sử dụng:**
```bash
npm run db:seed-cv
```

## Dữ liệu test accounts

### Admin Account
- Email: `admin@careerconnect.com`
- Password: `admin123`

### Candidate Accounts
- Email: `nguyenvana@gmail.com` / Password: `123456`
- Email: `tranthib@gmail.com` / Password: `123456`
- Email: `levanc@gmail.com` / Password: `123456`
- Email: `phamthid@gmail.com` / Password: `123456`
- Email: `hoangvane@gmail.com` / Password: `123456`

### Employer Accounts
- Email: `hr@techcorp.com` / Password: `123456`
- Email: `recruiter@innovate.com` / Password: `123456`
- Email: `hr@fintech.com` / Password: `123456`

## Lưu ý quan trọng

⚠️ **CẢNH BÁO**: Các scripts này sẽ xóa toàn bộ dữ liệu hiện có. Chỉ sử dụng trong môi trường development!

### Trước khi chạy scripts:

1. Đảm bảo database đã được setup và Prisma client đã được generate:
```bash
npx prisma generate
npx prisma db push
```

2. Đảm bảo các biến môi trường được cấu hình đúng trong `.env`:
```
DATABASE_URL="your_database_connection_string"
```

3. Đảm bảo có kết nối internet để tạo dữ liệu ngẫu nhiên.

### Thứ tự chạy scripts (khuyến nghị):

1. **Lần đầu setup:**
   ```bash
   npm run db:reset
   ```

2. **Chỉ cần thêm dữ liệu mới:**
   ```bash
   npm run db:seed
   ```

3. **Xóa dữ liệu và làm lại:**
   ```bash
   npm run db:reset
   ```

## Cấu trúc dữ liệu được tạo

### Industries (Ngành nghề)
- Công nghệ thông tin
- Tài chính - Ngân hàng
- Y tế - Sức khỏe
- Giáo dục - Đào tạo
- Sản xuất - Chế tạo
- Thương mại - Bán lẻ
- Du lịch - Khách sạn
- Marketing - Quảng cáo

### Skills được seed
- **Technical:** JavaScript, TypeScript, React, Next.js, Node.js, Python, Java, C#, PHP, SQL, MongoDB, PostgreSQL
- **Tools:** Docker, AWS, Git
- **Soft Skills:** Giao tiếp, Làm việc nhóm, Lãnh đạo, Giải quyết vấn đề, Quản lý thời gian
- **Languages:** Tiếng Anh, Tiếng Nhật, Tiếng Hàn, Tiếng Trung

### Companies
- **TechCorp Vietnam** (Hồ Chí Minh) - Công ty công nghệ lớn
- **Innovate Solutions** (Hà Nội) - Giải pháp công nghệ sáng tạo
- **FinTech Pro** (Đà Nẵng) - Công nghệ tài chính

### Job Types
- Frontend Developer, Backend Developer, Full-stack Developer
- UI/UX Designer, Project Manager, Business Analyst
- DevOps Engineer, QA Tester, Product Manager, Data Analyst

## Troubleshooting

### Lỗi thường gặp:

1. **"User with this email already exists"**
   - Chạy `npm run db:cleanup` trước khi seed

2. **"Connection timeout"**
   - Kiểm tra DATABASE_URL trong file .env
   - Đảm bảo database server đang chạy

3. **"Module not found"**
   - Chạy `npm install` để cài đặt dependencies
   - Chạy `npx prisma generate` để generate Prisma client

4. **"Foreign key constraint fails"**
   - Database có thể có dữ liệu cũ, chạy `npm run db:cleanup` trước

### Debug mode:
Để xem chi tiết lỗi, có thể uncomment các console.log trong scripts hoặc chạy trực tiếp:
```bash
node scripts/seed-database.js
```

## Mở rộng

Để thêm dữ liệu mới hoặc chỉnh sửa dữ liệu seed:

1. **Thêm industries mới:** Chỉnh sửa mảng `industries` trong `seed-database.js`
2. **Thêm skills mới:** Chỉnh sửa mảng `skills`
3. **Thêm companies mới:** Chỉnh sửa mảng `companyData`
4. **Thay đổi số lượng:** Chỉnh sửa các vòng lặp for

## Liên hệ

Nếu có vấn đề với scripts, vui lòng tạo issue hoặc liên hệ team phát triển.
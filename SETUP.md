# Hướng dẫn Setup Monorepo Career Connect

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

## 🚀 Các bước cài đặt

### 1. Clone repository (nếu chưa có)

```bash
git clone <repository-url>
cd career-connect
```

### 2. Cài đặt pnpm (nếu chưa có)

```bash
npm install -g pnpm
```

### 3. Cài đặt dependencies

```bash
# Cài đặt tất cả dependencies cho toàn bộ monorepo
pnpm install
```

### 4. Cấu hình environment variables

#### Web App

```bash
# Copy file .env.example trong apps/web
cd apps/web
cp .env.example .env.local
# Điền các thông tin cần thiết vào .env.local
```

#### Mobile App

```bash
# Copy file .env.example trong apps/mobile (nếu có)
cd apps/mobile
cp .env.example .env
# Điền các thông tin cần thiết vào .env
```

### 5. Setup Database (cho Web App)

```bash
cd apps/web

# Tạo database
pnpm prisma db push

# Seed database với dữ liệu mẫu
pnpm db:seed
```

## 🏃‍♂️ Chạy ứng dụng

### Chạy Web App

```bash
# Từ root folder
pnpm dev

# Hoặc từ apps/web
cd apps/web
pnpm dev
```

Web app sẽ chạy tại: http://localhost:3000

### Chạy Mobile App

```bash
# Từ root folder
pnpm dev:mobile

# Hoặc từ apps/mobile
cd apps/mobile
pnpm start
```

### Chạy cả Web và Mobile cùng lúc

```bash
# Từ root folder
pnpm dev:all
```

## 📱 Chạy Mobile App trên thiết bị

### Android

```bash
cd apps/mobile
pnpm android
```

### iOS (chỉ trên macOS)

```bash
cd apps/mobile
pnpm ios
```

## 🔧 Scripts hữu ích

### Root level

- `pnpm dev` - Chạy web app
- `pnpm dev:mobile` - Chạy mobile app
- `pnpm dev:all` - Chạy cả hai cùng lúc
- `pnpm build` - Build web app
- `pnpm lint` - Lint tất cả code
- `pnpm clean` - Xóa tất cả node_modules và build files

### Web App specific

```bash
cd apps/web
pnpm dev              # Development server
pnpm build            # Production build
pnpm start            # Start production server
pnpm db:seed          # Seed database
pnpm db:reset         # Reset và seed lại database
pnpm db:create-user   # Tạo test user
```

### Mobile App specific

```bash
cd apps/mobile
pnpm start            # Start Expo dev server
pnpm android          # Run on Android
pnpm ios              # Run on iOS
pnpm web              # Run on web browser
```

## 🗂️ Cấu trúc Monorepo

```
career-connect/
├── apps/
│   ├── web/              # Next.js application
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── public/
│   │   └── package.json
│   └── mobile/           # React Native/Expo application
│       ├── app/
│       ├── components/
│       ├── services/
│       └── package.json
├── packages/             # Shared packages
│   └── (future shared code)
├── .vscode/              # VS Code settings
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # pnpm workspace config
├── turbo.json            # Turborepo config
└── README.md
```

## 🔍 Troubleshooting

### Lỗi "Cannot find module"

```bash
# Xóa tất cả node_modules và reinstall
pnpm clean
pnpm install
```

### Lỗi Prisma

```bash
cd apps/web
pnpm prisma generate
pnpm prisma db push
```

### Lỗi Metro bundler (Mobile)

```bash
cd apps/mobile
pnpm start --clear
```

### Lỗi port đã được sử dụng

- Web: Thay đổi port trong `apps/web/package.json`
- Mobile: Expo sẽ tự động chọn port khác

## 💡 Tips

1. **Workspace Commands**: Sử dụng `pnpm --filter <workspace-name>` để chạy command cho một app cụ thể

   ```bash
   pnpm --filter web dev
   pnpm --filter mobile start
   ```

2. **Adding Dependencies**:

   ```bash
   # Thêm vào root
   pnpm add -w <package-name>

   # Thêm vào web
   pnpm --filter web add <package-name>

   # Thêm vào mobile
   pnpm --filter mobile add <package-name>
   ```

3. **Shared Code**: Đặt code dùng chung trong folder `packages/` và import vào các app

4. **Environment Variables**:
   - Web: Sử dụng `NEXT_PUBLIC_` prefix cho client-side variables
   - Mobile: Sử dụng `EXPO_PUBLIC_` prefix cho client-side variables

## 📚 Tài liệu tham khảo

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)

## 🤝 Contributing

1. Tạo branch mới từ `main`
2. Commit changes với meaningful messages
3. Push và tạo Pull Request
4. Đợi review và merge

## ❓ Cần trợ giúp?

Nếu gặp vấn đề, hãy:

1. Check documentation
2. Tìm trong existing issues
3. Tạo issue mới nếu cần

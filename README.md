# Career Connect Monorepo

Dự án Career Connect bao gồm ứng dụng Web (Next.js) và Mobile (React Native/Expo) trong cùng một monorepo.

## 🏗️ Cấu trúc dự án

```
career-connect/
├── apps/
│   ├── web/          # Next.js application
│   └── mobile/       # React Native/Expo application
├── packages/         # Shared packages (nếu có)
├── package.json      # Root package.json
├── pnpm-workspace.yaml
└── turbo.json        # Turborepo configuration
```

## 🚀 Bắt đầu

### Yêu cầu

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Cài đặt

```bash
# Cài đặt tất cả dependencies
pnpm install
```

### Development

```bash
# Chạy web app
pnpm dev

# Chạy mobile app
pnpm dev:mobile

# Chạy cả hai cùng lúc
pnpm dev:all
```

### Build

```bash
# Build web app
pnpm build

# Build mobile app
pnpm build:mobile
```

### Lint

```bash
# Lint tất cả các apps
pnpm lint
```

### Clean

```bash
# Xóa tất cả node_modules và build artifacts
pnpm clean
```

## 📱 Apps

### Web (Next.js)

- **Port**: 3000
- **Tech stack**: Next.js, TypeScript, Prisma, TailwindCSS
- **Location**: `apps/web/`

### Mobile (React Native/Expo)

- **Tech stack**: Expo, React Native, TypeScript
- **Location**: `apps/mobile/`

## 🛠️ Scripts hữu ích

### Web-specific

```bash
cd apps/web
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm db:seed          # Seed database
pnpm db:reset         # Reset and seed database
```

### Mobile-specific

```bash
cd apps/mobile
pnpm start            # Start Expo
pnpm android          # Run on Android
pnpm ios              # Run on iOS
```

## 📦 Package Manager

Dự án này sử dụng **pnpm** với workspace để quản lý monorepo. Các lợi ích:

- Tiết kiệm disk space
- Cài đặt nhanh hơn
- Quản lý dependencies tốt hơn
- Hỗ trợ workspace tốt

## 🔧 Turborepo

Dự án sử dụng Turborepo để:

- Tăng tốc build và test
- Cache thông minh
- Quản lý task dependencies
- Parallel execution

## 📝 Lưu ý

- Luôn chạy `pnpm install` ở root để đảm bảo tất cả dependencies được cài đặt đúng
- Sử dụng `pnpm --filter <workspace>` để chạy commands cho một app cụ thể
- Shared code có thể được tổ chức trong folder `packages/` nếu cần

## 🤝 Contributing

1. Tạo branch mới từ `main`
2. Commit changes
3. Push và tạo Pull Request

## 📄 License

[Your License Here]

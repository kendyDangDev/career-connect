# Career Connect - Complete Project Tree Structure

## 📋 Overview
A full-stack monorepo for a career/job platform with mobile (Expo/React Native) and web (Next.js) applications, sharing a unified backend architecture.

---

```
career-connect/                                   # Root monorepo
│
├── 📦 Package Management & Configuration
│   ├── package.json                              # Root package - defines workspace scripts & dependencies
│   ├── pnpm-workspace.yaml                       # PNPM workspace configuration for monorepo
│   ├── pnpm-lock.yaml                            # Lockfile for consistent dependencies
│   ├── turbo.json                                # Turborepo configuration for build optimization
│   └── .npmrc                                    # NPM/PNPM registry configuration
│
├── 📝 Documentation & Setup
│   ├── README.md                                 # Main project documentation
│   ├── SETUP.md                                  # Development setup instructions
│   └── docs/
│       ├── PROJECT_STRUCTURE.md                  # Architecture documentation
│       └── deployment-packaging-content.md       # Deployment guide
│
├── ⚙️ Configuration Files
│   ├── .editorconfig                             # Editor formatting rules
│   ├── .prettierrc                               # Prettier code formatting
│   ├── .prettierignore                           # Prettier ignore patterns
│   ├── .gitignore                                # Git ignore patterns
│   └── .env.example                              # Environment variables template
│
├── 🔧 Development Tools
│   ├── .vscode/                                  # VS Code workspace settings
│   └── .git/                                     # Git version control
│
├── 📱 APPS - Application Layer
│   │
│   ├── 📱 mobile/                                # Expo/React Native Mobile App
│   │   │
│   │   ├── 📋 Configuration
│   │   │   ├── package.json                      # Mobile app dependencies
│   │   │   ├── app.json                          # Expo configuration
│   │   │   ├── babel.config.js                   # Babel transpiler config
│   │   │   ├── metro.config.js                   # Metro bundler config
│   │   │   ├── tsconfig.json                     # TypeScript configuration
│   │   │   ├── eslint.config.js                  # ESLint rules
│   │   │   ├── tailwind.config.js                # Tailwind CSS config
│   │   │   ├── postcss.config.js                 # PostCSS config
│   │   │   ├── global.css                        # Global styles
│   │   │   ├── nativewind-env.d.ts              # NativeWind type definitions
│   │   │   ├── expo-env.d.ts                    # Expo type definitions
│   │   │   └── app.d.ts                         # App type definitions
│   │   │
│   │   ├── 🗂️ app/                              # Expo Router - File-based routing
│   │   │   ├── _layout.tsx                      # Root layout component
│   │   │   ├── +html.tsx                        # HTML document wrapper
│   │   │   ├── +not-found.tsx                   # 404 error page
│   │   │   ├── index.tsx                        # Home/Landing page
│   │   │   │
│   │   │   ├── (auth)/                          # Authentication flow (route group)
│   │   │   │   ├── _layout.tsx                  # Auth layout wrapper
│   │   │   │   ├── login.tsx                    # Login screen
│   │   │   │   ├── login-simple.tsx             # Simplified login
│   │   │   │   ├── welcome-react.tsx            # Welcome screen
│   │   │   │   └── verify-email.tsx             # Email verification
│   │   │   │
│   │   │   ├── (tabs)/                          # Main app tabs (route group)
│   │   │   │   ├── _layout.tsx                  # Tab layout with bottom navigation
│   │   │   │   ├── index.tsx                    # Home tab
│   │   │   │   ├── jobs.tsx                     # Jobs listing tab
│   │   │   │   ├── chat.tsx                     # Messaging tab
│   │   │   │   ├── cv-management.tsx            # CV/Resume tab
│   │   │   │   └── profile.tsx                  # User profile tab
│   │   │   │
│   │   │   ├── job/                             # Job-related screens
│   │   │   │   └── [id].tsx                     # Dynamic job details
│   │   │   │
│   │   │   ├── company/                         # Company-related screens
│   │   │   │   └── [id].tsx                     # Dynamic company profile
│   │   │   │
│   │   │   ├── application/                     # Application-related screens
│   │   │   │   └── [id].tsx                     # Application details
│   │   │   │
│   │   │   ├── chat/                            # Chat-related screens
│   │   │   │   └── [id].tsx                     # Individual chat
│   │   │   │
│   │   │   ├── incomplete/                      # Incomplete profiles
│   │   │   │   └── [type].tsx                   # Dynamic incomplete screens
│   │   │   │
│   │   │   ├── applied-jobs.tsx                 # User's job applications
│   │   │   ├── saved-jobs.tsx                   # Saved/bookmarked jobs
│   │   │   ├── job-views.tsx                    # Job view history
│   │   │   ├── company-followers.tsx            # Companies user follows
│   │   │   ├── profile-info.tsx                 # Profile information
│   │   │   ├── change-password.tsx              # Password change
│   │   │   └── notifications.tsx                # User notifications
│   │   │
│   │   ├── 🎨 components/                       # React Native Components
│   │   │   ├── HomePage.tsx                     # Main homepage component
│   │   │   ├── Header.tsx                       # App header
│   │   │   │
│   │   │   ├── job/                             # Job components
│   │   │   │   ├── JobCard.tsx                  # Job listing card
│   │   │   │   ├── JobListScreen.tsx            # Jobs list view
│   │   │   │   ├── JobDetailScreen.tsx          # Job details view
│   │   │   │   ├── JobDetailHeader.tsx          # Job detail header
│   │   │   │   ├── JobDescriptionSection.tsx    # Job description
│   │   │   │   ├── JobSkillsSection.tsx         # Skills required
│   │   │   │   ├── JobMatchSection.tsx          # Match percentage
│   │   │   │   ├── JobCategoriesSection.tsx     # Job categories
│   │   │   │   ├── JobFilters.tsx               # Filter UI
│   │   │   │   ├── JobStates.tsx                # Job state management
│   │   │   │   ├── SavedJobCard.tsx             # Saved job card
│   │   │   │   ├── SavedJobsScreen.tsx          # Saved jobs screen
│   │   │   │   ├── SaveJobButton.tsx            # Save job button
│   │   │   │   ├── JobViewCard.tsx              # Job view card
│   │   │   │   └── JobViewsScreen.tsx           # Job views screen
│   │   │   │
│   │   │   ├── company/                         # Company components
│   │   │   │   ├── CompanyProfileScreen.tsx     # Company profile
│   │   │   │   ├── CompanyInfoCard.tsx          # Company info card
│   │   │   │   ├── CompanyFollowerCard.tsx      # Follower card
│   │   │   │   └── CompanyFollowerScreen.tsx    # Followers screen
│   │   │   │
│   │   │   ├── chat/                            # Chat components
│   │   │   │   └── [chat components...]         # Chat UI elements
│   │   │   │
│   │   │   ├── cv/                              # CV/Resume components
│   │   │   │   └── CVManagementScreen.tsx       # CV management
│   │   │   │
│   │   │   ├── features/                        # Feature-specific components
│   │   │   │   └── [feature components...]      # Grouped by feature
│   │   │   │
│   │   │   ├── common/                          # Common/shared components
│   │   │   │   └── [common components...]       # Reusable components
│   │   │   │
│   │   │   ├── ui/                              # UI primitives
│   │   │   │   └── [ui components...]           # Base UI components
│   │   │   │
│   │   │   ├── ApplicationCard.tsx              # Application card
│   │   │   ├── ApplicationsScreen.tsx           # Applications screen
│   │   │   ├── ApplyButton.tsx                  # Job apply button
│   │   │   ├── CategoryFilter.tsx               # Category filter
│   │   │   ├── SearchBar.tsx                    # Search input
│   │   │   ├── ProfileInfoScreen.tsx            # Profile info
│   │   │   ├── ProfileInfoScreen_Modern.tsx     # Modern profile
│   │   │   ├── ChangePasswordScreen.tsx         # Password change
│   │   │   ├── CustomAlert.tsx                  # Alert dialog
│   │   │   ├── LoginPrompt.tsx                  # Login prompt
│   │   │   ├── BottomNavigation.tsx             # Bottom nav
│   │   │   ├── CustomTabBar.tsx                 # Custom tab bar
│   │   │   ├── AnimatedTabBar.tsx               # Animated tab bar
│   │   │   ├── TopCompaniesSection.tsx          # Top companies
│   │   │   ├── StatsSection.tsx                 # Statistics section
│   │   │   ├── UserReviewsSection.tsx           # User reviews
│   │   │   ├── ThemedText.tsx                   # Themed text
│   │   │   ├── ThemedView.tsx                   # Themed view
│   │   │   ├── Collapsible.tsx                  # Collapsible UI
│   │   │   ├── ExternalLink.tsx                 # External links
│   │   │   └── ParallaxScrollView.tsx           # Parallax scroll
│   │   │
│   │   ├── 🧩 services/                         # API Service Layer
│   │   │   ├── authService.ts                   # Authentication API
│   │   │   ├── userService.ts                   # User management
│   │   │   ├── jobService.ts                    # Job CRUD operations
│   │   │   ├── jobApplicationService.ts         # Job applications
│   │   │   ├── applicationService.ts            # Application management
│   │   │   ├── companyService.ts                # Company operations
│   │   │   ├── companyFollowerService.ts        # Company followers
│   │   │   ├── cvService.ts                     # CV operations
│   │   │   ├── candidateCvService.ts            # Candidate CVs
│   │   │   ├── chatService.ts                   # Messaging service
│   │   │   ├── savedJobService.ts               # Saved jobs
│   │   │   ├── jobViewService.ts                # Job views tracking
│   │   │   ├── reviewService.ts                 # Review management
│   │   │   └── pdfPageService.ts                # PDF handling
│   │   │
│   │   ├── 🏪 stores/                           # State Management (Zustand/Redux)
│   │   │   └── [state stores...]                # Global state
│   │   │
│   │   ├── 🔗 contexts/                         # React Context Providers
│   │   │   └── [context providers...]           # Shared contexts
│   │   │
│   │   ├── 🎣 hooks/                            # Custom React Hooks
│   │   │   └── [custom hooks...]                # Reusable hooks
│   │   │
│   │   ├── 🗄️ prisma/                          # Database Schema
│   │   │   └── schema.prisma                    # Prisma ORM schema
│   │   │
│   │   ├── 🎨 assets/                           # Static Assets
│   │   │   ├── fonts/                           # Custom fonts
│   │   │   └── images/                          # Images & icons
│   │   │
│   │   ├── 📘 types/                            # TypeScript Types
│   │   │   └── [type definitions...]            # Shared types
│   │   │
│   │   ├── 🛠️ utils/                           # Utility Functions
│   │   │   └── [utility functions...]           # Helper functions
│   │   │
│   │   ├── 🎨 ui/                               # UI Component Library
│   │   │   └── [ui primitives...]               # Shadcn/UI components
│   │   │
│   │   ├── 📊 constants/                        # App Constants
│   │   │   └── [constants...]                   # Static values
│   │   │
│   │   ├── 📚 docs/                             # Mobile-specific docs
│   │   │   └── WARP.md                          # Documentation
│   │   │
│   │   ├── 🔧 Build & Generated
│   │   │   ├── .expo/                           # Expo build cache
│   │   │   ├── node_modules/                    # Dependencies
│   │   │   └── InternalBytecode.js              # Bytecode
│   │   │
│   │   └── 📄 Environment & Config
│   │       ├── .env                             # Environment variables (local)
│   │       ├── .env.example                     # Environment template
│   │       ├── .gitignore                       # Git ignore
│   │       ├── .vscode/                         # VS Code settings
│   │       ├── pnpm-lock.yaml                   # Lock file
│   │       ├── README.md                        # Mobile app README
│   │       └── WARP.md                          # Additional docs
│   │
│   └── 🌐 web/                                  # Next.js Web Application
│       │
│       ├── 📋 Configuration
│       │   ├── package.json                      # Web app dependencies
│       │   ├── next.config.ts                   # Next.js configuration
│       │   ├── tsconfig.json                    # TypeScript config
│       │   ├── eslint.config.mjs                # ESLint rules
│       │   ├── tailwind.config.js               # Tailwind CSS
│       │   ├── postcss.config.mjs               # PostCSS config
│       │   ├── components.json                  # Shadcn/ui config
│       │   ├── middleware.ts                    # Next.js middleware
│       │   └── server.js                        # Custom server
│       │
│       ├── 🎯 src/                              # Source Code Directory
│       │   ├── app/                             # Next.js App Router
│       │   │   ├── layout.tsx                   # Root layout
│       │   │   ├── page.tsx                     # Home page
│       │   │   ├── (auth)/                      # Auth routes group
│       │   │   ├── (dashboard)/                 # Dashboard routes
│       │   │   ├── jobs/                        # Job pages
│       │   │   ├── companies/                   # Company pages
│       │   │   ├── profile/                     # Profile pages
│       │   │   └── api/                         # API routes
│       │   │
│       │   ├── components/                      # React Components
│       │   │   ├── layout/                      # Layout components
│       │   │   ├── forms/                       # Form components
│       │   │   ├── ui/                          # UI primitives
│       │   │   └── [feature components...]      # Feature components
│       │   │
│       │   ├── api/                             # Backend API Logic
│       │   │   └── [api handlers...]            # API implementations
│       │   │
│       │   ├── services/                        # Service Layer
│       │   │   └── [services...]                # Business logic
│       │   │
│       │   ├── lib/                             # Libraries & Utilities
│       │   │   ├── prisma.ts                    # Prisma client
│       │   │   ├── auth.ts                      # Auth utilities
│       │   │   └── [utils...]                   # Helper functions
│       │   │
│       │   ├── hooks/                           # React Hooks
│       │   │   └── [custom hooks...]            # Reusable hooks
│       │   │
│       │   ├── contexts/                        # Context Providers
│       │   │   └── [contexts...]                # React contexts
│       │   │
│       │   ├── providers/                       # Provider Components
│       │   │   └── [providers...]               # App providers
│       │   │
│       │   ├── types/                           # TypeScript Types
│       │   │   └── [type definitions...]        # Type definitions
│       │   │
│       │   ├── utils/                           # Utility Functions
│       │   │   └── [utilities...]               # Helper functions
│       │   │
│       │   ├── middleware.ts                    # Request middleware
│       │   │
│       │   ├── docs/                            # Documentation
│       │   │   └── [docs...]                    # Web-specific docs
│       │   │
│       │   └── generated/                       # Generated Code
│       │       └── [generated files...]         # Auto-generated
│       │
│       ├── 🗄️ prisma/                          # Database Configuration
│       │   ├── schema.prisma                    # Database schema
│       │   └── migrations/                      # Database migrations
│       │       └── [migration files...]         # SQL migrations
│       │
│       ├── 🌐 public/                           # Static Files
│       │   ├── file.svg                         # Public SVG files
│       │   ├── globe.svg
│       │   ├── vercel.svg
│       │   ├── window.svg
│       │   └── uploads/                         # User uploads
│       │
│       ├── 🎨 ui/                               # Shared UI Components
│       │   └── [ui components...]               # Component library
│       │
│       ├── 🔧 scripts/                          # Build & Deploy Scripts
│       │   └── [scripts...]                     # Automation scripts
│       │
│       ├── 📚 docs/                             # Web Documentation
│       │   └── WARP.md                          # Documentation
│       │
│       ├── 📁 api/                              # API Documentation/Config
│       │   └── WARP.md                          # API docs
│       │
│       ├── 🔧 Build & Generated
│       │   ├── .next/                           # Next.js build output
│       │   ├── node_modules/                    # Dependencies
│       │   ├── next-env.d.ts                    # Next.js types
│       │   └── tsconfig.tsbuildinfo             # TS build info
│       │
│       └── 📄 Environment & Config
│           ├── .env                             # Local environment
│           ├── .env.local                       # Local overrides
│           ├── .env.cors                        # CORS config
│           ├── .env.example                     # Environment template
│           ├── sendgrid.env                     # SendGrid config
│           ├── .gitignore                       # Git ignore
│           ├── .eslintignore                    # ESLint ignore
│           ├── .prettierrc                      # Prettier config
│           ├── pnpm-lock.yaml                   # Lock file
│           ├── README.md                        # Web app README
│           └── WARP.md                          # Additional docs
│
└── 📦 packages/                                 # Shared Packages (Currently Empty)
    └── .gitkeep                                  # Placeholder for future packages
                                                  # (e.g., shared types, UI lib, utils)
```

---

## 🏗️ Architecture Patterns

### **Monorepo Structure**
- **Tool**: PNPM Workspaces + Turborepo
- **Apps**: Independent mobile and web applications
- **Packages**: Shared code (currently unused, ready for expansion)

### **Mobile App (Expo/React Native)**
- **Router**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind for React Native)
- **State**: Zustand/Redux stores + React Context
- **API**: Service layer with TypeScript
- **Database**: Prisma ORM

### **Web App (Next.js)**
- **Router**: Next.js 14 App Router
- **Styling**: Tailwind CSS + Shadcn/UI
- **API**: Next.js API Routes (src/app/api)
- **Database**: Prisma ORM with PostgreSQL
- **Auth**: Custom authentication system
- **Middleware**: Request/response processing

### **Shared Infrastructure**
- **Database**: PostgreSQL via Prisma
- **ORM**: Prisma (schema in both apps)
- **Type Safety**: TypeScript throughout
- **Code Quality**: ESLint + Prettier
- **Package Manager**: PNPM (fast, efficient)
- **Build Tool**: Turborepo (optimized builds)

---

## 🔄 Data Flow

```
Mobile App          Web App
    ↓                  ↓
Services Layer    API Routes
    ↓                  ↓
   Prisma Client (Shared Schema)
    ↓
PostgreSQL Database
```

---

## 🚀 Key Features

### **Job Platform Core**
- Job listings and search
- Job applications tracking
- Saved jobs and job views
- Company profiles and followers
- User profiles and CVs
- Chat/messaging system
- Reviews and ratings

### **Authentication**
- User registration and login
- Email verification
- Password management
- Profile completion

### **UI/UX**
- Responsive design (mobile & web)
- Dark/light theme support
- Animated navigation
- Real-time updates

---

## 📦 Technology Stack

| Layer | Mobile | Web |
|-------|--------|-----|
| **Framework** | React Native (Expo) | Next.js 14 |
| **Language** | TypeScript | TypeScript |
| **Styling** | NativeWind | Tailwind CSS + Shadcn |
| **State** | Zustand/Context | React Context |
| **Database** | Prisma | Prisma |
| **API** | REST Services | Next.js API Routes |
| **Testing** | Jest | Jest |
| **Build** | Metro Bundler | Turbopack |

---

## 🎯 Development Workflow

1. **Install**: `pnpm install` (root - installs all workspaces)
2. **Dev Web**: `pnpm dev` (starts Next.js dev server)
3. **Dev Mobile**: `pnpm dev:mobile` (starts Expo)
4. **Dev Both**: `pnpm dev:all` (runs both concurrently)
5. **Build Web**: `pnpm build` (production build)
6. **Build Mobile**: `pnpm build:mobile` (Android build)
7. **Lint**: `pnpm lint` (checks all workspaces)

---

## 📝 Notes

- **Prisma**: Both apps have their own schema but can be unified
- **Packages**: Empty but ready for shared libraries
- **Environment**: Multiple .env files for different configs
- **Uploads**: Public uploads folder for user files
- **Migrations**: Database migrations tracked in web/prisma
- **Docs**: WARP.md files contain additional documentation


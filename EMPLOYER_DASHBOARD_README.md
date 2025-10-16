# Dashboard Nhà Tuyển Dụng - Career Connect

## 📋 Tổng quan

Dashboard dành riêng cho nhà tuyển dụng với thiết kế tối giản, hiện đại và chuyên nghiệp. Sử dụng tông màu tím chủ đạo kết hợp với gradient nhẹ nhàng, tạo trải nghiệm thân thiện và thẩm mỹ cao.

## 🎨 Thiết kế

### Màu sắc chính
- **Tím chủ đạo**: `from-purple-500 to-purple-600`
- **Gradient phụ**: Pink, Blue, Emerald, Indigo
- **Nền**: Trắng với gradient purple nhạt
- **Border**: Purple-100 để tạo điểm nhấn tinh tế

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        SIDEBAR (Fixed)                      │
│  - Logo với gradient purple                                 │
│  - Navigation menu với active state gradient                │
│  - User profile section                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    HEADER (Sticky)                          │
│  - Search bar                                               │
│  - Notification bell với badge                              │
│  - Quick action: Đăng tin tuyển dụng                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    MAIN CONTENT                             │
│                                                             │
│  1. Welcome Banner (Gradient purple-pink)                   │
│  2. Stats Cards (Grid 4 columns)                           │
│  3. Quick Actions (Grid 4 columns)                         │
│  4. Jobs Overview + Pipeline (Grid 2:1)                    │
│  5. Applications Chart + Recent Activity (Grid 2 columns)  │
│  6. Upcoming Interviews (Grid 3 columns)                   │
│  7. Alerts & Notifications (Grid 2 columns)                │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Cấu trúc Files

```
src/
├── app/
│   └── employer/
│       ├── layout.tsx                    # Layout chính với sidebar
│       └── dashboard/
│           └── page.tsx                  # Dashboard page
│
└── components/
    └── employer/
        └── dashboard/
            ├── StatsCard.tsx             # Thẻ thống kê
            ├── QuickActions.tsx          # Các hành động nhanh
            ├── JobsOverview.tsx          # Tổng quan công việc
            ├── ApplicationsChart.tsx     # Biểu đồ ứng tuyển
            └── RecentActivity.tsx        # Hoạt động gần đây
```

## 🎯 Chức năng chính

### 1. Sidebar Navigation
- Dashboard
- Quản lý công ty
- Quản lý công việc
- Quản lý ứng viên
- Tin nhắn
- Báo cáo & Thống kê
- Cài đặt

### 2. Stats Cards (4 thẻ chính)
- **Công việc đang tuyển**: Số lượng + trend
- **Tổng ứng tuyển**: Số lượng + phần trăm tăng
- **Lượt xem hồ sơ**: Số lượt + trend
- **Tỷ lệ tuyển dụng**: Phần trăm + so sánh

### 3. Quick Actions
- Đăng tin tuyển dụng (Purple gradient)
- Xem ứng viên (Pink gradient)
- Phỏng vấn hôm nay (Blue gradient)
- Tải CV ứng viên (Green gradient)

### 4. Jobs Overview
- Danh sách công việc đang tuyển
- Trạng thái: Active, Paused, Closed
- Thống kê: Số ứng viên, lượt xem, ngày còn lại
- Actions: Edit, Copy, Pause, Delete

### 5. Pipeline Ứng viên
- Mới ứng tuyển (42 - 70%)
- Đang xem xét (28 - 47%)
- Phỏng vấn (12 - 20%)
- Chấp nhận (8 - 13%)

### 6. Applications Chart
- Biểu đồ cột 6 tháng gần đây
- So sánh: Ứng tuyển vs Phỏng vấn
- Summary stats: Tổng, Phỏng vấn, Tỷ lệ chuyển đổi

### 7. Recent Activity
- Timeline hoạt động với icons màu sắc
- Thông tin ứng viên mới
- Lịch phỏng vấn
- Đánh giá và thay đổi trạng thái

### 8. Upcoming Interviews
- Cards lịch phỏng vấn sắp tới
- Thông tin: Tên, vị trí, thời gian
- Trạng thái: Confirmed, Pending

### 9. Alerts & Notifications
- Công việc sắp hết hạn (Orange theme)
- Hiệu suất tuyển dụng (Green theme)

## 🎨 Design Principles

### 1. **Minimalism**
- White space hợp lý
- Typography rõ ràng
- Không quá tải thông tin

### 2. **Purple Theme**
- Gradient tím chủ đạo
- Border purple nhạt
- Hover effects với purple

### 3. **Micro-interactions**
- Hover: scale, shadow, color change
- Smooth transitions (200-300ms)
- Loading states

### 4. **Visual Hierarchy**
- Welcome banner nổi bật
- Stats cards ưu tiên cao
- Grid layout cân đối

### 5. **Responsive Design**
- Mobile: Stack columns
- Tablet: 2 columns
- Desktop: 3-4 columns

## 🚀 Features Highlights

### Animations & Effects
- Gradient backgrounds với opacity
- Hover lift effect
- Smooth transitions
- Badge animations
- Progress bar animations

### Accessibility
- High contrast colors
- Clear focus states
- Semantic HTML
- ARIA labels (cần bổ sung)

### Performance
- Client-side rendering
- Optimized images
- Lazy loading (cần implement)

## 📱 Responsive Breakpoints

```css
/* Mobile */
< 640px: Single column, stacked layout

/* Tablet */
640px - 1024px: 2 columns grid

/* Desktop */
> 1024px: Full grid layout (3-4 columns)
```

## 🎯 Next Steps

### Phase 1: Core Features
- [x] Layout với sidebar
- [x] Dashboard page
- [x] Stats cards
- [x] Quick actions
- [x] Charts và analytics

### Phase 2: Interactions
- [ ] API integration
- [ ] Real-time updates
- [ ] Notifications system
- [ ] Search functionality

### Phase 3: Advanced Features
- [ ] Filters và sorting
- [ ] Export reports
- [ ] Bulk actions
- [ ] Advanced analytics

### Phase 4: Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Accessibility audit

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Components**: Custom components
- **TypeScript**: Full type safety

## 📝 Notes

- Tất cả dữ liệu hiện tại là mock data
- Cần tích hợp với API backend
- Cần thêm authentication guards
- Cần optimize performance cho large datasets

## 🎨 Color Palette

```css
/* Purple Gradients */
from-purple-600 to-purple-500  /* Header, Active nav */
from-purple-500 to-purple-600  /* Primary actions */
from-purple-50 via-white to-purple-50/30  /* Background */

/* Secondary Colors */
from-blue-500 to-indigo-600    /* Stats */
from-pink-500 to-rose-600      /* Accent */
from-emerald-500 to-teal-600   /* Success */
from-yellow-500 to-orange-500  /* Warning */
```

---

**Thiết kế bởi**: AI Assistant
**Ngày tạo**: 2025-01-15
**Version**: 1.0.0

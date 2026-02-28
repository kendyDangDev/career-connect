import { ReactNode } from 'react';

interface GridContainerProps {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 6 | 12;
  gap?: 2 | 3 | 4 | 5 | 6 | 8;
  className?: string;
}

/**
 * GridContainer - Hệ thống lưới 12 cột với responsive breakpoints
 *
 * @param cols - Số cột hiển thị (desktop): 2, 3, 4, 6 hoặc 12
 * @param gap - Khoảng cách giữa các items: 2-8 (default: 4)
 *
 * @example
 * ```tsx
 * // Grid 4 cột (mỗi item chiếm 3/12 cột)
 * <GridContainer cols={4}>
 *   <ItemCard />
 *   <ItemCard />
 * </GridContainer>
 *
 * // Grid 3 cột với gap lớn hơn
 * <GridContainer cols={3} gap={6}>
 *   <ItemCard />
 * </GridContainer>
 * ```
 */
export default function GridContainer({
  children,
  cols = 3,
  gap = 4,
  className = '',
}: GridContainerProps) {
  // Map columns to Tailwind classes
  const colsMap = {
    2: 'md:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'md:grid-cols-4',
    6: 'md:grid-cols-6',
    12: 'grid-cols-12',
  };

  // Responsive: Always start with 1 column on mobile, 2 on tablet
  const responsiveCols =
    cols === 12
      ? 'grid-cols-12'
      : `grid-cols-1 ${cols >= 3 ? 'sm:grid-cols-2' : ''} ${colsMap[cols]}`;

  return <div className={`grid ${responsiveCols} gap-${gap} ${className}`}>{children}</div>;
}

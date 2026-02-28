import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container component giới hạn chiều rộng tối đa 1200px (12 cột)
 * Tự động căn giữa và responsive padding
 *
 * @example
 * ```tsx
 * <Container>
 *   <YourContent />
 * </Container>
 *
 * <Container className="py-8">
 *   <YourContent />
 * </Container>
 * ```
 */
export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

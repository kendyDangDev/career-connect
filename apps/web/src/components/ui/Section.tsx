import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  background?: 'white' | 'gray' | 'gradient' | 'none';
  spacing?: 'sm' | 'md' | 'lg';
}

/**
 * Section wrapper component với consistent styling
 *
 * @param fullWidth - Nếu true, section chiếm full width (không constrain). Default: false
 * @param background - Màu nền: 'white' | 'gray' | 'gradient' | 'none'. Default: 'white'
 * @param spacing - Vertical padding: 'sm' (py-8) | 'md' (py-12) | 'lg' (py-16). Default: 'md'
 *
 * @example
 * ```tsx
 * // Section với background trắng và spacing mặc định
 * <Section>
 *   <YourContent />
 * </Section>
 *
 * // Section với gradient background và spacing lớn
 * <Section background="gradient" spacing="lg">
 *   <YourContent />
 * </Section>
 *
 * // Section full-width
 * <Section fullWidth background="gray">
 *   <YourContent />
 * </Section>
 * ```
 */
export default function Section({
  children,
  className = '',
  fullWidth = false,
  background = 'white',
  spacing = 'md',
}: SectionProps) {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-purple-50 via-white to-indigo-50',
    none: '',
  };

  const spacingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
  };

  return (
    <section className={`${backgroundClasses[background]} ${spacingClasses[spacing]} ${className}`}>
      {fullWidth ? (
        children
      ) : (
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">{children}</div>
      )}
    </section>
  );
}

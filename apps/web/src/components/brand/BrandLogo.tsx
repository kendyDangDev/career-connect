import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

type BrandLogoProps = {
  href?: string;
  label?: string | false;
  size?: number;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  priority?: boolean;
};

function isDefaultBrandLabel(label: string) {
  return label.replace(/\s+/g, '').toLowerCase() === 'careerconnect';
}

export function BrandLogo({
  href,
  label = 'CareerConnect',
  size = 40,
  className,
  iconClassName,
  labelClassName,
  priority = false,
}: BrandLogoProps) {
  const labelNode =
    label === false ? null : typeof label === 'string' && isDefaultBrandLabel(label) ? (
      <span
        className={cn(
          'inline-flex items-end gap-1 leading-none font-black tracking-tight text-gray-900',
          labelClassName
        )}
      >
        <span className="text-current">Career</span>
        <span className="relative inline-flex flex-col">
          <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent drop-shadow-[0_4px_14px_rgba(168,85,247,0.18)]">
            Connect
          </span>
          <span
            aria-hidden="true"
            className="mt-0.5 h-[3px] rounded-full bg-gradient-to-r from-violet-500/80 via-fuchsia-500/80 to-sky-500/80 shadow-[0_0_14px_rgba(168,85,247,0.24)]"
          />
        </span>
      </span>
    ) : (
      <span className={cn('font-bold tracking-tight text-gray-900', labelClassName)}>{label}</span>
    );

  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/logo.png"
        alt="CareerConnect logo"
        width={size}
        height={size}
        priority={priority}
        className={cn(
          'shrink-0 object-contain transition-transform duration-300',
          href ? 'group-hover:scale-[1.04]' : null,
          iconClassName
        )}
      />
      {labelNode}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="CareerConnect home" className="group inline-flex w-fit">
        {content}
      </Link>
    );
  }

  return content;
}

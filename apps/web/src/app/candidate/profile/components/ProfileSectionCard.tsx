import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProfileSectionCardProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function ProfileSectionCard({
  id,
  title,
  description,
  children,
  className,
  contentClassName,
}: ProfileSectionCardProps) {
  return (
    <Card
      id={id}
      className={cn(
        'overflow-hidden rounded-[28px] border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(91,33,182,0.10)] backdrop-blur-xl',
        className
      )}
    >
      <CardHeader className="space-y-2 border-b border-violet-100/80 pb-5">
        <CardTitle className="text-xl text-slate-900">{title}</CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-500">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn('pt-6', contentClassName)}>{children}</CardContent>
    </Card>
  );
}

'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { QueryProvider } from '@/providers';
import { NoSSR } from '@/components/ui/NoSSR';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>
        <NotificationProvider position="top-right">{children}</NotificationProvider>
        <NoSSR>
          <Toaster position="top-right" expand={false} richColors closeButton />
        </NoSSR>
      </SessionProvider>
    </QueryProvider>
  );
}

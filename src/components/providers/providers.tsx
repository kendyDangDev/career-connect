'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { NotificationProvider } from '@/contexts/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider position="top-right">
        {children}
      </NotificationProvider>
      <Toaster position="top-right" expand={false} richColors closeButton />
    </SessionProvider>
  );
}

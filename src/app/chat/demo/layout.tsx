'use client';

import { ChatProvider } from '@/contexts/ChatContext';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>;
}

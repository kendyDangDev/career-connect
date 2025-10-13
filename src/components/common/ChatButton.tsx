'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminChatModal } from '@/components/admin/chat/AdminChatModal';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface ChatButtonProps {
  className?: string;
  variant?: 'icon' | 'text' | 'both';
  position?: 'fixed' | 'relative';
  unreadCount?: number;
}

export function ChatButton({ 
  className, 
  variant = 'icon',
  position = 'relative',
  unreadCount = 0
}: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [messageCount, setMessageCount] = useState(unreadCount);

  // You can fetch unread message count from API here
  useEffect(() => {
    // Example: Fetch unread count from API
    // fetchUnreadCount().then(setMessageCount);
  }, [session]);

  if (!session) return null;

  const buttonContent = () => {
    switch (variant) {
      case 'text':
        return (
          <>
            <span>Messages</span>
            {messageCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {messageCount}
              </Badge>
            )}
          </>
        );
      case 'both':
        return (
          <>
            <MessageCircle className="h-5 w-5" />
            <span className="ml-2">Messages</span>
            {messageCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {messageCount}
              </Badge>
            )}
          </>
        );
      default: // icon
        return (
          <>
            <MessageCircle className="h-5 w-5" />
            {messageCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
              >
                {messageCount > 99 ? '99+' : messageCount}
              </Badge>
            )}
          </>
        );
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={variant === 'icon' ? 'ghost' : 'outline'}
        size={variant === 'icon' ? 'icon' : 'default'}
        className={cn(
          position === 'fixed' && 'fixed bottom-6 right-6 z-40 shadow-lg',
          variant === 'icon' && 'relative',
          className
        )}
      >
        {buttonContent()}
      </Button>

      <AdminChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
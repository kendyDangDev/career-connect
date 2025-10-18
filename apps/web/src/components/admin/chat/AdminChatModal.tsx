'use client';

import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, Send } from 'lucide-react';
import { ChatProvider, useChatContext } from '@/contexts/ChatContext';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

interface AdminChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatContent = ({ onClose }: { onClose: () => void }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const { activeConversation } = useChatContext();

  // On mobile, toggle between conversation list and chat window
  useEffect(() => {
    if (activeConversation && window.innerWidth < 768) {
      setShowConversationList(false);
    }
  }, [activeConversation]);

  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Messages
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMaximized(!isMaximized)}
            className="hover:bg-purple-500/10"
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4 text-purple-600" />
            ) : (
              <Maximize2 className="h-4 w-4 text-purple-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-red-500/10"
          >
            <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Conversation List - Desktop: always visible, Mobile: toggleable */}
          <div
            className={cn(
              'border-r bg-gray-50/50',
              showConversationList ? 'flex' : 'hidden',
              'md:flex md:w-80 lg:w-96',
              showConversationList && 'w-full',
              isMaximized && 'lg:w-[400px]'
            )}
          >
            <ConversationList className="w-full" />
          </div>

          {/* Chat Window */}
          <div
            className={cn(
              'bg-white',
              showConversationList ? 'hidden' : 'flex',
              'md:flex flex-1'
            )}
          >
            <ChatWindow
              className="w-full"
              onBack={handleBackToConversations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export function AdminChatModal({ isOpen, onClose }: AdminChatModalProps) {
  const [width, setWidth] = useState('40rem');

  // Update width based on screen size
  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth < 640) {
        setWidth('100%');
      } else if (window.innerWidth < 1024) {
        setWidth('32rem');
      } else if (window.innerWidth < 1536) {
        setWidth('48rem');
      } else {
        setWidth('64rem');
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <SheetPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <SheetPrimitive.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 h-full bg-background shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            'data-[state=closed]:duration-300 data-[state=open]:duration-500',
            'p-0 sm:max-w-none',
            'shadow-2xl shadow-purple-500/10',
            'border-l border-purple-200/50'
          )}
          style={{ width }}
        >
          <ChatProvider>
            <ChatContent onClose={onClose} />
          </ChatProvider>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { ChatProvider, useChatContext } from '@/contexts/ChatContext';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';

const ChatPageContent = () => {
  const [isMobileConversationListOpen, setIsMobileConversationListOpen] = useState(true);
  const { activeConversation, setActiveConversation } = useChatContext();

  // On mobile, when a conversation is selected, show chat window
  useEffect(() => {
    if (activeConversation && window.innerWidth < 768) {
      setIsMobileConversationListOpen(false);
    }
  }, [activeConversation]);

  const handleConversationSelect = () => {
    // On mobile, hide conversation list when a conversation is selected
    if (window.innerWidth < 768) {
      setIsMobileConversationListOpen(false);
    }
  };

  const handleBackToConversations = () => {
    setIsMobileConversationListOpen(true);
    // Optional: clear active conversation on mobile
    if (window.innerWidth < 768) {
      setActiveConversation(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversation List - Desktop: always visible, Mobile: toggleable */}
      <div
        className={` ${isMobileConversationListOpen ? 'flex' : 'hidden'} shrink-0 md:flex md:w-80 lg:w-96 ${isMobileConversationListOpen ? 'w-full' : ''} `}
      >
        <ConversationList className="w-full" />
      </div>

      {/* Chat Window - Desktop: always visible, Mobile: hidden when conversation list is open */}
      <div className={` ${isMobileConversationListOpen ? 'hidden' : 'flex'} flex-1 md:flex`}>
        <ChatWindow className="w-full" onBack={handleBackToConversations} />
      </div>
    </div>
  );
};

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  );
}

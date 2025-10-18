'use client';

import { useState } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { toast } from 'sonner';

/**
 * Hook to start a conversation with a candidate
 * Returns conversation creation function and loading state
 */
export const useStartConversation = () => {
  const { createConversation, setActiveConversation, conversations } = useChatContext();
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Start or resume conversation with a candidate
   * @param candidateId - ID of the candidate user
   * @param candidateName - Name of the candidate for display
   */
  const startConversation = async (candidateId: string, candidateName?: string) => {
    try {
      setIsCreating(true);

      // Check if conversation already exists with this candidate
      const existingConversation = conversations.find((conv) => {
        // For direct conversations, check if the candidate is a participant
        if (conv.type === 'DIRECT' || conv.type === 'APPLICATION_RELATED') {
          return conv.participants.some((p) => p.userId === candidateId);
        }
        return false;
      });

      if (existingConversation) {
        // Resume existing conversation
        setActiveConversation(existingConversation);
        toast.success(`Đang mở cuộc trò chuyện với ${candidateName || 'ứng viên'}`);
        return existingConversation;
      }

      // Create new conversation
      const newConversation = await createConversation(
        [candidateId],
        'DIRECT',
        `Conversation with ${candidateName || 'Candidate'}`
      );

      if (newConversation) {
        setActiveConversation(newConversation);
        toast.success(`Đã tạo cuộc trò chuyện với ${candidateName || 'ứng viên'}`);
        return newConversation;
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Không thể tạo cuộc trò chuyện');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    startConversation,
    isCreating,
  };
};

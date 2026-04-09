'use client';

import { useState } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { toast } from 'sonner';

type StartConversationType = 'DIRECT' | 'APPLICATION_RELATED';

interface StartConversationOptions {
  type?: StartConversationType;
  applicationId?: string;
  jobId?: string;
}

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
   * @param options - Conversation context
   */
  const startConversation = async (
    candidateId: string,
    candidateName?: string,
    options: StartConversationOptions = {}
  ) => {
    try {
      setIsCreating(true);
      const conversationType = options.type ?? 'DIRECT';

      // Check if conversation already exists with this candidate
      const existingConversation = conversations.find((conv) => {
        if (conv.type !== conversationType) {
          return false;
        }

        if (!conv.participants.some((p) => p.userId === candidateId)) {
          return false;
        }

        if (conversationType !== 'APPLICATION_RELATED') {
          return true;
        }

        if (options.applicationId) {
          return conv.application?.id === options.applicationId;
        }

        if (options.jobId) {
          return conv.application?.job?.id === options.jobId || conv.job?.id === options.jobId;
        }

        return true;
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
        conversationType,
        `Conversation with ${candidateName || 'Candidate'}`,
        conversationType === 'APPLICATION_RELATED'
          ? {
              applicationId: options.applicationId,
              jobId: options.jobId,
            }
          : undefined
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

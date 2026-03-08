'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { chatApi } from '@/api/chat.api';

export const chatTokenKeys = {
  all: ['chatToken'] as const,
  token: () => [...chatTokenKeys.all, 'token'] as const,
};

export const useChatToken = () => {
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: chatTokenKeys.token(),
    queryFn: () => chatApi.getChatToken(),
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 60 * 23, // 23h — refresh before 24h token expiry
    retry: 1,
    select: (res) => res.token,
  });

  return {
    token: data ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to get chat token') : null,
  };
};

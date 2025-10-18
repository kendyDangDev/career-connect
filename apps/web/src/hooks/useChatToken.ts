'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useChatToken = () => {
  const { data: session } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getChatToken = async () => {
      if (!session?.user) {
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch('/api/chat/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to get chat token');
        }

        const data = await response.json();
        setToken(data.token);
        setError(null);
      } catch (err) {
        console.error('Error getting chat token:', err);
        setError(err instanceof Error ? err.message : 'Failed to get chat token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    getChatToken();
  }, [session?.user]);

  return { token, isLoading, error };
};

import axiosInstance from '@/lib/axios';
import { ChatTokenResponse } from '@/types/chat.types';

export const chatApi = {
  getChatToken: async (): Promise<ChatTokenResponse> => {
    const { data } = await axiosInstance.post<ChatTokenResponse>('/api/chat/token');
    return data;
  },
};

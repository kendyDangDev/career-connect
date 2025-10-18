'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
}

export function MessageModal({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  candidateAvatar,
}: MessageModalProps) {
  const { data: session } = useSession();
  const {
    activeConversation,
    messages,
    sendMessage,
    isConnected,
    onlineUsers,
  } = useChatContext();
  
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Check if candidate is online
  const isOnline = useMemo(
    () => onlineUsers.some((u) => u.userId === candidateId),
    [onlineUsers, candidateId]
  );

  // Format messages for display
  const formattedMessages = useMemo(() => {
    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      timestamp: formatDistanceToNow(new Date(msg.createdAt), {
        locale: vi,
        addSuffix: true,
      }),
      isSent: msg.senderId === session?.user?.id,
      senderName: msg.sender?.name || 'Unknown',
    }));
  }, [messages, session]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !activeConversation || !isConnected || isSending) {
      return;
    }

    setIsSending(true);
    try {
      sendMessage(activeConversation.id, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl h-[600px] rounded-xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            {candidateAvatar ? (
              <img
                src={candidateAvatar}
                alt={candidateName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white">
                {candidateName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{candidateName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                {isOnline ? 'Đang online' : 'Offline'}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div
          id="messages-container"
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {!isConnected && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Đang kết nối...</p>
              </div>
            </div>
          )}

          {isConnected && formattedMessages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Chưa có tin nhắn nào</p>
                <p className="text-xs text-gray-500 mt-1">Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</p>
              </div>
            </div>
          )}

          {formattedMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.isSent
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {!message.isSent && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {message.senderName}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isSent ? 'text-purple-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          {!isConnected ? (
            <div className="flex items-center justify-center rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-sm text-yellow-800">
                Đang kết nối đến server chat...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!messageText.trim() || isSending}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Gửi
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

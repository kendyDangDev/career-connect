import { useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface MessageThreadProps {
  conversation: {
    id: string;
    name: string;
    avatar?: string;
    position?: string;
    online: boolean;
  };
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function MessageThread({ conversation, messages, onSendMessage }: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-purple-100 bg-white shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white">
              {conversation.avatar || conversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            {conversation.online && (
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.name}</h3>
            {conversation.position && (
              <p className="text-xs text-purple-600">{conversation.position}</p>
            )}
            {conversation.online && (
              <p className="text-xs text-green-600">Đang hoạt động</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-lg p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
            <Phone className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
            <Video className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
            <Info className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <p className="text-sm">Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.isSent ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
                  message.isSent
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                )}>
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <div className={cn(
                    'mt-1 flex items-center gap-1 text-xs',
                    message.isSent ? 'text-purple-100' : 'text-gray-500'
                  )}>
                    <span>{message.timestamp}</span>
                    {message.isSent && message.status && (
                      <span className="ml-1">
                        {message.status === 'read' && '✓✓'}
                        {message.status === 'delivered' && '✓✓'}
                        {message.status === 'sent' && '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-100 p-4">
        <div className="flex items-end gap-2">
          <button className="rounded-lg p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
            <Paperclip className="h-5 w-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="w-full resize-none rounded-lg border border-purple-100 bg-white px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const target = e.target as HTMLTextAreaElement;
                  if (target.value.trim()) {
                    onSendMessage(target.value);
                    target.value = '';
                  }
                }
              }}
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:text-purple-600 transition-colors">
              <Smile className="h-5 w-5" />
            </button>
          </div>

          <button className="flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 p-2.5 text-white shadow-md transition-all hover:shadow-lg hover:scale-105">
            <Send className="h-5 w-5" />
          </button>
        </div>
        
        <p className="mt-2 text-xs text-gray-500 text-center">
          Nhấn <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">Enter</kbd> để gửi, <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">Shift + Enter</kbd> để xuống dòng
        </p>
      </div>
    </div>
  );
}

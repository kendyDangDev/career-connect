import { Search, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  position?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-purple-100 bg-white shadow-soft">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-100 p-4">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Tin nhắn</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="w-full rounded-lg border border-purple-100 bg-white pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              'flex w-full items-start gap-3 border-b border-gray-100 p-4 text-left transition-all duration-200',
              activeId === conversation.id
                ? 'bg-purple-50 border-l-4 border-l-purple-600'
                : 'hover:bg-gray-50'
            )}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white">
                {conversation.avatar || conversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              {conversation.online && (
                <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className={cn(
                    'text-sm font-semibold',
                    conversation.unread > 0 ? 'text-gray-900' : 'text-gray-700'
                  )}>
                    {conversation.name}
                  </h3>
                  {conversation.position && (
                    <p className="text-xs text-purple-600">{conversation.position}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500 shrink-0">{conversation.timestamp}</span>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <p className={cn(
                  'text-sm line-clamp-1',
                  conversation.unread > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                )}>
                  {conversation.lastMessage}
                </p>
                {conversation.unread > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-xs font-bold text-white">
                    {conversation.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

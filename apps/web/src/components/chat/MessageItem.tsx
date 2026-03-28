'use client';

import React from 'react';
import { Download, Eye, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  createdAt: Date | string;
  sender: {
    id: string;
    name: string | null;
    avatar?: string | null;
  };
  attachments?: MessageAttachment[];
}

interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  showTimestamp?: boolean;
  className?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  showSender = true,
  showTimestamp = true,
  className,
}) => {
  // Format timestamp
  const formatTime = (date: Date | string) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render message content based on type
  const renderMessageContent = () => {
    switch (message.type) {
      case 'SYSTEM':
        return (
          <div className="my-4 flex justify-center">
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              {message.content}
            </Badge>
          </div>
        );

      case 'IMAGE':
        return (
          <div className="space-y-2">
            {message.attachments?.map((attachment) => (
              <div key={attachment.id} className="max-w-sm overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={attachment.fileUrl}
                  alt={attachment.fileName}
                  className="h-auto max-h-64 w-full object-cover"
                />
                <div className="flex items-center justify-between p-2">
                  <span className="truncate text-xs text-gray-600">{attachment.fileName}</span>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {message.content && (
              <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        );

      case 'FILE':
        return (
          <div className="space-y-2">
            {message.attachments?.map((attachment) => (
              <div
                key={attachment.id}
                className="flex max-w-xs items-center gap-3 rounded-lg border bg-gray-50 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-100">
                  <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{attachment.fileName}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {message.content && (
              <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        );

      case 'TEXT':
      default:
        return <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>;
    }
  };

  // System messages are centered and don't follow the normal layout
  if (message.type === 'SYSTEM') {
    return <div className={className}>{renderMessageContent()}</div>;
  }

  return (
    <div className={`group flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${className}`}>
      {/* Avatar - only show for others' messages and when showSender is true */}
      {!isOwn && showSender && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={message.sender.avatar || undefined} />
          <AvatarFallback className="text-xs">
            {message.sender.name?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Spacer when not showing avatar */}
      {!isOwn && !showSender && <div className="w-8 shrink-0" />}

      {/* Message bubble */}
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
        {/* Sender name - only for others' messages in group chats */}
        {!isOwn && showSender && (
          <p className="mb-1 px-3 text-xs text-gray-600">{message.sender.name || 'Unknown User'}</p>
        )}

        {/* Message content */}
        <div
          className={`relative rounded-2xl px-3 py-2 ${
            isOwn ? 'ml-auto bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          } ${showSender ? '' : isOwn ? 'rounded-tr-md' : 'rounded-tl-md'} `}
        >
          {renderMessageContent()}

          {/* Message actions (show on hover) */}
          <div
            className={`absolute top-0 opacity-0 transition-opacity group-hover:opacity-100 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} `}
          >
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 border bg-white p-0 shadow-sm">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem>Reply</DropdownMenuItem>
                <DropdownMenuItem>Forward</DropdownMenuItem>
                <DropdownMenuItem>Copy</DropdownMenuItem>
                {isOwn && <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>

        {/* Timestamp */}
        {showTimestamp && (
          <p className={`mt-1 px-3 text-xs text-gray-500 ${isOwn ? 'text-right' : 'text-left'}`}>
            {formatTime(message.createdAt)}
          </p>
        )}
      </div>
    </div>
  );
};

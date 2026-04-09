'use client';

import { Download, FileText, ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AdminMessage,
  formatDateDivider,
  formatMessageTime,
  getInitials,
} from './admin-chat-helpers';

interface AdminChatMessageItemProps {
  message: AdminMessage;
  isOwn: boolean;
  showSender?: boolean;
  showTimestamp?: boolean;
  showDateDivider?: boolean;
}

function formatFileSize(bytes: number) {
  if (!bytes) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const power = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const normalized = bytes / Math.pow(1024, power);

  return `${normalized.toFixed(normalized >= 10 || power === 0 ? 0 : 1)} ${units[power]}`;
}

export function AdminChatMessageItem({
  message,
  isOwn,
  showSender = true,
  showTimestamp = true,
  showDateDivider = false,
}: AdminChatMessageItemProps) {
  if (message.type === 'SYSTEM') {
    return (
      <div className="space-y-4">
        {showDateDivider && (
          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500">
              {formatDateDivider(message.createdAt)}
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        )}
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600"
          >
            {message.content}
          </Badge>
        </div>
      </div>
    );
  }

  const bubbleClass = isOwn
    ? 'bg-violet-600 text-white shadow-sm shadow-violet-300/30'
    : 'border border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-200/40';

  return (
    <div className="space-y-4">
      {showDateDivider && (
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500">
            {formatDateDivider(message.createdAt)}
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      )}

      <div className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && showSender ? (
          <Avatar className="mt-0.5 h-9 w-9 border border-slate-200">
            <AvatarImage src={message.sender.avatar || undefined} />
            <AvatarFallback className="bg-slate-100 text-[11px] font-semibold text-slate-600">
              {getInitials(message.sender.name || message.sender.id)}
            </AvatarFallback>
          </Avatar>
        ) : (
          !isOwn && <div className="w-9 shrink-0" />
        )}

        <div className={`max-w-[82%] space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
          {!isOwn && showSender && (
            <p className="px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
              {message.sender.name || 'Unknown sender'}
            </p>
          )}

          <div className={`rounded-2xl px-4 py-3 ${bubbleClass}`}>
            {message.type === 'IMAGE' && message.attachments?.length ? (
              <div className="space-y-3">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={`overflow-hidden rounded-2xl border ${
                      isOwn ? 'border-violet-400/40 bg-violet-500/10' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      className="max-h-72 w-full object-cover"
                    />
                    <div className="flex items-center justify-between gap-3 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{attachment.fileName}</p>
                        <p
                          className={`text-xs ${
                            isOwn ? 'text-violet-100/85' : 'text-slate-500'
                          }`}
                        >
                          Image attachment
                        </p>
                      </div>
                      <Button
                        asChild
                        size="icon"
                        variant={isOwn ? 'secondary' : 'ghost'}
                        className="h-8 w-8 shrink-0 rounded-full"
                      >
                        <a href={attachment.fileUrl} target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
                {message.content ? <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p> : null}
              </div>
            ) : message.type === 'FILE' && message.attachments?.length ? (
              <div className="space-y-3">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
                      isOwn ? 'border-violet-400/40 bg-violet-500/10' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isOwn ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{attachment.fileName}</p>
                      <p className={`text-xs ${isOwn ? 'text-violet-100/85' : 'text-slate-500'}`}>
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                    <Button
                      asChild
                      size="icon"
                      variant={isOwn ? 'secondary' : 'ghost'}
                      className="h-8 w-8 shrink-0 rounded-full"
                    >
                      <a href={attachment.fileUrl} target="_blank" rel="noreferrer" download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
                {message.content ? <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p> : null}
              </div>
            ) : (
              <div className="flex items-start gap-2">
                {message.type === 'IMAGE' ? (
                  <ImageIcon className={`mt-0.5 h-4 w-4 shrink-0 ${isOwn ? 'text-violet-100' : 'text-slate-400'}`} />
                ) : null}
                <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
              </div>
            )}
          </div>

          {showTimestamp ? (
            <p className={`px-1 text-[11px] text-slate-500 ${isOwn ? 'text-right' : 'text-left'}`}>
              {formatMessageTime(message.createdAt)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

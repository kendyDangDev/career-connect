'use client';

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatContext } from '@/contexts/ChatContext';

interface AdminChatComposerProps {
  conversationId: string;
}

export function AdminChatComposer({ conversationId }: AdminChatComposerProps) {
  const { sendMessage, startTyping, stopTyping } = useChatContext();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileTypeRef = useRef<'IMAGE' | 'FILE'>('FILE');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      startTyping(conversationId);
    }

    clearTypingTimeout();

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(conversationId);
    }, 1000);
  };

  const resetComposer = () => {
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }

    if (isTyping) {
      setIsTyping(false);
      stopTyping(conversationId);
    }

    clearTypingTimeout();
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    sendMessage(conversationId, trimmedMessage, 'TEXT');
    resetComposer();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleSend();
  };

  const handleTextareaChange = (value: string) => {
    setMessage(value);

    if (value.trim()) {
      handleTyping();
    } else if (isTyping) {
      setIsTyping(false);
      stopTyping(conversationId);
      clearTypingTimeout();
    }
  };

  const handleFileSelect = (type: 'IMAGE' | 'FILE') => {
    fileTypeRef.current = type;

    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'IMAGE' ? 'image/*' : '*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      sendMessage(
        conversationId,
        `${fileTypeRef.current === 'IMAGE' ? 'Image' : 'File'}: ${file.name}`,
        fileTypeRef.current
      );
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t border-slate-200/80 bg-white px-4 py-4">
      <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-2 shadow-lg shadow-slate-200/50">
        <div className="flex items-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-2xl text-slate-500 hover:bg-white hover:text-slate-900"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="rounded-2xl">
              <DropdownMenuItem onClick={() => handleFileSelect('IMAGE')}>Attach image</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileSelect('FILE')}>Attach file</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1 rounded-[22px] border border-white bg-white shadow-sm shadow-slate-200/50">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => {
                handleTextareaChange(event.target.value);
                const element = event.target;
                element.style.height = 'auto';
                element.style.height = `${Math.min(element.scrollHeight, 132)}px`;
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Write an update, share context, or reply to this thread"
              className="min-h-[52px] resize-none border-0 bg-transparent px-4 py-3 text-sm text-slate-900 shadow-none focus-visible:ring-0"
            />
          </div>

          <Button
            type="button"
            onClick={handleSend}
            disabled={!message.trim()}
            className="h-12 rounded-2xl bg-violet-600 px-4 text-white shadow-sm shadow-violet-300/40 hover:bg-violet-700"
          >
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>

        <div className="mt-2 px-2 text-xs text-slate-500">
          Enter to send. Shift + Enter for a new line.
        </div>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

'use client';

import { useChatContext } from '@/contexts/ChatContext';

export type AdminConversation = ReturnType<typeof useChatContext>['conversations'][number];
export type AdminMessage = ReturnType<typeof useChatContext>['messages'][number];
export type AdminOnlineUser = ReturnType<typeof useChatContext>['onlineUsers'][number];
export type AdminTypingUser = ReturnType<typeof useChatContext>['typingUsers'][number];

type ConversationTypeLabel = 'Application' | 'Direct' | 'Group';

type ParticipantUser = AdminConversation['participants'][number]['user'];

export interface AdminConversationMeta {
  title: string;
  subtitle: string;
  supportingText: string;
  avatarUrl?: string | null;
  avatarFallback: string;
  isOnline: boolean;
  typeLabel: ConversationTypeLabel;
  companyName?: string;
  companyLogoUrl?: string | null;
  jobTitle?: string;
  candidateName?: string;
  participantCount: number;
}

function toFullName(user?: ParticipantUser | null) {
  return `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
}

export function getParticipantLabel(user?: ParticipantUser | null) {
  return toFullName(user) || user?.email || 'Unknown user';
}

export function getInitials(value?: string | null) {
  if (!value) {
    return 'CC';
  }

  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return value.slice(0, 2).toUpperCase();
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

export function getOtherParticipant(conversation: AdminConversation, currentUserId?: string | null) {
  return conversation.participants.find((participant) => participant.userId !== currentUserId) ?? null;
}

export function getCandidateParticipant(
  conversation: AdminConversation,
  currentUserId?: string | null
) {
  return (
    conversation.participants.find(
      (participant) =>
        participant.user.userType === 'CANDIDATE' && participant.userId !== currentUserId
    ) ?? null
  );
}

export function getConversationTypeLabel(type: AdminConversation['type']): ConversationTypeLabel {
  if (type === 'APPLICATION_RELATED') {
    return 'Application';
  }

  if (type === 'GROUP') {
    return 'Group';
  }

  return 'Direct';
}

export function getConversationLastMessage(conversation: AdminConversation) {
  return conversation.messages[0] ?? null;
}

export function getConversationPreview(conversation: AdminConversation) {
  const lastMessage = getConversationLastMessage(conversation);

  if (!lastMessage) {
    return 'No messages yet';
  }

  if (lastMessage.type === 'SYSTEM') {
    return lastMessage.content;
  }

  if (lastMessage.type === 'IMAGE') {
    return 'Image attachment';
  }

  if (lastMessage.type === 'FILE') {
    return 'File attachment';
  }

  return lastMessage.content;
}

export function formatConversationTime(value?: Date | string | null) {
  if (!value) {
    return '';
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return '';
  }

  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const diffInHours = diff / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (diffInHours < 24) {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (diffInHours < 24 * 7) {
    return timestamp.toLocaleDateString('en-US', { weekday: 'short' });
  }

  return timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatMessageTime(value: Date | string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateDivider(value: Date | string) {
  return new Date(value).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function shouldShowDateDivider(
  currentMessage: AdminMessage,
  previousMessage?: AdminMessage | null
) {
  if (!previousMessage) {
    return true;
  }

  const currentDate = new Date(currentMessage.createdAt);
  const previousDate = new Date(previousMessage.createdAt);

  return currentDate.toDateString() !== previousDate.toDateString();
}

export function getConversationMeta(
  conversation: AdminConversation,
  currentUserId?: string | null,
  onlineUsers: AdminOnlineUser[] = []
): AdminConversationMeta {
  const companyName =
    conversation.application?.job?.company?.companyName ||
    conversation.job?.company?.companyName ||
    undefined;
  const companyLogoUrl =
    conversation.application?.job?.company?.logoUrl ||
    conversation.job?.company?.logoUrl ||
    undefined;
  const jobTitle = conversation.application?.job?.title || conversation.job?.title || undefined;
  const candidateParticipant = getCandidateParticipant(conversation, currentUserId);
  const candidateName = candidateParticipant ? getParticipantLabel(candidateParticipant.user) : undefined;

  if (conversation.type === 'APPLICATION_RELATED') {
    const onlineUserId = candidateParticipant?.userId;
    const isOnline = onlineUsers.some((user) => user.userId === onlineUserId);
    const title = jobTitle || conversation.name || 'Application thread';
    const subtitle = companyName || 'Hiring conversation';
    const supportingText = candidateName
      ? `Candidate: ${candidateName}`
      : `${conversation.participants.length} participants`;

    return {
      title,
      subtitle,
      supportingText,
      avatarUrl: companyLogoUrl || candidateParticipant?.user.avatarUrl,
      avatarFallback: getInitials(companyName || candidateName || title),
      isOnline,
      typeLabel: 'Application',
      companyName,
      companyLogoUrl,
      jobTitle: title,
      candidateName,
      participantCount: conversation.participants.length,
    };
  }

  if (conversation.type === 'DIRECT') {
    const otherParticipant = getOtherParticipant(conversation, currentUserId);
    const otherName = otherParticipant ? getParticipantLabel(otherParticipant.user) : 'Direct message';
    const isOnline = onlineUsers.some((user) => user.userId === otherParticipant?.userId);
    const subtitleMap: Record<string, string> = {
      CANDIDATE: 'Candidate',
      EMPLOYER: 'Employer',
      ADMIN: 'Admin',
    };
    const subtitle =
      (otherParticipant?.user.userType && subtitleMap[otherParticipant.user.userType]) ||
      'Direct conversation';

    return {
      title: otherName,
      subtitle,
      supportingText: otherParticipant?.user.email || 'Private thread',
      avatarUrl: otherParticipant?.user.avatarUrl,
      avatarFallback: getInitials(otherName),
      isOnline,
      typeLabel: 'Direct',
      participantCount: conversation.participants.length,
    };
  }

  const title = conversation.name || 'Group conversation';
  const subtitle = `${conversation.participants.length} participants`;
  const participantNames = conversation.participants
    .filter((participant) => participant.userId !== currentUserId)
    .slice(0, 3)
    .map((participant) => getParticipantLabel(participant.user));

  return {
    title,
    subtitle,
    supportingText: participantNames.join(', ') || 'Shared conversation',
    avatarFallback: getInitials(title),
    isOnline: false,
    typeLabel: 'Group',
    participantCount: conversation.participants.length,
  };
}

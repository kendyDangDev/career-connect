'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, MessageCircle, Plus, Send, Wifi, WifiOff, User, Clock } from 'lucide-react';

export default function ChatDemo() {
  const { data: session } = useSession();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    onlineUsers,
    isConnected,
    isLoading,
    createConversation,
    loadConversations,
  } = useChatContext();

  const [newMessage, setNewMessage] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [conversationName, setConversationName] = useState('');

  const handleSendMessage = () => {
    if (!activeConversation || !newMessage.trim()) return;

    sendMessage(activeConversation.id, newMessage, 'TEXT');
    setNewMessage('');
  };

  const handleCreateConversation = async () => {
    if (!participantId.trim()) return;

    const conversation = await createConversation(
      [participantId],
      'DIRECT',
      conversationName || undefined
    );

    if (conversation) {
      setActiveConversation(conversation);
      setParticipantId('');
      setConversationName('');
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Chat Demo</CardTitle>
            <CardDescription>Please sign in to access the chat demo</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/auth/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  Chat Demo - CareerConnect
                </CardTitle>
                <CardDescription>Realtime chat system demonstration</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? 'default' : 'destructive'}>
                  {isConnected ? (
                    <>
                      <Wifi className="mr-1 h-3 w-3" />
                      Connected
                    </>
                  ) : (
                    <>
                      <WifiOff className="mr-1 h-3 w-3" />
                      Disconnected
                    </>
                  )}
                </Badge>
                <Badge variant="outline">
                  <User className="mr-1 h-3 w-3" />
                  {session.user?.firstName || session.user?.name || 'User'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            {/* Create Conversation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-4 w-4" />
                  Create Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Participant ID"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                />
                <Input
                  placeholder="Conversation Name (optional)"
                  value={conversationName}
                  onChange={(e) => setConversationName(e.target.value)}
                />
                <Button
                  onClick={handleCreateConversation}
                  disabled={!participantId.trim() || isLoading}
                  className="w-full"
                >
                  Create Conversation
                </Button>
              </CardContent>
            </Card>

            {/* Online Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-4 w-4" />
                  Online Users ({onlineUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {onlineUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">No users online</p>
                ) : (
                  <div className="space-y-2">
                    {onlineUsers.map((user) => (
                      <div key={user.socketId} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm">{user.userInfo.name || 'Unknown User'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversations List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-4 w-4" />
                  Conversations ({conversations.length})
                </CardTitle>
                <Button
                  onClick={loadConversations}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {conversations.length === 0 ? (
                  <p className="text-sm text-gray-500">No conversations</p>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversation(conv)}
                        className={`cursor-pointer rounded border p-2 transition-colors ${
                          activeConversation?.id === conv.id
                            ? 'border-blue-200 bg-blue-50'
                            : 'hover:bg-gray-50'
                        } `}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {conv.type}
                          </Badge>
                          <span className="text-sm font-medium">
                            {`${conv.firstName} ${conv.lastName}` ||
                              `Conversation ${conv.id.slice(-6)}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {conv.participants.length} participants
                        </p>
                        {conv.lastMessageAt && (
                          <p className="text-xs text-gray-400">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {new Date(conv.lastMessageAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Chat */}
          <div className="lg:col-span-2">
            <Card className="flex h-[600px] flex-col">
              <CardHeader>
                <CardTitle>
                  {activeConversation
                    ? `Chat: ${activeConversation.firstName} ${activeConversation.lastName}`
                    : 'Select a conversation'}
                </CardTitle>
                {activeConversation && (
                  <CardDescription>
                    Participants:{' '}
                    {activeConversation.participants
                      .map((p) => `${p.user.firstName} ${p.user.lastName}`)
                      .join(', ')}
                  </CardDescription>
                )}
              </CardHeader>

              <Separator />

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                {!activeConversation ? (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
                      <p>Select a conversation to start chatting</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === session.user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className="max-w-xs lg:max-w-md">
                          <div
                            className={`rounded-2xl px-3 py-2 ${
                              message.senderId === session.user?.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            } `}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className="mt-1 px-2 text-xs text-gray-500">
                            {message.sender.name ||
                              // `${message.sender?.firstName} ${message.sender?.lastName}` ||
                              'Unknown'}{' '}
                            • {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <Separator />

              {/* Message Input */}
              {activeConversation && (
                <div className="p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

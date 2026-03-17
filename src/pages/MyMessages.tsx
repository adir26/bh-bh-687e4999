import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageBoundary } from '@/components/system/PageBoundary';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useMarkConversationRead,
  type Conversation,
  type ChatMessage,
} from '@/hooks/useChat';
import { cn } from '@/lib/utils';

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (email) return email[0].toUpperCase();
  return '?';
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 86400000 * 7) {
    return d.toLocaleDateString('he-IL', { weekday: 'short' });
  }
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
}

function isImageFile(name: string | null): boolean {
  if (!name) return false;
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
}

// ─── Conversation List ───
function ConversationList({
  conversations,
  selectedId,
  userId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  userId: string;
  onSelect: (c: Conversation) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">הודעות</h2>
      </div>
      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">אין שיחות עדיין</p>
          </div>
        ) : (
          conversations.map(conv => {
            const unread = conv.participant_1 === userId
              ? (conv.unread_count_1 || 0)
              : (conv.unread_count_2 || 0);
            const profile = conv.other_profile;
            const isSelected = conv.id === selectedId;

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 text-right transition-colors hover:bg-muted/50 border-b border-border/50',
                  isSelected && 'bg-muted'
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {getInitials(profile?.full_name, profile?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-sm truncate', unread > 0 && 'font-bold')}>
                      {profile?.full_name || profile?.email || 'משתמש'}
                    </span>
                    {conv.last_message_at && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.last_message_text || 'שיחה חדשה'}
                    </p>
                    {unread > 0 && (
                      <Badge variant="default" className="text-[10px] h-5 min-w-5 px-1.5 rounded-full">
                        {unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </ScrollArea>
    </div>
  );
}

// ─── Chat Window ───
function ChatWindow({
  conversation,
  userId,
  onBack,
  isMobile,
}: {
  conversation: Conversation;
  userId: string;
  onBack?: () => void;
  isMobile: boolean;
}) {
  const { data: messages = [], isLoading } = useConversationMessages(conversation.id);
  const sendMessage = useSendMessage();
  const markRead = useMarkConversationRead();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profile = conversation.other_profile;

  const recipientId = conversation.participant_1 === userId
    ? conversation.participant_2
    : conversation.participant_1;

  // Mark read on open + new messages
  useEffect(() => {
    const unread = conversation.participant_1 === userId
      ? (conversation.unread_count_1 || 0)
      : (conversation.unread_count_2 || 0);
    if (unread > 0) {
      markRead.mutate(conversation.id);
    }
  }, [conversation.id, messages.length]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !file) return;

    setText('');
    const sentFile = file;
    setFile(null);

    await sendMessage.mutateAsync({
      conversationId: conversation.id,
      recipientId,
      content: trimmed,
      file: sentFile || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-3">
        {isMobile && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(profile?.full_name, profile?.email)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">
          {profile?.full_name || profile?.email || 'משתמש'}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className={cn('h-10 rounded-xl', i % 2 === 0 ? 'w-2/3 mr-auto' : 'w-1/2 ml-auto')} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            התחילו שיחה חדשה 💬
          </p>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isMine={msg.sender_id === userId} />
          ))
        )}
      </div>

      {/* File preview */}
      {file && (
        <div className="px-4 py-2 border-t bg-muted/30 flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs truncate flex-1">{file.name}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
            e.target.value = '';
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="הקלד הודעה..."
          className="flex-1 min-h-[40px]"
          dir="rtl"
        />
        <Button
          variant="blue"
          size="icon"
          className="shrink-0"
          onClick={handleSend}
          disabled={sendMessage.isPending || (!text.trim() && !file)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Message Bubble ───
function MessageBubble({ message, isMine }: { message: ChatMessage; isMine: boolean }) {
  return (
    <div className={cn('flex', isMine ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
          isMine
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted rounded-bl-sm'
        )}
      >
        {/* File attachment */}
        {message.file_url && (
          <div className="mb-1.5">
            {isImageFile(message.file_name) ? (
              <img
                src={message.file_url}
                alt={message.file_name || 'image'}
                className="rounded-lg max-h-48 object-cover"
                loading="lazy"
              />
            ) : (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-1.5 text-xs underline',
                  isMine ? 'text-primary-foreground/80' : 'text-primary'
                )}
              >
                <FileText className="h-3.5 w-3.5" />
                {message.file_name || 'קובץ'}
              </a>
            )}
          </div>
        )}

        {/* Text content (skip if it's just the file placeholder) */}
        {message.content && !message.content.startsWith('📎 ') && (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {/* Time + read status */}
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isMine ? 'justify-start' : 'justify-end'
        )}>
          <span className={cn(
            'text-[10px]',
            isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}>
            {new Date(message.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMine && (
            message.status === 'read' ? (
              <CheckCheck className="h-3 w-3 text-primary-foreground/60" />
            ) : (
              <Check className="h-3 w-3 text-primary-foreground/40" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function MyMessages() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: conversations = [], isLoading } = useConversations();
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const handleSelect = (conv: Conversation) => {
    setSelectedConv(conv);
    if (isMobile) setMobileView('chat');
  };

  const handleBack = () => {
    setMobileView('list');
    setSelectedConv(null);
  };

  if (!user) return null;

  return (
    <PageBoundary>
      <div className="h-[calc(100vh-4rem)] bg-background flex" dir="rtl">
        {isLoading ? (
          <div className="flex-1 p-4 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Mobile */}
            {isMobile ? (
              mobileView === 'list' ? (
                <div className="flex-1">
                  <ConversationList
                    conversations={conversations}
                    selectedId={selectedConv?.id || null}
                    userId={user.id}
                    onSelect={handleSelect}
                  />
                </div>
              ) : selectedConv ? (
                <div className="flex-1">
                  <ChatWindow
                    conversation={selectedConv}
                    userId={user.id}
                    onBack={handleBack}
                    isMobile
                  />
                </div>
              ) : null
            ) : (
              /* Desktop */
              <>
                <div className="w-80 border-l flex flex-col">
                  <ConversationList
                    conversations={conversations}
                    selectedId={selectedConv?.id || null}
                    userId={user.id}
                    onSelect={handleSelect}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  {selectedConv ? (
                    <ChatWindow
                      conversation={selectedConv}
                      userId={user.id}
                      isMobile={false}
                    />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>בחרו שיחה כדי להתחיל</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PageBoundary>
  );
}

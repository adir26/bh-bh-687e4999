import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ticketService, TicketMessage } from '@/services/ticketService';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Paperclip, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface TicketChatProps {
  ticketId: string;
  isLocked?: boolean;
}

export function TicketChat({ ticketId, isLocked = false }: TicketChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: () => ticketService.getTicketMessages(ticketId),
    enabled: !!ticketId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!newMessage.trim() && !attachedFile) return;
      return await ticketService.sendTicketMessage(ticketId, newMessage.trim() || undefined, attachedFile || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
      setNewMessage('');
      setAttachedFile(null);
      // Reset file input
      const fileInput = document.getElementById('message-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = ticketService.subscribeToTicketMessages(ticketId, (newMessage) => {
      queryClient.setQueryData(['ticket-messages', ticketId], (old: TicketMessage[] = []) => {
        if (old.find(m => m.id === newMessage.id)) return old;
        return [...old, newMessage];
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [ticketId, queryClient]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages.filter(m => 
        m.sender_id !== user?.id && !m.read_by[user?.id || '']
      );
      
      if (unreadMessages.length > 0) {
        ticketService.markMessagesAsRead(ticketId, unreadMessages.map(m => m.id));
      }
    }
  }, [messages, ticketId, user?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachedFile) return;
    sendMessageMutation.mutate();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    const fileInput = document.getElementById('message-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="max-h-96 overflow-y-auto space-y-4 border rounded-lg p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                const isInternal = message.is_internal;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {isOwn ? 'Me' : 'SP'}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex-1 max-w-[80%] ${isOwn ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {isOwn ? 'You' : 'Support'}
                        </span>
                        {isInternal && (
                          <Badge variant="outline" className="text-xs">
                            Internal
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), 'MMM d, HH:mm')}
                        </span>
                      </div>

                      <div
                        className={`rounded-lg p-3 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.message_text && (
                          <p className="text-sm whitespace-pre-wrap">
                            {message.message_text}
                          </p>
                        )}

                        {message.file_url && (
                          <div className="mt-2 pt-2 border-t border-current/20">
                            <a
                              href={message.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm hover:underline"
                            >
                              <FileText className="h-4 w-4" />
                              {message.file_name}
                              <Download className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        {!isLocked ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Attachment Preview */}
            {attachedFile && (
              <div className="flex items-center justify-between bg-muted p-2 rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{attachedFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeAttachment}
                >
                  ×
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="message-file-input"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('message-file-input')?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={(!newMessage.trim() && !attachedFile) || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              This ticket is closed. No new messages can be sent.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
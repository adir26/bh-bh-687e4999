import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, Paperclip, Download, User } from 'lucide-react';
import { format } from 'date-fns';
import { orderService, OrderMessage } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';

interface OrderChatProps {
  orderId: string;
}

export function OrderChat({ orderId }: OrderChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['order-messages', orderId],
    queryFn: () => orderService.getOrderMessages(orderId),
    refetchInterval: 5000, // Refetch every 5 seconds as fallback
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ messageText, file }: { messageText?: string; file?: File }) =>
      orderService.sendOrderMessage(orderId, messageText, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-messages', orderId] });
      setMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: () => orderService.markMessagesAsRead(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-messages', orderId] });
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when component loads
  useEffect(() => {
    if (messages.length > 0) {
      markAsReadMutation.mutate();
    }
  }, [messages.length]);

  // Real-time subscription
  useEffect(() => {
    const subscription = orderService.subscribeToOrderMessages(orderId, (newMessage) => {
      queryClient.setQueryData(['order-messages', orderId], (old: OrderMessage[] = []) => {
        return [...old, newMessage];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId, queryClient]);

  const handleSendMessage = () => {
    if (!message.trim() && !selectedFile) return;

    sendMessageMutation.mutate({
      messageText: message.trim() || undefined,
      file: selectedFile || undefined
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat
          </CardTitle>
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
    <Card className="flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat
          {messages.filter(m => !m.read_by[user?.id || '']).length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {messages.filter(m => !m.read_by[user?.id || '']).length} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs opacity-75">
                        {isOwn ? 'You' : 'Other'}
                      </span>
                      <span className="text-xs opacity-75">
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                    </div>

                    {/* Message Content */}
                    {msg.message_text && (
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.message_text}
                      </p>
                    )}

                    {/* File Attachment */}
                    {msg.file_url && msg.file_name && (
                      <div className="mt-2 p-2 rounded border border-current/20">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm truncate flex-1">
                            {msg.file_name}
                          </span>
                          <Button
                            size="sm"
                            variant={isOwn ? "secondary" : "outline"}
                            onClick={() => window.open(msg.file_url, '_blank')}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          {/* Selected File Preview */}
          {selectedFile && (
            <div className="mb-3 p-2 bg-muted rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <span className="text-sm truncate">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(selectedFile.size / 1024)} KB)
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={removeSelectedFile}
              >
                ×
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="*/*"
            />
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() && !selectedFile || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
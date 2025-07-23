import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Send, Paperclip, ThumbsUp, ThumbsDown, CheckCircle, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'support';
  timestamp: string;
  type: 'text' | 'image' | 'file';
  fileName?: string;
  fileUrl?: string;
}

interface Conversation {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'closed';
  messages: Message[];
  orderId?: string;
  rating?: 'up' | 'down';
}

const SupportChat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState<Conversation>({
    id: id || 'new',
    title: id === 'new' ? 'שיחה חדשה' : 'בעיה עם הזמנה #12A394',
    status: 'in_progress',
    messages: id === 'new' ? [
      {
        id: 'msg-welcome',
        content: 'שלום! איך אנחנו יכולים לעזור לך היום?',
        sender: 'support',
        timestamp: '10:25',
        type: 'text'
      }
    ] : [
      {
        id: 'msg-001',
        content: 'שלום, יש לי בעיה עם ההזמנה שלי #12A394',
        sender: 'user',
        timestamp: '10:20',
        type: 'text'
      },
      {
        id: 'msg-002',
        content: 'שלום! אני כאן לעזור לך. מה הבעיה שאתה חווה עם ההזמנה?',
        sender: 'support',
        timestamp: '10:22',
        type: 'text'
      },
      {
        id: 'msg-003',
        content: 'המטבח אמור היה להתקבל השבוע אבל עדיין לא הגיע',
        sender: 'user',
        timestamp: '10:23',
        type: 'text'
      },
      {
        id: 'msg-004',
        content: 'אני מבין. תן לי לבדוק עם הספק. אחזור אליך תוך 15 דקות עם עדכון.',
        sender: 'support',
        timestamp: '10:25',
        type: 'text'
      },
      {
        id: 'msg-005',
        content: 'קיבלנו את פנייתך ונחזור אליך בקרוב',
        sender: 'support',
        timestamp: '10:30',
        type: 'text'
      }
    ],
    orderId: id === 'new' ? undefined : 'ORD-001'
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: message.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    setMessage('');

    // Simulate support typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const supportResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        content: 'תודה על ההודעה. אנחנו בודקים ונחזור אליך בהקדם.',
        sender: 'support',
        timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      
      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, supportResponse]
      }));
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'סוג קובץ לא נתמך',
        description: 'אנא העלה קובץ JPG, PNG או PDF',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: 'הקובץ גדול מידי',
        description: 'גודל הקובץ חייב להיות קטן מ-10MB',
        variant: 'destructive'
      });
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: `העלה קובץ: ${file.name}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
      type: file.type.startsWith('image/') ? 'image' : 'file',
      fileName: file.name,
      fileUrl: URL.createObjectURL(file)
    };

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    toast({
      title: 'הקובץ הועלה בהצלחה',
      description: 'הקובץ נשלח לצוות התמיכה'
    });
  };

  const rateSupport = (rating: 'up' | 'down') => {
    setConversation(prev => ({
      ...prev,
      rating
    }));

    toast({
      title: 'תודה על הדירוג!',
      description: 'הדירוג שלך עוזר לנו להשתפר'
    });
  };

  const markAsResolved = () => {
    setConversation(prev => ({
      ...prev,
      status: 'closed'
    }));

    toast({
      title: 'השיחה סומנה כפתורה',
      description: 'תוכל לפתוח שיחה חדשה בכל עת'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'closed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'פתוח';
      case 'in_progress':
        return 'בטיפול';
      case 'closed':
        return 'סגור';
      default:
        return 'לא ידוע';
    }
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/support')}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{conversation.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(conversation.status)}`}>
                {getStatusText(conversation.status)}
              </Badge>
              {conversation.orderId && (
                <span className="text-xs text-gray-500">הזמנה: {conversation.orderId}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {conversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
              }`}
            >
              {msg.type === 'image' && msg.fileUrl && (
                <div className="mb-2">
                  <img 
                    src={msg.fileUrl} 
                    alt={msg.fileName} 
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
              
              {msg.type === 'file' && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">{msg.fileName}</span>
                </div>
              )}
              
              <p className="text-sm">{msg.content}</p>
              <div className={`text-xs mt-1 ${
                msg.sender === 'user' ? 'text-white/80' : 'text-gray-500'
              }`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">התמיכה מקלידה</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action Buttons */}
      {conversation.status === 'in_progress' && (
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => rateSupport('up')}
                className={`rounded-lg ${conversation.rating === 'up' ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rateSupport('down')}
                className={`rounded-lg ${conversation.rating === 'down' ? 'bg-red-50 border-red-200 text-red-700' : ''}`}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={markAsResolved}
              className="text-green-600 border-green-200 hover:bg-green-50 rounded-lg"
            >
              <CheckCircle className="w-4 h-4 ml-1" />
              סמן כפתור
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      {conversation.status !== 'closed' && (
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl border-gray-200 hover:bg-gray-50"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="כתוב הודעה..."
                className="pl-4 pr-12 rounded-xl border-gray-200 focus:border-primary"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
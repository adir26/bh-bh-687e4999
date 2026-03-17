import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/utils/toast';

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_text: string | null;
  last_message_at: string | null;
  unread_count_1: number | null;
  unread_count_2: number | null;
  created_at: string | null;
  other_profile?: { id: string; full_name: string | null; email: string | null };
}

export interface ChatMessage {
  id: string;
  conversation_id: string | null;
  sender_id: string;
  recipient_id: string;
  content: string;
  status: string;
  read_at: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversations', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Fetch other participant profiles
      const otherIds = (data || []).map(c =>
        c.participant_1 === user!.id ? c.participant_2 : c.participant_1
      );
      const uniqueIds = [...new Set(otherIds)];

      let profileMap: Record<string, { id: string; full_name: string | null; email: string | null }> = {};
      if (uniqueIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', uniqueIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
        }
      }

      return (data || []).map(c => ({
        ...c,
        other_profile: profileMap[c.participant_1 === user!.id ? c.participant_2 : c.participant_1]
      })) as Conversation[];
    },
    staleTime: 30_000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  return query;
}

export function useConversationMessages(conversationId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversation-messages', conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId!)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as ChatMessage[];
    },
    staleTime: 10_000,
  });

  // Realtime subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user?.id, queryClient]);

  return query;
}

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      recipientId,
      content,
      file,
    }: {
      conversationId: string;
      recipientId: string;
      content: string;
      file?: File;
    }) => {
      let file_url: string | null = null;
      let file_name: string | null = null;

      if (file && user) {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: signedData } = await supabase.storage
          .from('chat-files')
          .createSignedUrl(filePath, 60 * 60 * 24 * 7);

        file_url = signedData?.signedUrl || filePath;
        file_name = file.name;
      }

      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user!.id,
        recipient_id: recipientId,
        content: content || (file_name ? `📎 ${file_name}` : ''),
        file_url,
        file_name,
      });

      if (error) throw error;
    },
    onError: () => {
      showToast.error('שגיאה בשליחת ההודעה');
    },
  });
}

export function useMarkConversationRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase.rpc('mark_conversation_read', {
        conv_id: conversationId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-conversations'] });
    },
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        other_user_id: otherUserId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
    },
  });
}

export function useUnreadConversationsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-conversations', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, participant_1, participant_2, unread_count_1, unread_count_2')
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`);

      if (error) throw error;

      return (data || []).reduce((count, c) => {
        const unread = c.participant_1 === user!.id
          ? (c.unread_count_1 || 0)
          : (c.unread_count_2 || 0);
        return count + (unread > 0 ? 1 : 0);
      }, 0);
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

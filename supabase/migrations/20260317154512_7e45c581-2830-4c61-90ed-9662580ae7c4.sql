
-- 1. Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count_1 INTEGER DEFAULT 0,
  unread_count_2 INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- 2. Add columns to messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1, participant_2);

-- 3. RPC: get_or_create_conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
  me UUID := auth.uid();
  p1 UUID;
  p2 UUID;
BEGIN
  -- Normalize order so participant_1 < participant_2
  IF me < other_user_id THEN
    p1 := me; p2 := other_user_id;
  ELSE
    p1 := other_user_id; p2 := me;
  END IF;

  SELECT id INTO conv_id FROM conversations
    WHERE participant_1 = p1 AND participant_2 = p2;

  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (p1, p2)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$;

-- 4. RPC: mark_conversation_read
CREATE OR REPLACE FUNCTION public.mark_conversation_read(conv_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  me UUID := auth.uid();
BEGIN
  -- Reset unread count for the caller
  UPDATE conversations
  SET unread_count_1 = CASE WHEN participant_1 = me THEN 0 ELSE unread_count_1 END,
      unread_count_2 = CASE WHEN participant_2 = me THEN 0 ELSE unread_count_2 END
  WHERE id = conv_id
    AND (participant_1 = me OR participant_2 = me);

  -- Mark messages as read
  UPDATE messages
  SET status = 'read', read_at = now()
  WHERE conversation_id = conv_id
    AND recipient_id = me
    AND status != 'read';
END;
$$;

-- 5. Trigger: update conversation on new message
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE conversations
    SET last_message_text = LEFT(NEW.content, 100),
        last_message_at = NEW.created_at,
        unread_count_1 = CASE
          WHEN participant_1 = NEW.recipient_id THEN unread_count_1 + 1
          ELSE unread_count_1
        END,
        unread_count_2 = CASE
          WHEN participant_2 = NEW.recipient_id THEN unread_count_2 + 1
          ELSE unread_count_2
        END
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

-- 6. Storage bucket for chat files
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload chat files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own chat files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'chat-files' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR auth.uid()::text = (storage.foldername(name))[2]
  ));

-- 7. Enable realtime for conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

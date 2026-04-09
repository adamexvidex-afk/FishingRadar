
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT,
  image_url TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own received messages"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid());

CREATE POLICY "Users can delete own messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid());

CREATE INDEX idx_chat_messages_participants ON public.chat_messages(sender_id, receiver_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

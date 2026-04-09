-- Add CHECK constraint on notification type to prevent abuse
ALTER TABLE public.notifications
  ADD CONSTRAINT valid_notification_type
  CHECK (type IN ('like', 'comment', 'friend_request', 'friend_accept'));
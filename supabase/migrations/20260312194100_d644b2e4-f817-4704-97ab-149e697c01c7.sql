-- Allow group chat invitation notifications
ALTER TABLE public.notifications
DROP CONSTRAINT IF EXISTS valid_notification_type;

ALTER TABLE public.notifications
ADD CONSTRAINT valid_notification_type
CHECK (
  type = ANY (
    ARRAY[
      'like'::text,
      'comment'::text,
      'friend_request'::text,
      'friend_accept'::text,
      'group_invite'::text
    ]
  )
);
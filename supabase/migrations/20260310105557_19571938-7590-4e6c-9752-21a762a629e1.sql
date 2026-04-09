
DROP POLICY "Authenticated users can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert notifications as actor"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());


DROP POLICY "Users can view own catches" ON public.catches;

CREATE POLICY "Users can view all catches"
  ON public.catches FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE public.catches ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Allow authenticated users to read public catches from other users
CREATE POLICY "Anyone can view public catches"
ON public.catches FOR SELECT
TO authenticated
USING (is_public = true);
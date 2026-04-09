
-- Add preferred_language to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en';

-- Create ui_translations cache table
CREATE TABLE IF NOT EXISTS public.ui_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code text NOT NULL UNIQUE,
  translations jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Allow anyone to read translations (public data)
ALTER TABLE public.ui_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read translations"
  ON public.ui_translations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can insert/update translations
CREATE POLICY "Service role can manage translations"
  ON public.ui_translations FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

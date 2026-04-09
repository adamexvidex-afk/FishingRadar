
CREATE TABLE public.fish_name_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fish_id uuid REFERENCES public.fish_species(id) ON DELETE CASCADE NOT NULL,
  language_code text NOT NULL,
  translated_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fish_id, language_code)
);

-- Enable RLS
ALTER TABLE public.fish_name_translations ENABLE ROW LEVEL SECURITY;

-- Public read access (fish names are public data)
CREATE POLICY "Anyone can read fish name translations"
  ON public.fish_name_translations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can insert (via edge function)
CREATE POLICY "Service role can insert translations"
  ON public.fish_name_translations
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create index for fast lookups
CREATE INDEX idx_fish_name_translations_lang ON public.fish_name_translations (language_code);

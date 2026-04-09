
ALTER TABLE public.fishing_locations ADD COLUMN IF NOT EXISTS country text DEFAULT 'United States';

-- Set all existing locations to United States
UPDATE public.fishing_locations SET country = 'United States' WHERE country IS NULL OR country = 'United States';

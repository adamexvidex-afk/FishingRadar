ALTER TABLE public.catches 
ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_result jsonb DEFAULT NULL;
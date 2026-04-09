
ALTER TABLE public.profiles ADD COLUMN is_premium boolean NOT NULL DEFAULT false;

-- Mark ~30% of seed users as premium
UPDATE public.profiles SET is_premium = true
WHERE username IS NOT NULL 
AND id IN (
  SELECT id FROM public.profiles 
  WHERE username IS NOT NULL 
  ORDER BY random() 
  LIMIT (SELECT CEIL(COUNT(*) * 0.3) FROM public.profiles WHERE username IS NOT NULL)
);

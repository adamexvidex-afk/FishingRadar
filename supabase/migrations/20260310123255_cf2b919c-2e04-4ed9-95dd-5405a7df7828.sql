-- Add catch stats columns to community_posts for shared catches
ALTER TABLE public.community_posts
  ADD COLUMN catch_length numeric DEFAULT NULL,
  ADD COLUMN catch_weight numeric DEFAULT NULL,
  ADD COLUMN catch_bait text DEFAULT NULL,
  ADD COLUMN catch_water_temp numeric DEFAULT NULL;
-- Add photo_url column to catches
ALTER TABLE public.catches ADD COLUMN IF NOT EXISTS photo_url text DEFAULT NULL;

-- Create storage bucket for catch photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('catch-photos', 'catch-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload to their own folder
CREATE POLICY "Users can upload catch photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'catch-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: anyone can view catch photos (public bucket)
CREATE POLICY "Public can view catch photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'catch-photos');

-- RLS: users can delete their own photos
CREATE POLICY "Users can delete own catch photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'catch-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
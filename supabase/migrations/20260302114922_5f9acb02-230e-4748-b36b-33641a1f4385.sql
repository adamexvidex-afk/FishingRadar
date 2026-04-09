
-- Create storage bucket for fish illustrations
INSERT INTO storage.buckets (id, name, public) VALUES ('fish-illustrations', 'fish-illustrations', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view fish illustrations
CREATE POLICY "Public can view fish illustrations"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fish-illustrations');

-- Allow authenticated users to upload fish illustrations
CREATE POLICY "Authenticated users can upload fish illustrations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fish-illustrations');

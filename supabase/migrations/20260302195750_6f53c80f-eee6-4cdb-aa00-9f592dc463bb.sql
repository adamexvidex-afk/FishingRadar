DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can update own catch photos'
  ) THEN
    CREATE POLICY "Users can update own catch photos"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'catch-photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
      bucket_id = 'catch-photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END
$$;
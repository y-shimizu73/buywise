-- Owned item images: column + Supabase Storage bucket
-- Run in Supabase SQL Editor if schema.sql was already applied

ALTER TABLE owned_items
  ADD COLUMN IF NOT EXISTS image_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('owned-item-images', 'owned-item-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own item images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'owned-item-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own item images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'owned-item-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own item images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'owned-item-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own item images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'owned-item-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

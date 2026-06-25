-- Add product URL to considering items
-- Run in Supabase SQL Editor if schema.sql was already applied

ALTER TABLE considering_items
  ADD COLUMN IF NOT EXISTS product_url TEXT;

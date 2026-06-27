-- Recategorize: merge wallet into bag, subdivide gadget
-- Run in Supabase SQL Editor if schema.sql was already applied.
--
-- Notes:
-- - Postgres cannot easily drop enum values, so 'wallet' remains a valid
--   (but unused) enum value after this migration. All 'wallet' rows are
--   moved to 'bag'.
-- - Existing 'gadget' rows are kept as 'gadget' ("その他ガジェット").

-- 1. Add the new gadget subdivision values.
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'phone';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'computer';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'audio';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'camera';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'wearable';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'game';

-- 2. Merge wallet into bag for existing rows.
--    (Run after the ADD VALUE statements above have been committed.)
UPDATE owned_items SET category = 'bag' WHERE category = 'wallet';
UPDATE considering_items SET category = 'bag' WHERE category = 'wallet';

-- 3. Refresh the categories reference table.
DELETE FROM categories;
INSERT INTO categories (id, label_ja, icon) VALUES
  ('bag', 'バッグ・財布', 'bag'),
  ('clothes', '服', 'shirt'),
  ('phone', 'スマホ・タブレット', 'smartphone'),
  ('computer', 'PC・周辺機器', 'laptop'),
  ('audio', 'オーディオ・イヤホン', 'headphones'),
  ('camera', 'カメラ', 'camera'),
  ('wearable', 'ウェアラブル', 'watch'),
  ('game', 'ゲーム', 'gamepad-2'),
  ('gadget', 'その他ガジェット', 'plug'),
  ('car', '車', 'car');

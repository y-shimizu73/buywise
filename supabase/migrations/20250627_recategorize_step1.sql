-- Recategorize STEP 1 of 2 — run this file FIRST, entirely on its own.
-- Adds new gadget subdivision enum values and merges wallet into bag.
--
-- After this finishes successfully, run 20250627_recategorize_step2.sql.
-- (New enum values must be committed before step 2 can use them.)

ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'phone';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'computer';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'audio';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'camera';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'wearable';
ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'game';

UPDATE owned_items SET category = 'bag' WHERE category = 'wallet';
UPDATE considering_items SET category = 'bag' WHERE category = 'wallet';

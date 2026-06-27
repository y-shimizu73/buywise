-- Recategorize STEP 2 of 2 — run this file ONLY AFTER step 1 succeeded.
-- Refreshes the categories reference table with the new enum values.
-- (Optional: the app reads categories from code, not this table.)

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

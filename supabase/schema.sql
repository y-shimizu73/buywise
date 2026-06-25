-- BuyWise Supabase Schema
-- Run this in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE category_type AS ENUM ('wallet', 'bag', 'clothes', 'gadget', 'car');

CREATE TABLE categories (
  id category_type PRIMARY KEY,
  label_ja TEXT NOT NULL,
  icon TEXT NOT NULL
);

INSERT INTO categories (id, label_ja, icon) VALUES
  ('wallet', '財布', 'wallet'),
  ('bag', 'バッグ', 'bag'),
  ('clothes', '服', 'shirt'),
  ('gadget', 'ガジェット', 'smartphone'),
  ('car', '車', 'car');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE owned_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category category_type NOT NULL,
  brand TEXT,
  description TEXT,
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
  purchase_date DATE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE considering_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category category_type NOT NULL,
  brand TEXT,
  description TEXT,
  price NUMERIC(12, 2),
  purchase_reason TEXT,
  product_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  considering_item_id UUID REFERENCES considering_items(id) ON DELETE SET NULL,
  considering_item_name TEXT NOT NULL,
  compatibility_score INTEGER NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  duplication_score INTEGER NOT NULL CHECK (duplication_score >= 0 AND duplication_score <= 100),
  satisfaction_prediction INTEGER NOT NULL CHECK (satisfaction_prediction >= 1 AND satisfaction_prediction <= 5),
  summary TEXT NOT NULL,
  compatibility_analysis TEXT NOT NULL,
  duplication_analysis TEXT NOT NULL,
  satisfaction_analysis TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('buy', 'caution', 'skip')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_owned_items_user_id ON owned_items(user_id);
CREATE INDEX idx_owned_items_category ON owned_items(category);
CREATE INDEX idx_considering_items_user_id ON considering_items(user_id);
CREATE INDEX idx_diagnoses_user_id ON diagnoses(user_id);
CREATE INDEX idx_diagnoses_created_at ON diagnoses(created_at DESC);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE owned_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE considering_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own owned items"
  ON owned_items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own considering items"
  ON considering_items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own diagnoses"
  ON diagnoses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER owned_items_updated_at
  BEFORE UPDATE ON owned_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER considering_items_updated_at
  BEFORE UPDATE ON considering_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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

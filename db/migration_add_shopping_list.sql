-- 買い物リスト機能（材料の自動読み取り・家にある物）用のテーブルとカラムを追加
-- 既存データは変更しない（追加のみ）

-- レシピの読み取り状態と、AI相談用の特徴データ
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS extraction_status VARCHAR(20) NOT NULL DEFAULT 'none', -- none / processing / done / guess / failed
ADD COLUMN IF NOT EXISTS extraction_source VARCHAR(100),                        -- 何から読み取ったか（例: Instagramの投稿文）
ADD COLUMN IF NOT EXISTS extraction_note TEXT,                                  -- AIの補足・失敗理由
ADD COLUMN IF NOT EXISTS extracted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS servings VARCHAR(50),                                  -- 何人分か
ADD COLUMN IF NOT EXISTS features JSONB;                                        -- 特徴（画面には出さない。AI相談で使う）

-- 材料（1行ずつ。例: 豚肉 150g）
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  standard_name VARCHAR(100),          -- AIがそろえた名前（家にある物との照らし合わせ用）。手で書き換えた行はNULL
  is_guess BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id, display_order);

-- 家にある物（ここにある材料は最初からコピー対象外）
CREATE TABLE IF NOT EXISTS pantry_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO pantry_items (name) VALUES
  ('しょうゆ'), ('みりん'), ('酒'), ('砂糖'), ('塩'),
  ('サラダ油'), ('オリーブオイル'), ('ごま油'), ('こしょう'), ('塩こしょう'), ('酢'),
  ('マヨネーズ'), ('ケチャップ'), ('味噌'), ('めんつゆ'), ('ポン酢'),
  ('小麦粉'), ('片栗粉'), ('鶏がらスープの素'), ('コンソメ'), ('顆粒だし')
ON CONFLICT (name) DO NOTHING;

SELECT 'Migration completed: shopping list tables added' AS status;

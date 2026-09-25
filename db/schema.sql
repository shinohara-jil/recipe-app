-- レシピテーブル
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  url TEXT,
  provider VARCHAR(100),
  is_today_menu BOOLEAN NOT NULL DEFAULT FALSE,
  today_menu_set_at TIMESTAMP,
  extraction_status VARCHAR(20) NOT NULL DEFAULT 'none', -- 材料の読み取り状態: none / processing / done / guess / failed
  extraction_source VARCHAR(100),                        -- 何から読み取ったか
  extraction_note TEXT,                                  -- AIの補足・失敗理由
  extracted_at TIMESTAMP,                                -- 最後に読み取りを始めた／終えた時刻
  servings VARCHAR(50),                                  -- 何人分か
  features JSONB,                                        -- 特徴（画面には出さない。AI相談用）
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- カテゴリテーブル
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- レシピカテゴリ中間テーブル
CREATE TABLE IF NOT EXISTS recipe_categories (
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, category_id)
);

-- レシピ画像テーブル
CREATE TABLE IF NOT EXISTS recipe_images (
  id SERIAL PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 材料テーブル（1行ずつ。例: 豚肉 150g）
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  standard_name VARCHAR(100),          -- AIがそろえた名前（家にある物との照らし合わせ用）
  is_guess BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 家にある物テーブル（ここにある材料は最初からコピー対象外）
CREATE TABLE IF NOT EXISTS pantry_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_is_today_menu ON recipes(is_today_menu) WHERE is_today_menu = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipe_categories_recipe_id ON recipe_categories(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_categories_category_id ON recipe_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_recipe_images_recipe_id ON recipe_images(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_images_display_order ON recipe_images(recipe_id, display_order);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id, display_order);

-- デフォルトカテゴリの挿入
INSERT INTO categories (id, name) VALUES
  (1, 'pickup！'),
  (2, '牛肉'),
  (3, '豚肉'),
  (4, '鶏肉'),
  (5, 'その他'),
  (6, 'ホットクック')
ON CONFLICT (name) DO NOTHING;

-- 家にある物の初期値
INSERT INTO pantry_items (name) VALUES
  ('しょうゆ'), ('みりん'), ('酒'), ('砂糖'), ('塩'),
  ('サラダ油'), ('オリーブオイル'), ('ごま油'), ('こしょう'), ('塩こしょう'), ('酢'),
  ('マヨネーズ'), ('ケチャップ'), ('味噌'), ('めんつゆ'), ('ポン酢'),
  ('小麦粉'), ('片栗粉'), ('鶏がらスープの素'), ('コンソメ'), ('顆粒だし')
ON CONFLICT (name) DO NOTHING;

-- レシピテーブル
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  url TEXT,
  provider VARCHAR(100),
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

-- インデックス
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_categories_recipe_id ON recipe_categories(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_categories_category_id ON recipe_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_recipe_images_recipe_id ON recipe_images(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_images_display_order ON recipe_images(recipe_id, display_order);

-- デフォルトカテゴリの挿入
INSERT INTO categories (id, name) VALUES
  (1, 'pickup！'),
  (2, '牛肉'),
  (3, '豚肉'),
  (4, '鶏肉'),
  (5, 'その他'),
  (6, 'ホットクック')
ON CONFLICT (name) DO NOTHING;

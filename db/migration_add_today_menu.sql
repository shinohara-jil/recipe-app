-- 既存のrecipesテーブルに今日のメニュー機能用のカラムを追加

-- カラム追加
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_today_menu BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS today_menu_set_at TIMESTAMP;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_recipes_is_today_menu ON recipes(is_today_menu) WHERE is_today_menu = TRUE;

-- 完了メッセージ
SELECT 'Migration completed: today_menu columns added' AS status;

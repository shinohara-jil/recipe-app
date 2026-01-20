# データベースセットアップ手順

## 1. Neonアカウントの作成とプロジェクトセットアップ

1. [Neon](https://neon.tech/)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. データベース名を設定（例: `recipe-app`）
4. リージョンを選択（日本から近い場合は `Asia Pacific (Singapore)` を推奨）

## 2. 接続文字列の取得

1. Neonのダッシュボードで「Connection Details」を開く
2. 接続文字列（Connection String）をコピー
   - 形式: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

## 3. 環境変数の設定

1. プロジェクトルートに `.env.local` ファイルを作成
2. 以下の内容を追加:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

3. 実際の接続文字列に置き換える

## 4. スキーマの作成

### 方法1: Neon SQL Editorを使用（推奨）

1. Neonのダッシュボードで「SQL Editor」を開く
2. `schema.sql` の内容をコピー&ペースト
3. 実行ボタンをクリック

### 方法2: psqlコマンドを使用

```bash
psql "postgresql://[user]:[password]@[host]/[database]?sslmode=require" < db/schema.sql
```

## 5. 確認

スキーマが正しく作成されたか確認:

```sql
-- テーブル一覧を確認
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- カテゴリが正しく挿入されているか確認
SELECT * FROM categories;
```

## テーブル構造

### recipes
- `id`: UUID (主キー)
- `title`: レシピタイトル
- `url`: レシピURL
- `image_url`: 画像URL（任意）
- `created_at`: 作成日時
- `updated_at`: 更新日時

### categories
- `id`: SERIAL (主キー)
- `name`: カテゴリ名
- `created_at`: 作成日時

### recipe_categories
- `recipe_id`: レシピID（外部キー）
- `category_id`: カテゴリID（外部キー）
- 複合主キー

## 初期データ

以下の6つのカテゴリが自動的に作成されます:
1. pickup！
2. 牛肉
3. 豚肉
4. 鶏肉
5. その他
6. ホットクック

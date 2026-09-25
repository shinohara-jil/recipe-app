# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

レシピ管理Webアプリ。カード形式でレシピを表示し、カテゴリ・提供者・フリーワードで絞り込みできる。

**技術スタック:** Next.js 16 (App Router) / React 19 / TypeScript 5 / Tailwind CSS 4 / Neon PostgreSQL / Vercel Blob Storage / Vercel デプロイ

## 開発コマンド

```bash
npm install          # 依存関係インストール
npm run dev          # 開発サーバー起動 → http://localhost:3000
npm run build        # ビルド確認
```

## 環境変数（.env.local）

- `DATABASE_URL` - Neon PostgreSQL接続文字列（未設定時はモックデータ使用）
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage トークン
- `GEMINI_API_KEY` - Google Gemini の鍵（材料の自動読み取り）
- `AI_PASSCODE` - AI機能の合言葉（家族だけが使えるようにする）

## アーキテクチャ

### データフロー

全レシピをページ読み込み時に一括取得し、クライアント側で絞り込み・ソートする設計。

`page.tsx` の `filteredRecipes` で4段階のフィルタリングを実行:
1. **フリーワード検索** - タイトルの部分一致（`searchQuery`）
2. **カテゴリフィルタ** - AND条件: 選択した全カテゴリを含むレシピのみ（`selectedCategories`）
3. **提供者フィルタ** - 長谷川あかり / もも / その他（`selectedProvider`）
4. **ソート** - 今日のメニューを最上部、その後は作成日時降順

### 主要な状態管理（page.tsx）

すべてのアプリ状態は `page.tsx` の `useState` で管理。Context/Redux は未使用。

### API ルート

| エンドポイント | メソッド | 機能 |
|---|---|---|
| `/api/recipes` | GET | レシピ一覧取得 |
| `/api/recipes` | POST | レシピ新規登録 |
| `/api/recipes/[id]` | PUT | レシピ編集 |
| `/api/recipes/[id]/today-menu` | PUT/DELETE | 今日のメニュー設定/解除 |
| `/api/categories` | GET/POST | カテゴリ一覧取得/新規追加 |
| `/api/categories/[id]` | PUT/DELETE | カテゴリ編集/削除 |
| `/api/upload` | POST | 画像アップロード（multipart/form-data） |
| `/api/recipes/[id]/extract` | POST/GET | 材料の読み取り開始（要合言葉。`after()` で裏処理）/ 状態確認 |
| `/api/recipes/[id]/ingredients` | PUT | 材料を手で直したときの保存（丸ごと置き換え） |
| `/api/pantry` | GET/POST | 家にある物の一覧/追加 |
| `/api/pantry/[id]` | DELETE | 家にある物から外す |
| `/api/ai-auth` | GET/POST | 合言葉の確認（合えば30日有効のクッキー） |

### 材料の自動読み取り（app/lib/extraction/）

- 読む順番: URLを先に読み、推測しかできない／読めないときは登録画像を読む（`extract.ts`）
- X は埋め込み用の入口、Instagram はリンクプレビュー用の説明文、レシピサイトは構造化データ（JSON-LD）を優先（`sources.ts`）。X・Instagram は非公式な方法なので、急に読めなくなることがある
- AI は Gemini（`gemini-3.8-flash`、Interactions API、`store: false`）。材料と一緒に「特徴」も作り `recipes.features` に保存（画面には出さない。AI相談用）
- 材料は1行の文字で持つ。家にある物との照らし合わせは `standard_name`（AIがそろえた名前）、無ければ `nameOf()`（`app/lib/ingredients.ts`）で取り出した材料名で完全一致
- 登録済みレシピの一括読み取り: `npx tsx --env-file=.env.local scripts/extract_recipes.ts`（.env.local のDBを直接）、または `node --env-file=.env.local scripts/extract_via_api.mjs <アプリのURL>`（公開中のアプリ経由。本番用）

### データベース（db/schema.sql）

**recipes テーブル:**
- `id` (UUID, PK), `title` (VARCHAR, 必須), `url` (TEXT, 任意), `provider` (VARCHAR 100, 任意)
- `is_today_menu` (BOOLEAN), `today_menu_set_at` (TIMESTAMP)
- `created_at`, `updated_at`

**categories テーブル:** デフォルトカテゴリ ID 1-6（pickup！, 牛肉, 豚肉, 鶏肉, その他, ホットクック）

**recipe_categories:** 多対多の中間テーブル

**recipe_images:** `image_url` + `display_order` で画像管理

**recipes の読み取り関連カラム:** `extraction_status`（none / processing / done / guess / failed）、`extraction_source`、`extraction_note`、`extracted_at`、`servings`、`features`（JSONB）。processing のまま5分たったものは一覧で failed 扱い

**recipe_ingredients:** 材料1行ずつ（`text`、`standard_name`、`is_guess`、`display_order`）

**pantry_items:** 家にある物（`name` UNIQUE）

DB変更は `db/migration_*.sql` に書き、`node --env-file=.env.local scripts/run_migration.mjs <ファイル>` で反映

### 型定義（app/types/recipe.ts）

```typescript
interface Recipe {
  id: string;
  title: string;
  url?: string;
  provider?: string;
  imageUrls?: string[];
  categories: Category[];
  createdAt: Date;
  isTodayMenu: boolean;
  todayMenuSetAt?: Date;
  ingredients: Ingredient[];        // { text, standardName?, isGuess }
  servings?: string | null;
  extractionStatus: ExtractionStatus;
  extractionSource?: string | null;
}
```

## 重要な制約

### Neon SQL はテンプレートリテラル専用

```typescript
// 正しい
await sql`SELECT * FROM recipes WHERE id = ${id}`;

// 間違い（TypeScriptエラー）
await sql(`SELECT * FROM recipes WHERE id = ${id}`);
```

### カテゴリ色の管理

`app/lib/categoryColors.ts` にカテゴリIDと色のマッピングを定義。カテゴリ追加時はここにも色定義を追加すること。

### モバイル対応の注意

- モバイルファースト設計（Tailwind のデフォルト → sm → md → lg）
- `<input>` の文字サイズは `text-base`（16px）以上にすること（iOS Safari の自動ズーム防止）

### 今日のメニュー自動解除

`page.tsx` の `useEffect` で1分ごとにチェックし、午前0時を超えたら `is_today_menu` を自動解除する。

## よくある変更パターン

### レシピに新しいフィールドを追加する場合

1. `db/schema.sql` にカラム追加
2. `app/types/recipe.ts` の Recipe 型を更新
3. `app/api/recipes/route.ts` の GET/POST を更新
4. `app/api/recipes/[id]/route.ts` の PUT を更新
5. コンポーネント（RecipeCard, RecipeModal）を更新

### カテゴリを追加する場合

DB に INSERT 後、`app/lib/categoryColors.ts` に色定義を追加。

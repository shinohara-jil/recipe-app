# CLAUDE.md - レシピ管理アプリ開発ガイド

このドキュメントは、Claude（AI開発アシスタント）が効率的に開発を進めるための技術リファレンスです。

## 📋 プロジェクト概要

レシピ管理Webアプリケーション。カード形式でレシピを表示し、カテゴリでフィルタリングできます。

### 主要機能
- レシピの登録・表示
- 複数カテゴリでのタグ付け
- カテゴリフィルタリング（複数選択可能）
- 複数画像のアップロードとスライダー表示
- 画像クリックで拡大表示（モーダル）
- カードクリックで詳細をインライン展開
- レスポンシブデザイン（モバイル対応）

### 技術スタック

```
Frontend:
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4

Backend:
- Next.js API Routes
- Neon PostgreSQL (serverless)

Storage:
- Vercel Blob Storage (画像保存)

Deploy:
- Vercel
```

---

## 🏗️ アーキテクチャ

### ディレクトリ構造

```
recipe-app/
├── app/
│   ├── api/                    # API Routes
│   │   ├── categories/         # カテゴリAPI
│   │   │   └── route.ts
│   │   ├── recipes/            # レシピAPI
│   │   │   └── route.ts
│   │   └── upload/             # 画像アップロードAPI
│   │       └── route.ts
│   ├── components/             # Reactコンポーネント
│   │   ├── CategoryFilter.tsx  # カテゴリフィルター
│   │   ├── ImageModal.tsx      # 画像拡大表示モーダル
│   │   ├── RecipeCard.tsx      # レシピカード
│   │   └── RecipeModal.tsx     # レシピ登録モーダル
│   ├── lib/                    # ユーティリティ
│   │   ├── categoryColors.ts   # カテゴリ色定義
│   │   ├── db.ts               # DB接続
│   │   └── mockData.ts         # モックデータ
│   ├── types/                  # TypeScript型定義
│   │   └── recipe.ts
│   ├── layout.tsx              # レイアウト
│   └── page.tsx                # トップページ
├── db/
│   └── schema.sql              # データベーススキーマ
├── DB_SETUP_GUIDE.md           # DB詳細セットアップガイド
├── DEPLOYMENT.md               # デプロイ手順書
└── CLAUDE.md                   # このファイル
```

---

## 🗄️ データベース設計

### ER図（概念）

```
recipes (レシピ)
  ├── id (UUID, PK)
  ├── title (VARCHAR)
  ├── url (TEXT, NULLABLE)
  ├── created_at (TIMESTAMP)
  └── updated_at (TIMESTAMP)

categories (カテゴリ)
  ├── id (SERIAL, PK)
  ├── name (VARCHAR, UNIQUE)
  └── created_at (TIMESTAMP)

recipe_categories (中間テーブル)
  ├── recipe_id (UUID, FK → recipes.id)
  └── category_id (INT, FK → categories.id)

recipe_images (画像)
  ├── id (SERIAL, PK)
  ├── recipe_id (UUID, FK → recipes.id)
  ├── image_url (TEXT)
  ├── display_order (INT)
  └── created_at (TIMESTAMP)
```

### テーブル詳細

#### recipes
- `id`: UUID主キー（自動生成）
- `title`: レシピタイトル（必須）
- `url`: レシピURL（**任意** - 2026/01/20に必須から変更）
- `created_at`: 作成日時（自動設定）
- `updated_at`: 更新日時（自動設定）

#### categories
固定カテゴリ（ID固定）:
```sql
1: 'pickup！'
2: '牛肉'
3: '豚肉'
4: '鶏肉'
5: 'その他'
6: 'ホットクック'
```

#### recipe_images
- `display_order`: 画像の表示順序（0から開始）
- Blob Storage URLを保存

---

## 🔌 API仕様

### GET /api/categories
カテゴリ一覧を取得

**Response:**
```json
[
  { "id": 1, "name": "pickup！" },
  { "id": 2, "name": "牛肉" }
]
```

### GET /api/recipes
レシピ一覧を取得

**Query Parameters:**
- `categoryId` (optional): カテゴリIDでフィルタ

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "レシピ名",
    "url": "https://...",  // nullable
    "created_at": "2024-01-20T...",
    "updated_at": "2024-01-20T...",
    "categories": [
      { "id": 1, "name": "pickup！" }
    ],
    "image_urls": [
      "https://blob.vercel-storage.com/...",
      "https://blob.vercel-storage.com/..."
    ]
  }
]
```

### POST /api/recipes
レシピを新規登録

**Request Body:**
```json
{
  "title": "レシピ名",
  "url": "https://...",  // optional
  "categoryIds": [1, 2],
  "imageUrls": [
    "https://blob.vercel-storage.com/..."
  ]
}
```

**Validation:**
- `title`: 必須
- `categoryIds`: 必須、1つ以上
- `url`: **任意**（空文字列も許容）
- `imageUrls`: 任意

### POST /api/upload
画像をBlobにアップロード

**Request:**
- `Content-Type: multipart/form-data`
- `file`: 画像ファイル

**Response:**
```json
{
  "url": "https://blob.vercel-storage.com/..."
}
```

---

## 🎨 コンポーネント設計

### page.tsx（メインページ）
役割: 状態管理とレイアウト

**State:**
- `recipes`: Recipe[]
- `categories`: Category[]
- `selectedCategories`: number[]
- `expandedRecipeId`: string | null
- `isModalOpen`: boolean

**主要ロジック:**
- レシピ・カテゴリのフェッチ
- カテゴリフィルタリング
- レシピ登録時の画像アップロード処理

### RecipeCard.tsx
役割: レシピカードの表示と画像スライダー

**Props:**
- `recipe`: Recipe
- `onClick`: () => void
- `isExpanded`: boolean

**State:**
- `currentImageIndex`: number（スライダー用）
- `showImageModal`: boolean（モーダル制御）
- `modalImageIndex`: number（モーダルの初期画像）

**機能:**
- カードクリックで詳細展開
- 複数画像の場合、前後ボタンで切替
- 画像クリックでモーダル表示

**重要な実装ポイント:**
- `e.stopPropagation()` でイベント伝播を防止
- スライダーボタンは `hasMultipleImages` の場合のみ表示

### ImageModal.tsx
役割: 画像のフルスクリーン表示

**Props:**
- `images`: string[]
- `initialIndex`: number
- `onClose`: () => void

**機能:**
- 画像の拡大表示
- 前後ボタンで画像切替
- キーボード操作（←→で切替、Escで閉じる）
- 背景クリックで閉じる

### RecipeModal.tsx
役割: レシピ登録フォーム

**State:**
- `title`, `url`, `selectedCategories`, `imageFiles`, `imagePreviews`

**機能:**
- フォーム入力
- 複数画像プレビュー
- バリデーション（タイトル・カテゴリ必須）

### CategoryFilter.tsx
役割: カテゴリフィルターボタン群

**Props:**
- `categories`: Category[]
- `selectedCategories`: number[]
- `onToggleCategory`: (id: number) => void

**機能:**
- 複数カテゴリ選択
- 選択状態でカラー変化

---

## 🎨 スタイリング

### カテゴリカラー（categoryColors.ts）

```typescript
1: 'bg-orange-500 text-white'      // pickup！
2: 'bg-red-500 text-white'         // 牛肉
3: 'bg-pink-500 text-white'        // 豚肉
4: 'bg-yellow-500 text-white'      // 鶏肉
5: 'bg-gray-500 text-white'        // その他
6: 'bg-purple-500 text-white'      // ホットクック
```

### レスポンシブブレークポイント

```css
/* Mobile first */
default: モバイル
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

グリッドレイアウト:
```tsx
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start
```

---

## 🛠️ 開発ワークフロー

### ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
# → http://localhost:3000

# ビルド確認
npm run build
npm run start
```

### 環境変数（.env.local）

```bash
# Neon PostgreSQL（本番接続時）
DATABASE_URL=postgresql://...

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

**注意:**
- `DATABASE_URL` が未設定の場合、モックデータを使用
- `.env.local` は `.gitignore` に含まれている

### Git ワークフロー

```bash
# 変更をコミット
git add .
git commit -m "機能追加: XXXを実装

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# プッシュ（Vercelに自動デプロイ）
git push
```

---

## 📝 よくある変更パターン

### 1. カテゴリを追加する

**データベース:**
```sql
-- Neon SQL Editorで実行
INSERT INTO categories (name) VALUES ('新カテゴリ名');
```

**コード:**
- `app/lib/categoryColors.ts` に色を追加
```typescript
export function getCategoryColor(categoryId: number): string {
  const colors: Record<number, string> = {
    // ...既存の色定義
    7: 'bg-green-500 text-white',  // 新カテゴリ
  };
  return colors[categoryId] || 'bg-gray-400 text-white';
}
```

### 2. レシピに新しいフィールドを追加

**手順:**
1. `db/schema.sql` を更新
```sql
ALTER TABLE recipes ADD COLUMN cooking_time INTEGER;
```

2. `app/types/recipe.ts` を更新
```typescript
export interface Recipe {
  // ...既存のフィールド
  cookingTime?: number;
}
```

3. `app/api/recipes/route.ts` を更新（GET/POST両方）
```typescript
// GET
SELECT r.cooking_time, ...

// POST
INSERT INTO recipes (title, url, cooking_time)
VALUES (${title}, ${url}, ${cookingTime})
```

4. コンポーネントを更新（RecipeCard, RecipeModal）

### 3. 画像サイズ制限を変更

**現在:** 制限なし（Vercel Blobのデフォルト）

**変更方法:**
`app/api/upload/route.ts` にバリデーションを追加:
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json(
    { error: 'File size exceeds 5MB' },
    { status: 400 }
  );
}
```

### 4. 検索機能を追加

**手順:**
1. `page.tsx` に検索state追加
```typescript
const [searchQuery, setSearchQuery] = useState('');
```

2. フィルタリングロジック拡張
```typescript
const filteredRecipes = recipes.filter(recipe => {
  const matchesCategory = ...
  const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
  return matchesCategory && matchesSearch;
});
```

3. 検索UIコンポーネント追加

### 5. レシピ削除機能を追加

**API追加:**
`app/api/recipes/[id]/route.ts` を作成:
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 画像削除（Blob Storage）
  const images = await sql`
    SELECT image_url FROM recipe_images WHERE recipe_id = ${id}
  `;
  for (const img of images) {
    await del(img.image_url);
  }

  // レシピ削除（CASCADE で関連データも削除）
  await sql`DELETE FROM recipes WHERE id = ${id}`;

  return NextResponse.json({ success: true });
}
```

**コンポーネント:**
RecipeCardに削除ボタン追加:
```tsx
<button onClick={() => handleDelete(recipe.id)}>
  削除
</button>
```

---

## 🔍 デバッグTips

### 1. データベースクエリ確認

Neon SQL Editorでクエリを直接実行:
```sql
-- レシピとカテゴリのリレーション確認
SELECT
  r.id, r.title,
  json_agg(c.name) as categories
FROM recipes r
LEFT JOIN recipe_categories rc ON r.id = rc.recipe_id
LEFT JOIN categories c ON rc.category_id = c.id
GROUP BY r.id;

-- 画像の確認
SELECT * FROM recipe_images ORDER BY recipe_id, display_order;
```

### 2. API レスポンス確認

ブラウザDevTools → Network タブ:
- `api/recipes` の Response を確認
- Status Code を確認（200, 400, 500）

### 3. Vercel ログ確認

Vercel Dashboard → Deployments → Functions:
- `console.log()` の出力を確認
- エラースタックトレースを確認

### 4. ローカルでのデバッグ

```typescript
// page.tsx などに追加
console.log('Recipes:', recipes);
console.log('Filtered:', filteredRecipes);
```

---

## ⚠️ 重要な制約・仕様

### 1. SQL クエリの書き方

**正しい:**
```typescript
await sql`SELECT * FROM recipes WHERE id = ${id}`;
```

**間違い:**
```typescript
const query = `SELECT * FROM recipes WHERE id = ${id}`;
await sql(query);  // ❌ TypeScriptエラー
```

**理由:** `@neondatabase/serverless` はテンプレートリテラル形式のみサポート

### 2. 画像の取り扱い

- Blob Storage URLは永続的
- 削除する場合は `del(url)` を使用
- 画像は `display_order` で並び替え

### 3. URLフィールド

- **任意項目**（2026/01/20に変更）
- `null` または空文字列を許容
- 表示時は `recipe.url &&` で条件分岐

### 4. カテゴリID

- 固定ID（1-6）を使用
- 新規追加時はIDを確認してから色定義を追加

### 5. レスポンシブ対応

- モバイルファースト設計
- グリッドは `items-start` を指定（カード高さ不揃い対応）
- モーダルは `max-h-[90vh]` でスクロール可能に

---

## 🚀 パフォーマンス最適化

### 画像最適化

Next.js Image コンポーネント使用:
```tsx
<Image
  src={imageUrl}
  alt="..."
  fill
  className="object-cover"
/>
```

### データベースクエリ

- インデックスが設定済み（`db/schema.sql` 参照）
- `json_agg` で1クエリで関連データ取得

### Vercel自動最適化

- 静的生成（Static Generation）
- エッジキャッシング
- 画像自動最適化

---

## 🐛 トラブルシューティング

### 問題: Hydration Error

**原因:** サーバーとクライアントのHTML不一致

**解決:**
- `'use client'` ディレクティブを確認
- `useEffect` で初期化が必要な場合は使用

### 問題: 画像が表示されない

**確認事項:**
1. `BLOB_READ_WRITE_TOKEN` が設定されているか
2. Blob Storage URLが有効か（ブラウザで直接開いてみる）
3. `recipe.imageUrls` が配列として正しく取得できているか

### 問題: TypeScript エラー

**よくあるエラー:**
- `sql` is not callable → テンプレートリテラル使用
- Property does not exist → 型定義を確認（`types/recipe.ts`）

### 問題: Neon接続タイムアウト

**原因:** 無料プランはスリープする

**解決:**
- 初回アクセスは30秒待つ
- 頻繁にアクセスすれば高速化

---

## 📚 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🎯 今後の拡張案

以下は実装されていないが、追加検討可能な機能:

1. **レシピ編集機能** - 既存レシピの修正
2. **レシピ削除機能** - 不要なレシピの削除
3. **検索機能** - タイトルでの検索
4. **並び替え** - 作成日、タイトルでソート
5. **お気に入り機能** - 特定レシピをピン留め
6. **タグ機能** - カテゴリ以外の自由タグ
7. **レシピ詳細ページ** - 材料・手順の詳細入力
8. **印刷機能** - レシピを印刷用レイアウトで表示
9. **共有機能** - URLで特定レシピを共有
10. **認証機能** - ユーザーごとにレシピ管理

---

**最終更新:** 2026-01-20
**バージョン:** 1.0.0

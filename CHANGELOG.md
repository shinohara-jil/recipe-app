# 変更履歴

## 2026-01-28 - 今日のメニュー機能追加

### 追加機能
- **今日のメニュー設定**
  - レシピを「今日のメニュー」として1つ選択可能
  - レシピカードに星型トグルボタンを追加
  - 設定したレシピには「今日のメニュー」バッジを表示（オレンジ→ピンクのグラデーション）

### 機能詳細
- **星型ボタン**
  - 未設定時: 枠線のみの星アイコン
  - 設定時: 塗りつぶされた星アイコン（オレンジ色）
  - クリックで設定/解除を切り替え

- **自動解除機能**
  - 日付が変わると自動的に今日のメニューが解除される
  - 1分ごとに日付をチェック（バックグラウンド処理）

- **表示順序**
  - 今日のメニューは常にリストの最上部に表示
  - その後は作成日時の降順

- **排他制御**
  - 今日のメニューは1つのみ設定可能
  - 別のレシピを設定すると、前のレシピは自動的に解除

### API追加
- `PUT /api/recipes/[id]/today-menu` - 今日のメニューに設定
- `DELETE /api/recipes/[id]/today-menu` - 今日のメニューから解除

### 変更ファイル
- `db/schema.sql` - is_today_menu, today_menu_set_atカラム追加
- `db/migration_add_today_menu.sql` - マイグレーションスクリプト（新規）
- `app/types/recipe.ts` - Recipe型にisTodayMenu, todayMenuSetAt追加
- `app/components/RecipeCard.tsx` - 星型ボタンとバッジUI追加
- `app/api/recipes/route.ts` - GET時にtoday_menu関連フィールド取得、ソート追加
- `app/api/recipes/[id]/today-menu/route.ts` - 設定/解除API（新規）
- `app/page.tsx` - トグル処理、自動解除、ソート実装
- `app/lib/mockData.ts` - モックデータにフィールド追加

### データベース更新
既存のデータベースには以下のSQLを実行:
```sql
-- カラム追加
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS is_today_menu BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS today_menu_set_at TIMESTAMP;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_recipes_is_today_menu
ON recipes(is_today_menu) WHERE is_today_menu = TRUE;
```

または `db/migration_add_today_menu.sql` を実行。

### ブランチ
`feature/today-menu`

### PR
https://github.com/shinohara-jil/recipe-app/pull/11

---

## 2026-01-21 - レシピ提供者機能追加

### 追加機能
- **レシピ提供者フィールド**
  - データベースに`provider`カラムを追加（任意フィールド）
  - レシピ登録・編集時に提供者を入力可能

### 入力方法
- 「長谷川あかり」「もも」の選択ボタン
- カスタム入力（自由記入）も対応

### フィルタ機能
- 提供者でフィルタリング可能
  - 長谷川あかり
  - もも
  - その他（カスタム入力または未設定）
- カテゴリフィルターと併用可能

### 変更ファイル
- `db/schema.sql` - providerカラム追加
- `app/types/recipe.ts` - Recipe型にprovider追加
- `app/components/RecipeModal.tsx` - 入力UI追加
- `app/api/recipes/route.ts` - GET/POSTでprovider処理
- `app/api/recipes/[id]/route.ts` - PUTでprovider処理
- `app/page.tsx` - フィルタ機能実装

### データベース更新
既存のデータベースには以下のSQLを実行:
```sql
ALTER TABLE recipes ADD COLUMN provider VARCHAR(100);
```

### ブランチ
`feature/add-recipe-provider`

# 変更履歴

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

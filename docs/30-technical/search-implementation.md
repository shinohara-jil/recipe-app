## フリーワード検索 - 実装詳細

### 変更ファイル
- `app/components/SearchInput.tsx` - 新規作成（検索入力コンポーネント）
- `app/page.tsx` - state追加、フィルタロジック追加、UI配置

### 仕組み
- クライアント側フィルタリング（APIやDB変更なし）
- `searchQuery` stateで入力値を管理
- `filteredRecipes` 内で `String.includes()` による部分一致フィルタリング
- フィルタ適用順: フリーワード検索 → カテゴリ → 提供者 → ソート

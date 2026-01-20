# 🍳 レシピ帳

お気に入りのレシピを保存・管理できるWebアプリケーション

## 特徴

- 📝 レシピをタイトル、URL、カテゴリ、画像で管理
- 🏷️ カテゴリで絞り込み検索
- 📱 モバイルファーストのレスポンシブデザイン
- 🖼️ 画像アップロード機能
- ⚡ 高速な動作（Next.js + Vercel）
- 🎨 シンプルで使いやすいUI

## 技術スタック

- **フロントエンド**: Next.js 16, React, TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Neon (PostgreSQL)
- **画像ストレージ**: Vercel Blob Storage
- **ホスティング**: Vercel

## 機能

### レシピ管理
- レシピの登録（タイトル、URL、カテゴリ、画像）
- レシピ一覧の表示
- レシピ詳細の展開表示

### カテゴリ
- デフォルトカテゴリ:
  - pickup！
  - 牛肉
  - 豚肉
  - 鶏肉
  - その他
  - ホットクック
- カテゴリによる絞り込み
- 複数カテゴリの選択可能

### 画像
- 画像アップロード（5MB以内）
- 詳細表示時の画像プレビュー
- 対応形式: JPEG, PNG, GIF, WebP

## セットアップ

### 前提条件

- Node.js 18.x 以上
- npm または yarn

### ローカル開発環境のセットアップ

1. リポジトリのクローン

```bash
git clone https://github.com/[your-username]/recipe-app.git
cd recipe-app
```

2. 依存関係のインストール

```bash
npm install
```

3. 環境変数の設定

`.env.local` ファイルを作成:

```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

4. データベースのセットアップ

Neonでデータベースを作成し、スキーマを適用:

```bash
# db/schema.sql の内容を Neon SQL Editor で実行
```

詳細は `db/README.md` を参照してください。

5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く

## デプロイ

詳細なデプロイ手順は `DEPLOYMENT.md` を参照してください。

### 簡易手順

1. GitHubにリポジトリをプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## プロジェクト構造

```
recipe-app/
├── app/
│   ├── api/              # APIエンドポイント
│   │   ├── recipes/      # レシピAPI
│   │   ├── categories/   # カテゴリAPI
│   │   └── upload/       # 画像アップロードAPI
│   ├── components/       # Reactコンポーネント
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeModal.tsx
│   │   └── CategoryFilter.tsx
│   ├── lib/              # ユーティリティ
│   │   ├── db.ts         # データベース接続
│   │   ├── mockData.ts   # モックデータ
│   │   └── categoryColors.ts
│   ├── types/            # TypeScript型定義
│   │   └── recipe.ts
│   ├── globals.css       # グローバルスタイル
│   └── page.tsx          # メインページ
├── db/
│   ├── schema.sql        # データベーススキーマ
│   └── README.md         # DB設定手順
├── public/               # 静的ファイル
├── DEPLOYMENT.md         # デプロイ手順書
└── 要件定義書.md         # プロジェクト要件定義
```

## API エンドポイント

### レシピ

- `GET /api/recipes` - レシピ一覧取得
  - クエリパラメータ: `categoryId` (オプション)
- `POST /api/recipes` - レシピ登録
  - Body: `{ title, url, imageUrl?, categoryIds[] }`

### カテゴリ

- `GET /api/categories` - カテゴリ一覧取得
- `POST /api/categories` - カテゴリ追加
  - Body: `{ name }`

### 画像アップロード

- `POST /api/upload` - 画像アップロード
  - Body: FormData with `file`
  - 最大サイズ: 5MB

## 開発

### ビルド

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### 型チェック

TypeScriptの型チェックは自動的に実行されます。

## ブラウザサポート

- Chrome (最新版)
- Safari (最新版)
- Firefox (最新版)
- Edge (最新版)

モバイルブラウザ:
- iOS Safari
- Chrome for Android

## 今後の拡張予定

- [ ] レシピの編集・削除機能
- [ ] お気に入り機能
- [ ] キーワード検索機能
- [ ] ユーザー認証・権限管理
- [ ] レシピのエクスポート機能
- [ ] SNSシェア機能

## ライセンス

MIT

## 作成者

Created with Claude Code

## サポート

問題が発生した場合は、GitHubのIssuesでお知らせください。

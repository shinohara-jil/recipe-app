# デプロイ手順書

このドキュメントでは、レシピ管理アプリをVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント
- Neonアカウント

## 1. Neonデータベースのセットアップ

### 1.1 プロジェクトの作成

1. [Neon](https://neon.tech/)にログイン
2. 「New Project」をクリック
3. プロジェクト名を入力（例: `recipe-app`）
4. リージョンを選択（推奨: Asia Pacific - Singapore）
5. 「Create Project」をクリック

### 1.2 データベーススキーマの作成

1. Neonダッシュボードで「SQL Editor」を開く
2. `recipe-app/db/schema.sql` の内容をコピー
3. SQL Editorに貼り付けて実行
4. 成功メッセージを確認

### 1.3 接続文字列の取得

1. Neonダッシュボードで「Connection Details」を開く
2. 「Connection String」をコピー
   - 形式: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`
3. 後でVercelの環境変数に設定するため、メモしておく

## 2. GitHubリポジトリの準備

### 2.1 リポジトリの作成

```bash
cd recipe-app
git init
git add .
git commit -m "Initial commit"
```

### 2.2 GitHubにプッシュ

1. GitHubで新しいリポジトリを作成
2. ローカルリポジトリをリンク:

```bash
git remote add origin https://github.com/[your-username]/recipe-app.git
git branch -M main
git push -u origin main
```

## 3. Vercelへのデプロイ

### 3.1 プロジェクトのインポート

1. [Vercel](https://vercel.com/)にログイン
2. 「Add New」→「Project」をクリック
3. GitHubリポジトリを選択してインポート
4. プロジェクト名を確認（デフォルトでOK）
5. Framework Preset: Next.js（自動検出される）
6. Root Directory: `./`（デフォルト）

### 3.2 環境変数の設定

「Environment Variables」セクションで以下を追加:

#### DATABASE_URL
- Key: `DATABASE_URL`
- Value: Neonから取得した接続文字列
- Environment: Production, Preview, Development すべてにチェック

#### BLOB_READ_WRITE_TOKEN
この値は後で設定します（Vercel Blob Storageの作成後）

### 3.3 デプロイ

1. 「Deploy」ボタンをクリック
2. デプロイが完了するまで待つ（約2-3分）
3. デプロイが完了したら「Visit」をクリックして確認

**注意**: 最初はBLOB_READ_WRITE_TOKENが設定されていないため、画像アップロードは動作しません。

## 4. Vercel Blob Storageのセットアップ

### 4.1 Blob Storageの有効化

1. Vercelダッシュボードでプロジェクトを選択
2. 「Storage」タブをクリック
3. 「Create Database」→「Blob」を選択
4. ストレージ名を入力（例: `recipe-images`）
5. 「Create」をクリック

### 4.2 トークンの取得と設定

1. 作成されたBlob Storageの詳細画面で「.env.local」タブをクリック
2. `BLOB_READ_WRITE_TOKEN` の値をコピー
3. プロジェクト設定の「Environment Variables」に戻る
4. 新しい環境変数を追加:
   - Key: `BLOB_READ_WRITE_TOKEN`
   - Value: コピーしたトークン
   - Environment: Production, Preview, Development すべてにチェック
5. 「Save」をクリック

### 4.3 再デプロイ

環境変数を追加した後、再デプロイが必要です:

1. 「Deployments」タブに移動
2. 最新のデプロイメントの右側にある「...」メニューをクリック
3. 「Redeploy」を選択
4. デプロイが完了するまで待つ

## 5. 動作確認

### 5.1 基本機能の確認

1. デプロイされたURLにアクセス
2. カテゴリフィルターが表示されることを確認
3. 「新規登録」ボタンをクリックしてモーダルが開くことを確認

### 5.2 レシピ登録のテスト

1. 「新規登録」からレシピを登録
   - タイトル: テストレシピ
   - URL: https://example.com
   - カテゴリ: 任意
   - 画像: 任意の画像ファイル（5MB以内）
2. 登録ボタンをクリック
3. レシピが一覧に表示されることを確認
4. カードをクリックして詳細が展開されることを確認

### 5.3 画像表示の確認

1. 画像付きのレシピを登録
2. カードをクリックして詳細を展開
3. 画像が正しく表示されることを確認

### 5.4 カテゴリフィルターの確認

1. 複数のレシピを異なるカテゴリで登録
2. カテゴリフィルターをクリック
3. 該当するレシピのみが表示されることを確認

## 6. トラブルシューティング

### データベース接続エラー

**症状**: レシピが表示されない、登録できない

**解決方法**:
1. Vercelの環境変数 `DATABASE_URL` が正しく設定されているか確認
2. Neonデータベースが起動しているか確認（無料プランは一定期間アクセスがないとスリープ）
3. Vercelのログを確認: Deployments → 最新のデプロイ → Functions → エラーログを確認

### 画像アップロードエラー

**症状**: 画像付きレシピの登録時にエラーが出る

**解決方法**:
1. `BLOB_READ_WRITE_TOKEN` が正しく設定されているか確認
2. 画像サイズが5MB以内か確認
3. 画像形式がサポートされているか確認（JPEG, PNG, GIF, WebP）

### ビルドエラー

**症状**: デプロイ時にビルドが失敗する

**解決方法**:
1. ローカルで `npm run build` を実行してエラーを確認
2. TypeScriptのエラーを修正
3. 修正をコミットしてプッシュ

## 7. 継続的なデプロイメント

Vercelは自動的にGitHubと連携しています:

- `main` ブランチへのプッシュ → 本番環境に自動デプロイ
- プルリクエストの作成 → プレビュー環境が自動生成

## 8. カスタムドメインの設定（オプション）

1. Vercelプロジェクトの「Settings」→「Domains」
2. 「Add」をクリックしてドメインを入力
3. DNSレコードの設定手順に従う
4. ドメインの検証が完了するまで待つ

## 9. 本番環境でのベストプラクティス

### セキュリティ

- 環境変数は絶対にGitにコミットしない
- `.env.local` はgitignoreに含まれていることを確認

### パフォーマンス

- Neonの無料プランは一定期間アクセスがないとスリープするため、初回アクセスが遅い場合がある
- 画像は適切なサイズに圧縮してからアップロード

### モニタリング

- Vercelの Analytics で使用状況を確認
- エラーが発生した場合は Vercel のログを確認

## 10. バックアップ

Neonデータベースのバックアップ:

1. Neonダッシュボードで「Backups」タブを確認
2. 無料プランでは自動バックアップが利用可能
3. 手動でエクスポートする場合は SQL Editor でデータをエクスポート

---

**デプロイ完了！** 🎉

何か問題が発生した場合は、Vercelのサポートドキュメントを参照してください:
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)

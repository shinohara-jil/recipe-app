# データベースセットアップ手順（ステップバイステップ）

このガイドでは、Neonデータベースのセットアップを具体的な作業手順で説明します。

## 前提条件
- Vercelへのデプロイが完了していること
- Neonアカウントを持っていること（まだの場合は作成）

---

## ステップ1: Neonアカウント作成とログイン

### 1-1. Neonサイトにアクセス
ブラウザで以下のURLを開きます：
```
https://neon.tech/
```

### 1-2. サインアップまたはログイン
- 右上の「Sign In」または「Sign Up」をクリック
- GitHubアカウントでサインインするのが最も簡単です
  - 「Continue with GitHub」をクリック
  - GitHubで認証

---

## ステップ2: 新しいプロジェクトを作成

### 2-1. プロジェクト作成画面を開く
- Neonのダッシュボードが表示されます
- 左上の「Create a project」ボタンをクリック

### 2-2. プロジェクト設定
以下の情報を入力します：

**Project name（プロジェクト名）:**
```
recipe-app
```

**Region（リージョン）:**
- 日本から近いリージョンを選択
- 推奨: `Asia Pacific (Singapore)` または `Asia Pacific (Tokyo)`
  - ドロップダウンから選択

**Postgres version:**
- デフォルトのまま（最新版）

### 2-3. プロジェクトを作成
- 「Create project」ボタンをクリック
- 数秒待つと、プロジェクトが作成されます

---

## ステップ3: 接続文字列を取得

### 3-1. 接続情報画面を確認
プロジェクトが作成されると、自動的に接続情報が表示されます。

### 3-2. Connection Stringをコピー
画面に以下のような接続文字列が表示されます：

```
postgresql://[username]:[password]@[hostname]/[database]?sslmode=require
```

**重要: この接続文字列全体をコピーします**

- 「Connection string」の右側にある**コピーアイコン**をクリック
- または、文字列を全選択してCtrl+C（Cmd+C）でコピー

**例:**
```
postgresql://neondb_owner:abc123xyz@ep-cool-sun-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 3-3. 接続文字列を保存
- メモ帳やテキストエディタに一時的に貼り付けて保存しておきます
- **この文字列は後で使用するので大切に保管してください**

---

## ステップ4: データベーススキーマを適用

### 4-1. SQL Editorを開く
- Neonダッシュボードの左側メニューから「SQL Editor」をクリック

### 4-2. スキーマファイルの内容を準備
ローカルの`recipe-app/db/schema.sql`ファイルを開きます。

**方法1: VSCodeで開く**
- VSCodeで`recipe-app/db/schema.sql`を開く
- 内容を全選択（Ctrl+A）してコピー（Ctrl+C）

**方法2: メモ帳で開く**
- エクスプローラーで`recipe-app/db/schema.sql`を右クリック
- 「プログラムから開く」→「メモ帳」
- 内容を全選択（Ctrl+A）してコピー（Ctrl+C）

### 4-3. SQL Editorに貼り付けて実行
1. Neonの「SQL Editor」画面に戻ります
2. 右側の大きなテキストエリア（SQL入力欄）にコピーした内容を貼り付け（Ctrl+V）
3. 右上の**「Run」ボタン**（緑色の再生アイコン）をクリック
4. 実行結果が下部に表示されます

### 4-4. 実行結果を確認
以下のようなメッセージが表示されればOK：
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
INSERT 0 6
```

エラーが表示された場合は、SQLの内容を再確認してください。

---

## ステップ5: データが正しく作成されたか確認

### 5-1. テーブルが作成されたことを確認
SQL Editorで以下のSQLを実行：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

**期待される結果:**
以下の4つのテーブルが表示されればOK：
- `recipes`
- `categories`
- `recipe_categories`
- `recipe_images`

### 5-2. カテゴリが登録されたことを確認
SQL Editorで以下のSQLを実行：

```sql
SELECT * FROM categories;
```

**期待される結果:**
以下の6つのカテゴリが表示されればOK：
```
id | name
---|-----------
 1 | pickup！
 2 | 牛肉
 3 | 豚肉
 4 | 鶏肉
 5 | その他
 6 | ホットクック
```

---

## ステップ6: Vercelに環境変数を設定

### 6-1. Vercelダッシュボードを開く
ブラウザで以下のURLを開きます：
```
https://vercel.com/
```

### 6-2. プロジェクトを選択
- ダッシュボードで「recipe-app」プロジェクトをクリック

### 6-3. 設定画面を開く
- 上部メニューの「Settings」タブをクリック

### 6-4. 環境変数設定画面を開く
- 左側メニューから「Environment Variables」をクリック

### 6-5. DATABASE_URLを追加

**Add New Variable**セクションで以下を入力：

**Key（キー）:**
```
DATABASE_URL
```

**Value（値）:**
- ステップ3-2でコピーした接続文字列を貼り付け
```
postgresql://neondb_owner:abc123xyz@ep-cool-sun-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Environments（環境）:**
- ☑ Production
- ☑ Preview
- ☑ Development

すべてにチェックを入れます。

**「Save」ボタンをクリック**

---

## ステップ7: Vercel Blob Storageのセットアップ

### 7-1. Storageタブを開く
- Vercelプロジェクトの上部メニューで「Storage」タブをクリック

### 7-2. Blobストレージを作成
- 「Create Database」ボタンをクリック
- **「Blob」**を選択
- 「Continue」をクリック

### 7-3. ストレージ名を入力
**Store Name:**
```
recipe-images
```

### 7-4. ストレージを作成
- 「Create」ボタンをクリック
- 数秒待つと作成完了

### 7-5. プロジェクトに接続
- 「Connect to Existing Project」が表示されます
- プロジェクト「recipe-app」を選択
- 「Connect」ボタンをクリック

### 7-6. 環境変数が自動追加されたことを確認
- 「Environment Variables」セクションに戻る
- `BLOB_READ_WRITE_TOKEN` が自動的に追加されていることを確認

---

## ステップ8: 再デプロイ

環境変数を追加したので、アプリを再デプロイする必要があります。

### 8-1. Deploymentsタブを開く
- 上部メニューの「Deployments」タブをクリック

### 8-2. 最新のデプロイメントを再デプロイ
- 一番上の最新のデプロイメントの右側にある「...」（3点リーダー）をクリック
- 「Redeploy」を選択
- 確認ダイアログで「Redeploy」をクリック

### 8-3. デプロイ完了を待つ
- 「Building」→「Ready」になるまで待ちます（約2-3分）
- 完了すると「Ready」と表示されます

---

## ステップ9: 動作確認

### 9-1. アプリにアクセス
- Vercelの「Deployments」タブで、最新のデプロイメントの「Visit」ボタンをクリック
- または、プロジェクトURLに直接アクセス
  ```
  https://recipe-app-xxx.vercel.app
  ```

### 9-2. 基本機能を確認
以下を確認します：

**✅ カテゴリフィルターが表示される**
- 6つのカテゴリボタンが表示されていること

**✅ レシピ一覧が表示される**
- 初期状態では何も表示されていないはず（空の状態）

**✅ レシピ登録**
1. 「＋新規登録」ボタンをクリック
2. 以下を入力：
   - タイトル: `テストレシピ`
   - URL: `https://example.com`
   - カテゴリ: 任意（例: pickup！）
   - 画像: テスト用画像を1-2枚選択
3. 「登録する」ボタンをクリック
4. レシピが一覧に表示されることを確認

**✅ レシピ詳細**
- レシピカードをクリック
- 詳細が展開され、画像とURLが表示されることを確認

**✅ カテゴリフィルター**
- カテゴリボタンをクリック
- 該当するレシピのみが表示されることを確認

---

## トラブルシューティング

### 問題1: 「Database not configured」エラー

**原因:** `DATABASE_URL`が正しく設定されていない

**解決方法:**
1. Vercelの「Settings」→「Environment Variables」を確認
2. `DATABASE_URL`が設定されているか確認
3. 接続文字列が正しいか確認（Neonからコピーし直す）
4. 再デプロイ

### 問題2: 「Failed to fetch recipes」エラー

**原因:** データベース接続エラーまたはテーブルが作成されていない

**解決方法:**
1. NeonのSQL Editorで以下を実行して確認：
   ```sql
   SELECT * FROM categories;
   ```
2. エラーが出る場合は、ステップ4を再実行してスキーマを適用

### 問題3: 画像アップロードが失敗する

**原因:** `BLOB_READ_WRITE_TOKEN`が設定されていない

**解決方法:**
1. Vercelの「Storage」タブを確認
2. Blob Storageが作成されているか確認
3. プロジェクトに接続されているか確認
4. 「Settings」→「Environment Variables」で`BLOB_READ_WRITE_TOKEN`を確認
5. 再デプロイ

### 問題4: Neon接続が遅い・タイムアウトする

**原因:** Neonの無料プランはアクセスがないとスリープする

**解決方法:**
- 初回アクセスは30秒程度かかる場合があります
- 数回リロードしてみてください
- アクセス後は高速になります

---

## 完了チェックリスト

すべて✅になればセットアップ完了です！

- ☐ Neonプロジェクトが作成された
- ☐ 接続文字列をコピーした
- ☐ データベーススキーマを適用した
- ☐ カテゴリが6個作成されたことを確認した
- ☐ Vercelに`DATABASE_URL`を設定した
- ☐ Vercel Blob Storageを作成した
- ☐ Vercelに`BLOB_READ_WRITE_TOKEN`が設定された
- ☐ 再デプロイが完了した
- ☐ アプリにアクセスできた
- ☐ レシピ登録が正常に動作した

---

## 次のステップ

セットアップが完了したら：

1. **レシピを追加する**
   - 実際のレシピをどんどん登録してみましょう

2. **スマホでアクセスする**
   - モバイルブラウザでアクセスして使い勝手を確認

3. **カスタマイズ**
   - カテゴリを追加したい場合は、SQL Editorで：
     ```sql
     INSERT INTO categories (name) VALUES ('新しいカテゴリ名');
     ```

4. **バックアップ**
   - Neonは自動バックアップがありますが、重要なデータは定期的に確認

---

**これでセットアップ完了です！🎉**

何か問題が発生した場合は、このガイドのトラブルシューティングセクションを参照してください。

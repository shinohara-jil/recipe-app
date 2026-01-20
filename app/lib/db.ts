import { neon } from '@neondatabase/serverless';

// 環境変数が設定されていない場合はnullを返す（ローカル開発用）
export const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : null;

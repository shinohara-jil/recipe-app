// db/ のSQLファイルを、.env.local の DATABASE_URL のデータベースに反映する
// 使い方: node --env-file=.env.local scripts/run_migration.mjs db/migration_add_shopping_list.sql
import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const file = process.argv[2];
if (!file || !process.env.DATABASE_URL) {
  console.error('使い方: node --env-file=.env.local scripts/run_migration.mjs <SQLファイル>');
  process.exit(1);
}

const host = process.env.DATABASE_URL.match(/@([^/]+)/)?.[1];
console.log(`反映先: ${host}`);

const sql = neon(process.env.DATABASE_URL);
// 1文ずつ実行する（コメント行を除き、; で区切る）
const statements = fs
  .readFileSync(file, 'utf8')
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  const rows = await sql.query(statement);
  console.log('OK:', statement.split('\n')[0].slice(0, 70), rows.length ? JSON.stringify(rows[0]) : '');
}

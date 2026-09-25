// 登録済みレシピの材料・特徴をまとめて読み取る（アプリと同じ読み取り処理を使う）
// 使い方:
//   npx tsx --env-file=.env.local scripts/extract_recipes.ts                 … まだ読み取っていないレシピを全部
//   npx tsx --env-file=.env.local scripts/extract_recipes.ts --limit=5       … 5件だけ
//   npx tsx --env-file=.env.local scripts/extract_recipes.ts --ids=<id>,<id> … 指定したレシピ（読み取り済みでもやり直す）
//   npx tsx --env-file=.env.local scripts/extract_recipes.ts --status=failed … 失敗したものをやり直す
import { neon } from '@neondatabase/serverless';
import { extractRecipe } from '../app/lib/extraction/extract';

const arg = (name: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const sql = neon(process.env.DATABASE_URL!);

const ids = arg('ids')?.split(',');
const status = arg('status') ?? 'none';
const limit = Number(arg('limit') ?? 1000);

async function main() {
  const targets = ids
    ? await sql`SELECT id, title FROM recipes WHERE id::text LIKE ANY(${ids.map((i) => `${i}%`)})`
    : await sql`SELECT id, title FROM recipes WHERE extraction_status = ${status} ORDER BY created_at DESC LIMIT ${limit}`;

  console.log(`反映先: ${process.env.DATABASE_URL!.match(/@([^/]+)/)?.[1]}`);
  console.log(`対象: ${targets.length}件\n`);

  for (const [n, r] of targets.entries()) {
    const started = Date.now();
    await extractRecipe(r.id);
    const [after] = await sql`
    SELECT extraction_status, extraction_source, extraction_note,
      (SELECT count(*) FROM recipe_ingredients WHERE recipe_id = ${r.id}) AS n
    FROM recipes WHERE id = ${r.id}`;
    const sec = ((Date.now() - started) / 1000).toFixed(1);
    console.log(
      `[${n + 1}/${targets.length}] ${r.title} … ${after.extraction_status}（${after.extraction_source ?? '-'}、材料${after.n}件、${sec}秒）`,
    );
    if (after.extraction_status === 'failed')
      console.log(`    理由: ${after.extraction_note}`);
  }

  const summary =
    await sql`SELECT extraction_status, count(*) FROM recipes GROUP BY 1 ORDER BY 1`;
  console.log(
    '\n全体の状態:',
    summary.map((s) => `${s.extraction_status}=${s.count}`).join(' / '),
  );
}

main();

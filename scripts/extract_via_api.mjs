// 公開中のアプリ経由で、まだ材料を読み取っていないレシピを1件ずつ読み取る
// （本番のデータベースの接続先を手元に置かずに一括読み取りできる。Vercel から各サイトが読めるかの確認にもなる）
// 使い方: node --env-file=.env.local scripts/extract_via_api.mjs https://recipe-app-ts.vercel.app [--status=failed]
const base = process.argv[2]?.replace(/\/$/, '');
const status = process.argv.find((a) => a.startsWith('--status='))?.split('=')[1] ?? 'none';
if (!base || !process.env.AI_PASSCODE) {
  console.error('使い方: node --env-file=.env.local scripts/extract_via_api.mjs <アプリのURL> [--status=failed]');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 合言葉で通行証（クッキー）をもらう
const auth = await fetch(`${base}/api/ai-auth`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ passcode: process.env.AI_PASSCODE }),
});
if (!auth.ok) {
  console.error(`合言葉の確認に失敗しました（HTTP ${auth.status}）`);
  process.exit(1);
}
const cookie = auth.headers.get('set-cookie').split(';')[0];

const recipes = await (await fetch(`${base}/api/recipes`)).json();
const targets = recipes.filter((r) => r.extraction_status === status);
console.log(`対象: ${targets.length}件\n`);

const counts = {};
for (const [n, r] of targets.entries()) {
  const started = Date.now();
  const res = await fetch(`${base}/api/recipes/${r.id}/extract`, { method: 'POST', headers: { cookie } });
  if (!res.ok) {
    console.log(`[${n + 1}/${targets.length}] ${r.title} … 開始できず（HTTP ${res.status}）`);
    continue;
  }
  let result;
  do {
    await sleep(3000);
    result = await (await fetch(`${base}/api/recipes/${r.id}/extract`)).json();
  } while (result.extraction_status === 'processing' && Date.now() - started < 180000);

  counts[result.extraction_status] = (counts[result.extraction_status] ?? 0) + 1;
  const sec = ((Date.now() - started) / 1000).toFixed(0);
  console.log(
    `[${n + 1}/${targets.length}] ${r.title} … ${result.extraction_status}（${result.extraction_source ?? '-'}、材料${result.ingredients.length}件、約${sec}秒）`
  );
}
console.log('\n結果:', Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(' / '));

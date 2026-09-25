import { sql } from '@/app/lib/db';
import { askGemini, type ExtractionResult } from './gemini';
import { fetchImages, readUrl } from './sources';

type Outcome = { result: ExtractionResult; label: string };

// 実際に書かれた材料が1つ以上あれば「確定」。推測だけなら画像も試す
const confirmed = (r: ExtractionResult) => r.found && r.ingredients.some((i) => !i.is_guess);

async function runExtraction(title: string, url: string | null, imageUrls: string[], pantry: string[]) {
  const notes: string[] = [];
  let urlGuess: Outcome | null = null;

  // ① URL を優先
  if (url) {
    try {
      const src = await readUrl(url);
      const result = await askGemini(title, pantry, src.text, src.images);
      if (confirmed(result)) return { outcome: { result, label: src.label }, notes };
      if (result.found) urlGuess = { result, label: src.label };
      notes.push(`${src.label}に材料の記載がありませんでした`);
    } catch (e) {
      notes.push(`URLを読めませんでした（${(e as Error).message}）`);
    }
  }

  // ② 登録した画像
  if (imageUrls.length) {
    try {
      const images = await fetchImages(imageUrls);
      const result = await askGemini(title, pantry, null, images);
      if (confirmed(result) || (!urlGuess && result.found)) return { outcome: { result, label: '登録した画像' }, notes };
    } catch (e) {
      notes.push(`画像を読めませんでした（${(e as Error).message}）`);
    }
  }
  return { outcome: urlGuess, notes };
}

// レシピ1件の材料・特徴を読み取って保存する。失敗しても例外は投げず、状態を failed にする
export async function extractRecipe(recipeId: string) {
  if (!sql) throw new Error('DATABASE_URL が設定されていません');

  const [recipe] = await sql`SELECT id, title, url FROM recipes WHERE id = ${recipeId}`;
  if (!recipe) return;
  const images = await sql`SELECT image_url FROM recipe_images WHERE recipe_id = ${recipeId} ORDER BY display_order, id`;
  const pantry = (await sql`SELECT name FROM pantry_items ORDER BY id`).map((p) => p.name as string);

  // extracted_at は「最後に読み取りを始めた／終えた時刻」。止まったまま5分たつと一覧では失敗扱いになる
  await sql`UPDATE recipes SET extraction_status = 'processing', extracted_at = NOW() WHERE id = ${recipeId}`;
  try {
    const { outcome, notes } = await runExtraction(
      recipe.title,
      recipe.url,
      images.map((i) => i.image_url as string),
      pantry
    );

    if (!outcome) {
      await sql`
        UPDATE recipes SET extraction_status = 'failed', extraction_source = NULL,
          extraction_note = ${notes.join(' / ') || '材料が見つかりませんでした'}, extracted_at = NOW()
        WHERE id = ${recipeId}`;
      return;
    }

    const { result, label } = outcome;
    const status = confirmed(result) ? 'done' : 'guess';
    const db = sql;
    // 材料の入れ替えと状態の更新は、途中で止まっても中途半端にならないよう一度にまとめて行う
    await db.transaction([
      db`DELETE FROM recipe_ingredients WHERE recipe_id = ${recipeId}`,
      ...result.ingredients.map((ing, i) => {
        const text = ing.amount ? `${ing.name} ${ing.amount}` : ing.name;
        return db`
          INSERT INTO recipe_ingredients (recipe_id, text, standard_name, is_guess, display_order)
          VALUES (${recipeId}, ${text}, ${ing.standard_name || null}, ${ing.is_guess}, ${i})`;
      }),
      db`
        UPDATE recipes SET extraction_status = ${status}, extraction_source = ${label},
          extraction_note = ${[result.note, ...notes].filter(Boolean).join(' / ')},
          servings = ${result.servings || null}, features = ${JSON.stringify(result.features)}::jsonb, extracted_at = NOW()
        WHERE id = ${recipeId}`,
    ]);
  } catch (e) {
    console.error('Extraction failed:', recipeId, e);
    await sql`
      UPDATE recipes SET extraction_status = 'failed', extraction_note = ${(e as Error).message}, extracted_at = NOW()
      WHERE id = ${recipeId}`;
  }
}

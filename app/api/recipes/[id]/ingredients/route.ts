import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import type { Ingredient } from '@/app/types/recipe';

// 材料を手で直したときの保存（材料リストを丸ごと置き換える）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const ingredients: Ingredient[] = Array.isArray(body.ingredients) ? body.ingredients : [];
  const rows = ingredients
    .map((i) => ({ text: String(i.text ?? '').trim(), standardName: i.standardName || null }))
    .filter((i) => i.text);

  if (!sql) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const db = sql;

  const [recipe] = await db`SELECT id FROM recipes WHERE id = ${id}`;
  if (!recipe) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  // 人が確認して保存した材料なので「推測」は外す
  await db.transaction([
    db`DELETE FROM recipe_ingredients WHERE recipe_id = ${id}`,
    ...rows.map(
      (row, i) => db`
        INSERT INTO recipe_ingredients (recipe_id, text, standard_name, is_guess, display_order)
        VALUES (${id}, ${row.text}, ${row.standardName}, FALSE, ${i})`
    ),
    db`UPDATE recipes SET extraction_status = ${rows.length ? 'done' : 'none'} WHERE id = ${id}`,
  ]);

  return NextResponse.json({
    ingredients: rows.map((r) => ({ ...r, isGuess: false })),
    extraction_status: rows.length ? 'done' : 'none',
  });
}

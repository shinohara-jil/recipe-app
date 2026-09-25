import { after, NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { isAiAuthorized } from '@/app/lib/aiAuth';
import { extractRecipe } from '@/app/lib/extraction/extract';

// 読み取りは返事のあとも裏で続く。URL→画像と2回AIに聞くこともあるので長めに取る
export const maxDuration = 120;

// 材料の読み取りを開始する（合言葉が必要）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!sql) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  if (!isAiAuthorized(request)) {
    return NextResponse.json({ error: '合言葉が必要です' }, { status: 401 });
  }

  const [recipe] = await sql`
    UPDATE recipes SET extraction_status = 'processing', extracted_at = NOW() WHERE id = ${id} RETURNING id`;
  if (!recipe) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  after(() => extractRecipe(id));
  return NextResponse.json({ extraction_status: 'processing' }, { status: 202 });
}

// 読み取りの状態と材料を返す（読み取り中に画面から数秒おきに確認する）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!sql) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const [recipe] = await sql`
    SELECT
      CASE WHEN r.extraction_status = 'processing' AND r.extracted_at < NOW() - INTERVAL '5 minutes'
            THEN 'failed' ELSE r.extraction_status END AS extraction_status,
      r.extraction_source,
      r.servings,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object('text', ing.text, 'standardName', ing.standard_name, 'isGuess', ing.is_guess)
            ORDER BY ing.display_order, ing.id
          )
          FROM recipe_ingredients ing
          WHERE ing.recipe_id = r.id
        ),
        '[]'
      ) as ingredients
    FROM recipes r
    WHERE r.id = ${id}`;
  if (!recipe) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }
  return NextResponse.json(recipe);
}

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

const DEFAULT_PANTRY = [
  'しょうゆ', 'みりん', '酒', '砂糖', '塩', 'サラダ油', 'オリーブオイル', 'ごま油', 'こしょう', '塩こしょう', '酢',
  'マヨネーズ', 'ケチャップ', '味噌', 'めんつゆ', 'ポン酢', '小麦粉', '片栗粉', '鶏がらスープの素', 'コンソメ', '顆粒だし',
];

// 家にある物の一覧
export async function GET() {
  if (!sql) {
    // データベース未設定のローカル開発では初期の品目だけ返す
    return NextResponse.json(DEFAULT_PANTRY.map((name, i) => ({ id: i + 1, name })));
  }
  const items = await sql`SELECT id, name FROM pantry_items ORDER BY id`;
  return NextResponse.json(items);
}

// 家にある物を追加
export async function POST(request: NextRequest) {
  const { name } = await request.json();
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed || trimmed.length > 100) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!sql) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // すでにあれば既存のものを返す
  const [item] = await sql`
    INSERT INTO pantry_items (name) VALUES (${trimmed})
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, name`;
  return NextResponse.json(item, { status: 201 });
}

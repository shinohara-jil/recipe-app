import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { isAiAuthorized } from '@/app/lib/aiAuth';
import { recommend, type ChatTurn } from '@/app/lib/chat/recommend';

// 費用が膨らまないように、1回の発言の長さと、さかのぼる会話の数を制限する
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 10;

// AI相談：レシピ帳の中からおすすめを返す（合言葉が必要）
export async function POST(request: NextRequest) {
  if (!sql) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  if (!isAiAuthorized(request)) {
    return NextResponse.json({ error: '合言葉が必要です' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : '';
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  const history: ChatTurn[] = (Array.isArray(body.history) ? body.history : [])
    .filter((t: ChatTurn) => (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string')
    .slice(-MAX_HISTORY_TURNS)
    .map((t: ChatTurn) => ({
      role: t.role,
      text: t.text.slice(0, MAX_MESSAGE_LENGTH),
      recipeIds: Array.isArray(t.recipeIds) ? t.recipeIds.filter((id) => typeof id === 'string') : [],
    }));

  try {
    const rows = await sql`SELECT id, title, features FROM recipes ORDER BY created_at DESC`;
    const recipes = rows.map((r) => ({ id: r.id as string, title: r.title as string, features: r.features }));
    const answer = await recommend(recipes, history, message);
    return NextResponse.json({ reply: answer.reply, recommendations: answer.recommendations });
  } catch (error) {
    console.error('Chat failed:', error);
    return NextResponse.json({ error: 'AIに相談できませんでした' }, { status: 500 });
  }
}

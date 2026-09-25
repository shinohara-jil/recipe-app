import { NextRequest, NextResponse } from 'next/server';
import { AI_AUTH_COOKIE, AI_AUTH_MAX_AGE, checkPasscode, isAiAuthorized, issueToken } from '@/app/lib/aiAuth';

// この端末が合言葉を入力済みか
export async function GET(request: NextRequest) {
  return NextResponse.json({ authorized: isAiAuthorized(request) });
}

// 合言葉の確認。合っていれば30日間有効なクッキーを渡す
export async function POST(request: NextRequest) {
  const { passcode } = await request.json().catch(() => ({ passcode: '' }));

  if (!process.env.AI_PASSCODE) {
    return NextResponse.json({ error: 'AI_PASSCODE が設定されていません' }, { status: 503 });
  }
  if (typeof passcode !== 'string' || !checkPasscode(passcode)) {
    return NextResponse.json({ error: '合言葉が違います' }, { status: 401 });
  }

  const response = NextResponse.json({ authorized: true });
  response.cookies.set(AI_AUTH_COOKIE, issueToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: AI_AUTH_MAX_AGE,
    path: '/',
  });
  return response;
}

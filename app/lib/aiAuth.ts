import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

// AI機能（材料の読み取り・相談）は料金がかかるので、合言葉を知っている端末だけに使わせる
export const AI_AUTH_COOKIE = 'ai_auth';
export const AI_AUTH_MAX_AGE = 60 * 60 * 24 * 30; // 30日

// クッキーには合言葉そのものではなく、合言葉から作った署名を入れる
function tokenFor(passcode: string) {
  return createHmac('sha256', passcode).update('recipe-app-ai').digest('hex');
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPasscode(input: string) {
  const passcode = process.env.AI_PASSCODE;
  return !!passcode && safeEqual(input, passcode);
}

export function issueToken() {
  return tokenFor(process.env.AI_PASSCODE!);
}

export function isAiAuthorized(request: NextRequest) {
  const passcode = process.env.AI_PASSCODE;
  const cookie = request.cookies.get(AI_AUTH_COOKIE)?.value;
  return !!passcode && !!cookie && safeEqual(cookie, tokenFor(passcode));
}

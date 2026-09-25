import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

// 家にある物から外す
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!sql) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  await sql`DELETE FROM pantry_items WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}

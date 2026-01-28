import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

// 今日のメニューに設定
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!sql) {
      // モックモード: データベースなしでも動作確認できるようダミーレスポンスを返す
      return NextResponse.json({
        id,
        is_today_menu: true,
        today_menu_set_at: new Date().toISOString(),
      });
    }

    // 既存の今日のメニューをクリア(1つだけ設定可能なため)
    await sql`
      UPDATE recipes
      SET is_today_menu = FALSE, today_menu_set_at = NULL
      WHERE is_today_menu = TRUE
    `;

    // 新しいレシピを今日のメニューに設定
    const [recipe] = await sql`
      UPDATE recipes
      SET is_today_menu = TRUE, today_menu_set_at = NOW()
      WHERE id = ${id}
      RETURNING id, is_today_menu, today_menu_set_at
    `;

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error setting today menu:', error);
    return NextResponse.json(
      { error: 'Failed to set today menu' },
      { status: 500 }
    );
  }
}

// 今日のメニューを解除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!sql) {
      // モックモード: データベースなしでも動作確認できるようダミーレスポンスを返す
      return NextResponse.json({
        id,
        is_today_menu: false,
        today_menu_set_at: null,
      });
    }

    const [recipe] = await sql`
      UPDATE recipes
      SET is_today_menu = FALSE, today_menu_set_at = NULL
      WHERE id = ${id}
      RETURNING id, is_today_menu, today_menu_set_at
    `;

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error removing today menu:', error);
    return NextResponse.json(
      { error: 'Failed to remove today menu' },
      { status: 500 }
    );
  }
}

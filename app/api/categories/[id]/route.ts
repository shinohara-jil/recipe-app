import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

// カテゴリ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (!sql) {
      return NextResponse.json(
        {
          error: 'Database not configured. Please set DATABASE_URL in .env.local',
        },
        { status: 503 }
      );
    }

    // カテゴリの存在確認
    const [existingCategory] = await sql`
      SELECT id FROM categories WHERE id = ${parseInt(id)}
    `;

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // カテゴリを更新
    const [category] = await sql`
      UPDATE categories
      SET name = ${name.trim()}
      WHERE id = ${parseInt(id)}
      RETURNING id, name, created_at
    `;

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);

    // ユニーク制約違反の場合
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// カテゴリ削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!sql) {
      return NextResponse.json(
        {
          error: 'Database not configured. Please set DATABASE_URL in .env.local',
        },
        { status: 503 }
      );
    }

    // カテゴリの存在確認
    const [existingCategory] = await sql`
      SELECT id FROM categories WHERE id = ${parseInt(id)}
    `;

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // recipe_categoriesから該当カテゴリを削除（CASCADE設定されているため自動削除されるが念のため）
    await sql`
      DELETE FROM recipe_categories WHERE category_id = ${parseInt(id)}
    `;

    // カテゴリを削除
    await sql`
      DELETE FROM categories WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({ success: true, id: parseInt(id) });
  } catch (error: any) {
    console.error('Error deleting category:', error);

    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

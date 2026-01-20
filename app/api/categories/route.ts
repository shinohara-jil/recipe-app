import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { categories } from '@/app/lib/mockData';

// カテゴリ一覧取得
export async function GET() {
  try {
    // ローカル開発環境でデータベースが設定されていない場合はモックデータを返す
    if (!sql) {
      return NextResponse.json(
        categories.map((cat) => ({
          ...cat,
          created_at: new Date().toISOString(),
        }))
      );
    }

    const categoriesData = await sql`
      SELECT id, name, created_at
      FROM categories
      ORDER BY id
    `;

    return NextResponse.json(categoriesData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// カテゴリ追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // ローカル開発環境でデータベースが設定されていない場合
    if (!sql) {
      return NextResponse.json(
        {
          error: 'Database not configured. Please set DATABASE_URL in .env.local',
        },
        { status: 503 }
      );
    }

    const [category] = await sql`
      INSERT INTO categories (name)
      VALUES (${name.trim()})
      RETURNING id, name, created_at
    `;

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);

    // ユニーク制約違反の場合
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

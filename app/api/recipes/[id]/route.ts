import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';

// レシピ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, url, imageUrls, categoryIds } = body;

    if (!title || !categoryIds || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'Title and at least one category are required' },
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

    // レシピの存在確認
    const [existingRecipe] = await sql`
      SELECT id FROM recipes WHERE id = ${id}
    `;

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // レシピを更新
    const [recipe] = await sql`
      UPDATE recipes
      SET title = ${title}, url = ${url || null}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, url, created_at, updated_at
    `;

    // 既存のカテゴリ関連を削除
    await sql`
      DELETE FROM recipe_categories WHERE recipe_id = ${id}
    `;

    // 新しいカテゴリ関連を追加
    for (const categoryId of categoryIds) {
      await sql`
        INSERT INTO recipe_categories (recipe_id, category_id)
        VALUES (${id}, ${categoryId})
      `;
    }

    // 画像の更新（既存の画像を削除して新しい画像を追加）
    await sql`
      DELETE FROM recipe_images WHERE recipe_id = ${id}
    `;

    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        await sql`
          INSERT INTO recipe_images (recipe_id, image_url, display_order)
          VALUES (${id}, ${imageUrls[i]}, ${i})
        `;
      }
    }

    // カテゴリ情報を取得
    const categories = await sql`
      SELECT c.id, c.name
      FROM categories c
      INNER JOIN recipe_categories rc ON c.id = rc.category_id
      WHERE rc.recipe_id = ${id}
      ORDER BY c.id
    `;

    // 画像情報を取得
    const images = await sql`
      SELECT image_url
      FROM recipe_images
      WHERE recipe_id = ${id}
      ORDER BY display_order, id
    `;

    const result = {
      ...recipe,
      categories,
      image_urls: images.map((img: any) => img.image_url),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

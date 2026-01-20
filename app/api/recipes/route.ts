import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/app/lib/db';
import { mockRecipes } from '@/app/lib/mockData';

// レシピ一覧取得
export async function GET(request: NextRequest) {
  try {
    // ローカル開発環境でデータベースが設定されていない場合はモックデータを返す
    if (!sql) {
      return NextResponse.json(
        mockRecipes.map((recipe) => ({
          ...recipe,
          created_at: recipe.createdAt.toISOString(),
          updated_at: recipe.createdAt.toISOString(),
          image_urls: recipe.imageUrls || [],
        }))
      );
    }
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');

    let recipes;

    if (categoryId) {
      // カテゴリでフィルタリング
      const catId = parseInt(categoryId);
      recipes = await sql`
        SELECT
          r.id,
          r.title,
          r.url,
          r.created_at,
          r.updated_at,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', c.id, 'name', c.name)
              ORDER BY jsonb_build_object('id', c.id, 'name', c.name)
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'
          ) as categories,
          COALESCE(
            (
              SELECT json_agg(ri.image_url ORDER BY ri.display_order, ri.id)
              FROM recipe_images ri
              WHERE ri.recipe_id = r.id
            ),
            '[]'
          ) as image_urls
        FROM recipes r
        LEFT JOIN recipe_categories rc ON r.id = rc.recipe_id
        LEFT JOIN categories c ON rc.category_id = c.id
        WHERE r.id IN (
          SELECT recipe_id
          FROM recipe_categories
          WHERE category_id = ${catId}
        )
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;
    } else {
      // 全件取得
      recipes = await sql`
        SELECT
          r.id,
          r.title,
          r.url,
          r.created_at,
          r.updated_at,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object('id', c.id, 'name', c.name)
              ORDER BY jsonb_build_object('id', c.id, 'name', c.name)
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'
          ) as categories,
          COALESCE(
            (
              SELECT json_agg(ri.image_url ORDER BY ri.display_order, ri.id)
              FROM recipe_images ri
              WHERE ri.recipe_id = r.id
            ),
            '[]'
          ) as image_urls
        FROM recipes r
        LEFT JOIN recipe_categories rc ON r.id = rc.recipe_id
        LEFT JOIN categories c ON rc.category_id = c.id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;
    }

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// レシピ登録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, imageUrls, categoryIds } = body;

    if (!title || !url || !categoryIds || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'Title, URL, and at least one category are required' },
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

    // レシピを挿入
    const [recipe] = await sql`
      INSERT INTO recipes (title, url)
      VALUES (${title}, ${url})
      RETURNING id, title, url, created_at, updated_at
    `;

    // 画像を挿入
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        await sql`
          INSERT INTO recipe_images (recipe_id, image_url, display_order)
          VALUES (${recipe.id}, ${imageUrls[i]}, ${i})
        `;
      }
    }

    // カテゴリとの関連付け
    for (const categoryId of categoryIds) {
      await sql`
        INSERT INTO recipe_categories (recipe_id, category_id)
        VALUES (${recipe.id}, ${categoryId})
      `;
    }

    // カテゴリ情報を取得
    const categories = await sql`
      SELECT c.id, c.name
      FROM categories c
      INNER JOIN recipe_categories rc ON c.id = rc.category_id
      WHERE rc.recipe_id = ${recipe.id}
      ORDER BY c.id
    `;

    // 画像情報を取得
    const images = await sql`
      SELECT image_url
      FROM recipe_images
      WHERE recipe_id = ${recipe.id}
      ORDER BY display_order, id
    `;

    const result = {
      ...recipe,
      categories,
      image_urls: images.map((img: any) => img.image_url),
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}

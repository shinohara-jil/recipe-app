'use client';

import { useState, useEffect } from 'react';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import CategoryFilter from './components/CategoryFilter';
import CategoryEditModal from './components/CategoryEditModal';
import { Recipe, Category } from './types/recipe';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isCategoryEditModalOpen, setIsCategoryEditModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // カテゴリとレシピの初期データ取得
  useEffect(() => {
    fetchCategories();
    fetchRecipes();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        const formattedRecipes = data.map((recipe: any) => ({
          ...recipe,
          imageUrls: recipe.image_urls || [],
          createdAt: new Date(recipe.created_at),
        }));
        setRecipes(formattedRecipes);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecipes = (() => {
    let filtered = recipes;

    // カテゴリでフィルタリング（AND条件：選択されたすべてのカテゴリを含むレシピのみ表示）
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((recipe) =>
        selectedCategories.every((selectedId) =>
          recipe.categories.some((cat) => cat.id === selectedId)
        )
      );
    }

    // レシピ提供者でフィルタリング
    if (selectedProvider) {
      filtered = filtered.filter((recipe) => {
        if (selectedProvider === 'その他') {
          return !recipe.provider || (recipe.provider !== '長谷川あかり' && recipe.provider !== 'もも');
        }
        return recipe.provider === selectedProvider;
      });
    }

    return filtered;
  })();

  const handleToggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilter = () => {
    setSelectedCategories([]);
  };

  const handleRecipeClick = (recipeId: string) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecipe(null);
  };

  const handleUpdateCategory = async (categoryId: number, newName: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        const updatedCategory = await response.json();
        // カテゴリ一覧を更新
        setCategories(categories.map((c) =>
          c.id === categoryId ? { ...c, name: updatedCategory.name } : c
        ));
        // レシピ内のカテゴリも更新
        setRecipes(recipes.map((recipe) => ({
          ...recipe,
          categories: recipe.categories.map((c) =>
            c.id === categoryId ? { ...c, name: updatedCategory.name } : c
          ),
        })));
        return true;
      } else {
        if (response.status === 503) {
          alert(
            'データベースが設定されていません。\n' +
            'ローカル開発では閲覧のみ可能です。'
          );
        } else if (response.status === 409) {
          alert('同じ名前のカテゴリが既に存在します。');
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      return false;
    }
  };

  const handleAddCategory = async (name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, { id: newCategory.id, name: newCategory.name }]);
        return true;
      } else {
        if (response.status === 503) {
          alert(
            'データベースが設定されていません。\n' +
            'ローカル開発では閲覧のみ可能です。'
          );
        } else if (response.status === 409) {
          alert('同じ名前のカテゴリが既に存在します。');
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      return false;
    }
  };

  const handleDeleteCategory = async (categoryId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // カテゴリ一覧から削除
        setCategories(categories.filter((c) => c.id !== categoryId));
        // レシピ内のカテゴリも削除
        setRecipes(recipes.map((recipe) => ({
          ...recipe,
          categories: recipe.categories.filter((c) => c.id !== categoryId),
        })));
        // フィルター選択から削除
        setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
        return true;
      } else {
        if (response.status === 503) {
          alert(
            'データベースが設定されていません。\n' +
            'ローカル開発では閲覧のみ可能です。'
          );
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      return false;
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // レシピ一覧から削除
        setRecipes(recipes.filter((r) => r.id !== recipeId));
        // 展開状態をクリア
        if (expandedRecipeId === recipeId) {
          setExpandedRecipeId(null);
        }
      } else {
        if (response.status === 503) {
          alert(
            'データベースが設定されていません。\n' +
            'ローカル開発では閲覧のみ可能です。'
          );
        } else {
          alert('レシピの削除に失敗しました');
        }
      }
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      alert('レシピの削除に失敗しました');
    }
  };

  const handleSubmitRecipe = async (data: {
    title: string;
    url: string;
    provider: string;
    categoryIds: number[];
    images?: File[];
    existingImageUrls?: string[];
  }) => {
    try {
      // 新しい画像のアップロード
      const newImageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        for (const image of data.images) {
          const formData = new FormData();
          formData.append('file', image);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            newImageUrls.push(uploadData.url);
          } else {
            const errorData = await uploadResponse.json();
            // ローカル開発環境で設定されていない場合は警告のみ
            if (uploadResponse.status === 503) {
              console.warn('画像ストレージが設定されていません:', errorData.error);
              break; // 1つ失敗したら残りもスキップ
            } else {
              alert('画像のアップロードに失敗しました');
              return;
            }
          }
        }
      }

      // 既存の画像と新しい画像を結合
      const allImageUrls = [
        ...(data.existingImageUrls || []),
        ...newImageUrls,
      ];

      if (editingRecipe) {
        // 編集モード
        const response = await fetch(`/api/recipes/${editingRecipe.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: data.title,
            url: data.url,
            provider: data.provider,
            imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
            categoryIds: data.categoryIds,
          }),
        });

        if (response.ok) {
          const updatedRecipe = await response.json();
          setRecipes(recipes.map((r) =>
            r.id === editingRecipe.id
              ? {
                  ...updatedRecipe,
                  imageUrls: updatedRecipe.image_urls || [],
                  createdAt: new Date(updatedRecipe.created_at),
                }
              : r
          ));
        } else {
          const errorData = await response.json();
          if (response.status === 503) {
            alert(
              'データベースが設定されていません。\n' +
              'ローカル開発では閲覧のみ可能です。\n' +
              'レシピを編集するには .env.local に DATABASE_URL を設定してください。'
            );
          } else {
            alert('レシピの更新に失敗しました');
          }
        }
      } else {
        // 新規登録モード
        const response = await fetch('/api/recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: data.title,
            url: data.url,
            provider: data.provider,
            imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
            categoryIds: data.categoryIds,
          }),
        });

        if (response.ok) {
          const newRecipe = await response.json();
          setRecipes([
            {
              ...newRecipe,
              imageUrls: newRecipe.image_urls || [],
              createdAt: new Date(newRecipe.created_at),
            },
            ...recipes,
          ]);
        } else {
          const errorData = await response.json();
          if (response.status === 503) {
            alert(
              'データベースが設定されていません。\n' +
              'ローカル開発では閲覧のみ可能です。\n' +
              'レシピを登録するには .env.local に DATABASE_URL を設定してください。'
            );
          } else {
            alert('レシピの登録に失敗しました');
          }
        }
      }
    } catch (error) {
      console.error('Failed to save recipe:', error);
      alert(editingRecipe ? 'レシピの更新に失敗しました' : 'レシピの登録に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-2 py-3 max-w-7xl">
        <header className="mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <h1 className="text-2xl font-bold text-gray-800">
              🍳 レシピ帳
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCategoryEditModalOpen(true)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
                title="カテゴリ編集"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6h.008v.008H6V6Z"
                  />
                </svg>
                <span className="hidden sm:inline">カテゴリ</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 text-white rounded-full font-semibold shadow-lg hover:bg-orange-600 transition-all hover:shadow-xl active:scale-95 text-xs sm:text-sm whitespace-nowrap"
              >
                ＋ 新規登録
              </button>
            </div>
          </div>
        </header>

        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            onClearFilter={handleClearFilter}
          />
        )}

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-gray-600">
              全 {filteredRecipes.length} 件のレシピ
              {(selectedCategories.length > 0 || selectedProvider) && (
                <span className="ml-1 text-orange-600 font-medium">
                  (絞り込み中)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-600 font-medium">提供者:</span>
            <button
              onClick={() => setSelectedProvider(selectedProvider === '長谷川あかり' ? null : '長谷川あかり')}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedProvider === '長谷川あかり'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              長谷川あかり
            </button>
            <button
              onClick={() => setSelectedProvider(selectedProvider === 'もも' ? null : 'もも')}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedProvider === 'もも'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              もも
            </button>
            <button
              onClick={() => setSelectedProvider(selectedProvider === 'その他' ? null : 'その他')}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedProvider === 'その他'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              その他
            </button>
            {selectedProvider && (
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-1.5 py-1 text-xs text-gray-600 hover:text-gray-800 underline"
              >
                クリア
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleRecipeClick(recipe.id)}
                  isExpanded={expandedRecipeId === recipe.id}
                  onEdit={() => handleEditRecipe(recipe)}
                />
              ))}
            </div>

            {filteredRecipes.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg">
                  {selectedCategories.length > 0
                    ? '該当するレシピが見つかりませんでした'
                    : 'レシピがまだ登録されていません'}
                </p>
                {selectedCategories.length > 0 ? (
                  <button
                    onClick={handleClearFilter}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    フィルターをクリア
                  </button>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600"
                  >
                    最初のレシピを登録
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <RecipeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categories={categories}
        onSubmit={handleSubmitRecipe}
        onDelete={handleDeleteRecipe}
        editingRecipe={editingRecipe}
      />

      <CategoryEditModal
        isOpen={isCategoryEditModalOpen}
        onClose={() => setIsCategoryEditModalOpen(false)}
        categories={categories}
        onUpdate={handleUpdateCategory}
        onAdd={handleAddCategory}
        onDelete={handleDeleteCategory}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import CategoryFilter from './components/CategoryFilter';
import SearchInput from './components/SearchInput';
import CategoryEditModal from './components/CategoryEditModal';
import PantryModal from './components/PantryModal';
import PasscodeModal from './components/PasscodeModal';
import ChatModal, { type ChatMessage } from './components/ChatModal';
import { Recipe, Category, Ingredient, PantryItem, ExtractionStatus } from './types/recipe';

// APIから届くレシピの形
interface RecipeRow {
  id: string;
  title: string;
  url?: string;
  provider?: string;
  categories: Category[];
  image_urls?: string[];
  created_at: string;
  is_today_menu?: boolean;
  today_menu_set_at?: string;
  ingredients?: Ingredient[];
  servings?: string | null;
  extraction_status?: ExtractionStatus;
  extraction_source?: string | null;
}

// APIのレシピ（スネークケース）を画面用の形に変換
const toRecipe = (row: RecipeRow): Recipe => ({
  id: row.id,
  title: row.title,
  url: row.url,
  provider: row.provider,
  categories: row.categories,
  imageUrls: row.image_urls || [],
  createdAt: new Date(row.created_at),
  isTodayMenu: row.is_today_menu || false,
  todayMenuSetAt: row.today_menu_set_at ? new Date(row.today_menu_set_at) : undefined,
  ingredients: row.ingredients || [],
  servings: row.servings,
  extractionStatus: row.extraction_status || 'none',
  extractionSource: row.extraction_source,
});

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
  const [searchQuery, setSearchQuery] = useState('');
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [isPantryModalOpen, setIsPantryModalOpen] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  // 合言葉の入力が済んだら実行する処理（読み取りの再開など）
  const afterPasscode = useRef<(() => void) | null>(null);
  const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pantryNames = new Set(pantry.map((p) => p.name));
  const [isChatOpen, setIsChatOpen] = useState(false);
  // 相談の会話はページを開いている間だけ残す（保存はしない）
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // カテゴリとレシピの初期データ取得
  useEffect(() => {
    fetchCategories();
    fetchRecipes();
    fetchPantry();
  }, []);

  // 読み取り中のレシピがあれば、3秒おきに状態を確認して画面に反映する
  const processingIds = recipes.filter((r) => r.extractionStatus === 'processing').map((r) => r.id).join(',');
  useEffect(() => {
    if (!processingIds) return;
    const timer = setInterval(async () => {
      for (const id of processingIds.split(',')) {
        try {
          const response = await fetch(`/api/recipes/${id}/extract`);
          if (!response.ok) continue;
          const data = await response.json();
          if (data.extraction_status === 'processing') continue;
          updateRecipe(id, {
            ingredients: data.ingredients,
            servings: data.servings,
            extractionStatus: data.extraction_status,
            extractionSource: data.extraction_source,
          });
          const title = recipes.find((r) => r.id === id)?.title ?? 'レシピ';
          showToast(
            data.extraction_status === 'failed'
              ? `「${title}」の材料を読み取れませんでした`
              : `「${title}」の材料を読み取りました`
          );
        } catch (error) {
          console.error('Failed to check extraction:', error);
        }
      }
    }, 3000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingIds]);

  // 今日のメニューの日付チェック(午前0時を超えたら自動解除)
  useEffect(() => {
    const checkTodayMenu = async () => {
      const todayMenuRecipe = recipes.find((r) => r.isTodayMenu);
      if (!todayMenuRecipe || !todayMenuRecipe.todayMenuSetAt) return;

      const setDate = new Date(todayMenuRecipe.todayMenuSetAt);
      const now = new Date();

      // 設定日と現在日が異なる場合(日付が変わった場合)、フラグを解除
      if (
        setDate.getFullYear() !== now.getFullYear() ||
        setDate.getMonth() !== now.getMonth() ||
        setDate.getDate() !== now.getDate()
      ) {
        try {
          const response = await fetch(`/api/recipes/${todayMenuRecipe.id}/today-menu`, {
            method: 'DELETE',
          });

          if (response.ok) {
            // ローカルステートを更新
            setRecipes(recipes.map((r) =>
              r.id === todayMenuRecipe.id
                ? { ...r, isTodayMenu: false, todayMenuSetAt: undefined }
                : r
            ));
          }
        } catch (error) {
          console.error('Failed to clear today menu:', error);
        }
      }
    };

    checkTodayMenu();

    // 1分ごとにチェック
    const interval = setInterval(checkTodayMenu, 60000);
    return () => clearInterval(interval);
  }, [recipes]);

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
        setRecipes(data.map(toRecipe));
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPantry = async () => {
    try {
      const response = await fetch('/api/pantry');
      if (response.ok) setPantry(await response.json());
    } catch (error) {
      console.error('Failed to fetch pantry:', error);
    }
  };

  const showToast = (message: string, action?: { label: string; onClick: () => void }) => {
    setToast({ message, action });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const updateRecipe = (id: string, changes: Partial<Recipe>) =>
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes } : r)));

  // 材料の読み取りを始める。合言葉が未入力なら入力してもらってから続ける
  const requestExtraction = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/extract`, { method: 'POST' });
      if (response.status === 401) {
        requirePasscode(() => requestExtraction(recipeId));
        return;
      }
      if (response.ok) {
        updateRecipe(recipeId, { extractionStatus: 'processing' });
      } else if (response.status === 503) {
        alert('データベースが設定されていないため、材料を読み取れません。');
      } else {
        showToast('材料の読み取りを始められませんでした');
      }
    } catch (error) {
      console.error('Failed to start extraction:', error);
      showToast('材料の読み取りを始められませんでした');
    }
  };

  const handleSaveIngredients = async (recipeId: string, ingredients: Ingredient[]) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/ingredients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      updateRecipe(recipeId, { ingredients: data.ingredients, extractionStatus: data.extraction_status });
      showToast('材料を保存しました');
      return true;
    } catch (error) {
      console.error('Failed to save ingredients:', error);
      showToast('材料を保存できませんでした');
      return false;
    }
  };

  const addPantryItem = async (name: string) => {
    try {
      const response = await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const item: PantryItem = await response.json();
      setPantry((prev) => (prev.some((p) => p.id === item.id) ? prev : [...prev, item]));
      return item;
    } catch (error) {
      console.error('Failed to add pantry item:', error);
      showToast('家にある物に追加できませんでした');
      return null;
    }
  };

  const deletePantryItem = async (item: PantryItem) => {
    try {
      const response = await fetch(`/api/pantry/${item.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setPantry((prev) => prev.filter((p) => p.id !== item.id));
      return true;
    } catch (error) {
      console.error('Failed to delete pantry item:', error);
      showToast('家にある物から外せませんでした');
      return false;
    }
  };

  // 合言葉が未入力のとき、入力してもらってから retry を実行する
  const requirePasscode = (retry: () => void) => {
    afterPasscode.current = retry;
    setIsPasscodeModalOpen(true);
  };

  // 相談で提案されたレシピを開く（絞り込みを外して、そのレシピまでスクロール）
  const openRecipeFromChat = (recipeId: string) => {
    setIsChatOpen(false);
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedProvider(null);
    setExpandedRecipeId(recipeId);
    setTimeout(() => {
      document.getElementById(`recipe-${recipeId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // レシピの材料の横の「家にある」ボタンから追加
  const handleAddPantryFromRecipe = async (name: string) => {
    const item = await addPantryItem(name);
    if (item) {
      showToast(`「${item.name}」を家にある物に追加しました。ほかのレシピにも反映されます`, {
        label: '元に戻す',
        onClick: () => deletePantryItem(item),
      });
    }
  };

  const handleDeletePantryFromModal = async (item: PantryItem) => {
    if (await deletePantryItem(item)) {
      showToast(`「${item.name}」を外しました`, { label: '元に戻す', onClick: () => addPantryItem(item.name) });
    }
  };

  const filteredRecipes = (() => {
    // 元の配列を変更しないようにコピーを作成
    let filtered = [...recipes];

    // フリーワード検索（タイトルの部分一致）
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((recipe) =>
        recipe.title.toLowerCase().includes(query)
      );
    }

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

    // ソート: 今日のメニューを最上部に、その後は作成日時の降順
    filtered.sort((a, b) => {
      // 今日のメニューが優先
      if (a.isTodayMenu && !b.isTodayMenu) return -1;
      if (!a.isTodayMenu && b.isTodayMenu) return 1;

      // 両方とも今日のメニュー、または両方とも今日のメニューでない場合は作成日時で降順
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

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

  const handleToggleTodayMenu = async (recipe: Recipe) => {
    try {
      if (recipe.isTodayMenu) {
        // 解除
        const response = await fetch(`/api/recipes/${recipe.id}/today-menu`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setRecipes(recipes.map((r) =>
            r.id === recipe.id
              ? { ...r, isTodayMenu: false, todayMenuSetAt: undefined }
              : r
          ));
        } else {
          if (response.status === 503) {
            alert('データベースが設定されていません。');
          } else {
            alert('今日のメニューの解除に失敗しました');
          }
        }
      } else {
        // 設定
        const response = await fetch(`/api/recipes/${recipe.id}/today-menu`, {
          method: 'PUT',
        });

        if (response.ok) {
          const data = await response.json();
          // 他のレシピの今日のメニューフラグを解除し、このレシピのみ設定
          setRecipes(recipes.map((r) =>
            r.id === recipe.id
              ? { ...r, isTodayMenu: true, todayMenuSetAt: new Date(data.today_menu_set_at) }
              : { ...r, isTodayMenu: false, todayMenuSetAt: undefined }
          ));
        } else {
          if (response.status === 503) {
            alert('データベースが設定されていません。');
          } else {
            alert('今日のメニューの設定に失敗しました');
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle today menu:', error);
      alert('今日のメニューの設定変更に失敗しました');
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
          const sourceChanged =
            (editingRecipe.url || '') !== (data.url || '') ||
            (editingRecipe.imageUrls || []).join() !== allImageUrls.join();
          setRecipes(recipes.map((r) =>
            r.id === editingRecipe.id
              ? {
                  ...r,
                  ...updatedRecipe,
                  imageUrls: updatedRecipe.image_urls || [],
                  createdAt: new Date(updatedRecipe.created_at),
                }
              : r
          ));
          // リンクや画像が変わったら材料を読み取り直す
          if (sourceChanged && (data.url || allImageUrls.length)) requestExtraction(editingRecipe.id);
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
          setRecipes([toRecipe(newRecipe), ...recipes]);
          // 登録したら材料の読み取りを自動で始める
          if (data.url || allImageUrls.length) requestExtraction(newRecipe.id);
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
                onClick={() => setIsPantryModalOpen(true)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
                title="家にある物"
              >
                <span aria-hidden="true">⌂</span>
                家にある物
              </button>
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

        <SearchInput value={searchQuery} onChange={setSearchQuery} />

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
              {(selectedCategories.length > 0 || selectedProvider || searchQuery.trim()) && (
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
                  onToggleTodayMenu={() => handleToggleTodayMenu(recipe)}
                  pantryNames={pantryNames}
                  onAddPantry={handleAddPantryFromRecipe}
                  onSaveIngredients={(ingredients) => handleSaveIngredients(recipe.id, ingredients)}
                  onExtract={() => requestExtraction(recipe.id)}
                  onToast={showToast}
                />
              ))}
            </div>

            {filteredRecipes.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg">
                  {(selectedCategories.length > 0 || selectedProvider || searchQuery.trim())
                    ? '該当するレシピが見つかりませんでした'
                    : 'レシピがまだ登録されていません'}
                </p>
                {(selectedCategories.length > 0 || selectedProvider || searchQuery.trim()) ? (
                  <button
                    onClick={() => {
                      handleClearFilter();
                      setSelectedProvider(null);
                      setSearchQuery('');
                    }}
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

      {isPantryModalOpen && (
        <PantryModal
          onClose={() => setIsPantryModalOpen(false)}
          items={pantry}
          onAdd={async (name) => !!(await addPantryItem(name))}
          onDelete={handleDeletePantryFromModal}
        />
      )}

      {isChatOpen && (
        <ChatModal
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onMessagesChange={setChatMessages}
          recipes={recipes}
          onOpenRecipe={openRecipeFromChat}
          onToggleTodayMenu={handleToggleTodayMenu}
          requirePasscode={requirePasscode}
        />
      )}

      {!isChatOpen && (
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-1.5 rounded-full bg-gray-800 px-4 py-3 font-bold text-white shadow-xl hover:bg-gray-700 active:scale-95"
        >
          <span aria-hidden="true">💬</span>
          AIに相談
        </button>
      )}

      {isPasscodeModalOpen && (
        <PasscodeModal
          onClose={() => {
            setIsPasscodeModalOpen(false);
            afterPasscode.current = null;
          }}
          onSuccess={() => {
            setIsPasscodeModalOpen(false);
            const next = afterPasscode.current;
            afterPasscode.current = null;
            next?.();
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[70] flex items-center gap-3 max-w-[calc(100%-2rem)] rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white shadow-xl"
        >
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                setToast(null);
              }}
              className="whitespace-nowrap font-bold text-orange-300"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

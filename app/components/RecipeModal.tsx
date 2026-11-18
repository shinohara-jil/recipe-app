'use client';

import { Category, Recipe } from '@/app/types/recipe';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { categoryButtonClass } from '@/app/lib/categoryColors';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: {
    title: string;
    url: string;
    provider: string;
    categoryIds: number[];
    images?: File[];
    existingImageUrls?: string[];
  }) => void;
  editingRecipe?: Recipe | null;
}

export default function RecipeModal({
  isOpen,
  onClose,
  categories,
  onSubmit,
  editingRecipe,
}: RecipeModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [provider, setProvider] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const isEditMode = !!editingRecipe;

  // 編集モード時に初期値をセット
  useEffect(() => {
    if (isOpen && editingRecipe) {
      setTitle(editingRecipe.title);
      setUrl(editingRecipe.url || '');
      setProvider(editingRecipe.provider || '');
      setSelectedCategories(editingRecipe.categories.map((c) => c.id));
      setExistingImageUrls(editingRecipe.imageUrls || []);
      setImagePreviews([]);
      setImageFiles([]);
    } else if (isOpen && !editingRecipe) {
      // 新規登録モード時はリセット
      setTitle('');
      setUrl('');
      setProvider('');
      setSelectedCategories([]);
      setExistingImageUrls([]);
      setImagePreviews([]);
      setImageFiles([]);
    }
  }, [isOpen, editingRecipe]);

  if (!isOpen) return null;

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    const heic2any = (await import('heic2any')).default;
    const blob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });
    const resultBlob = Array.isArray(blob) ? blob[0] : blob;
    return new File([resultBlob], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg',
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsConverting(true);
      const processedFiles: File[] = [];

      for (const file of Array.from(files)) {
        try {
          if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
            const convertedFile = await convertHeicToJpeg(file);
            processedFiles.push(convertedFile);
          } else {
            processedFiles.push(file);
          }
        } catch (error) {
          console.error('Failed to convert HEIC:', error);
          processedFiles.push(file);
        }
      }

      setImageFiles((prev) => [...prev, ...processedFiles]);

      // プレビュー生成
      processedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      setIsConverting(false);
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      url,
      provider,
      categoryIds: selectedCategories,
      images: imageFiles.length > 0 ? imageFiles : undefined,
      existingImageUrls: existingImageUrls.length > 0 ? existingImageUrls : undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setUrl('');
    setProvider('');
    setSelectedCategories([]);
    setImagePreviews([]);
    setImageFiles([]);
    setExistingImageUrls([]);
    onClose();
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    // スマホでは画面いっぱい（AI相談と同じ）、PCでは中央の小窓
    <div className="fixed inset-0 z-50 flex justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title">
      <form
        onSubmit={handleSubmit}
        className="flex h-full w-full max-w-2xl flex-col bg-white sm:h-auto sm:max-h-[90dvh] sm:rounded-lg sm:shadow-xl"
      >
        <div className="flex flex-none items-center justify-between border-b border-gray-200 px-4 py-3 sm:rounded-t-lg">
          <h2 id="recipe-modal-title" className="text-xl font-bold text-gray-800">
            {isEditMode ? 'レシピを編集' : 'レシピを登録'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="閉じる"
            className="-mr-2 px-3 py-1 text-3xl leading-none text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              enterKeyHint="next"
              className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="例: 定番のハンバーグ"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL <span className="text-gray-500 text-xs">(任意)</span>
            </label>
            <input
              type="url"
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com/recipe"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              レシピ提供者 <span className="text-gray-500 text-xs">(任意)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setProvider('長谷川あかり')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  provider === '長谷川あかり'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                長谷川あかり
              </button>
              <button
                type="button"
                onClick={() => setProvider('もも')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  provider === 'もも'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                もも
              </button>
            </div>
            <input
              type="text"
              value={provider !== '長谷川あかり' && provider !== 'もも' ? provider : ''}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mt-2"
              placeholder="または名前を入力"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    aria-pressed={isSelected}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${categoryButtonClass(
                      category.id,
                      category.name,
                      isSelected
                    )}`}
                  >
                    {isSelected && '✓ '}
                    {category.name}
                  </button>
                );
              })}
            </div>
            {selectedCategories.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                少なくとも1つのカテゴリを選択してください
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              画像 <span className="text-gray-500 text-xs">(任意・複数選択可)</span>
            </label>
            {/* 標準のファイル選択欄はスマホで横にはみ出すので、ボタンの見た目にする */}
            <label
              className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 px-4 py-3 text-base font-semibold text-orange-700 ${
                isConverting ? 'opacity-50' : 'cursor-pointer hover:bg-orange-100'
              }`}
            >
              <input
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                onChange={(e) => {
                  handleImageChange(e);
                  e.target.value = ''; // 同じ画像を選び直せるようにする
                }}
                disabled={isConverting}
                className="sr-only"
              />
              ＋ 画像を選ぶ
            </label>
            {isConverting && (
              <p className="mt-2 text-sm text-orange-600">画像を変換中...</p>
            )}

            {/* 既存の画像（編集モード時） */}
            {existingImageUrls.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">
                  登録済み画像 ({existingImageUrls.length}枚):
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {existingImageUrls.map((imageUrl, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={imageUrl}
                          alt={`登録済み画像 ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 新しくアップロードする画像のプレビュー */}
            {imagePreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">
                  新しい画像 ({imagePreviews.length}枚):
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative">
                      <div className="relative h-32 w-full rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={preview}
                          alt={`プレビュー ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ボタンは常に画面の下に出しておく（長いフォームでも探さずに押せる） */}
        <div className="flex flex-none gap-3 border-t border-gray-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:rounded-b-lg">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={selectedCategories.length === 0}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isEditMode ? '更新する' : '登録する'}
            </button>
        </div>
      </form>
    </div>
  );
}

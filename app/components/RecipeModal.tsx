'use client';

import { Category } from '@/app/types/recipe';
import Image from 'next/image';
import { useState } from 'react';
import { getCategoryColor } from '@/app/lib/categoryColors';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (data: {
    title: string;
    url: string;
    categoryIds: number[];
    images?: File[];
  }) => void;
}

export default function RecipeModal({
  isOpen,
  onClose,
  categories,
  onSubmit,
}: RecipeModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setImageFiles((prev) => [...prev, ...newFiles]);

      // プレビュー生成
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      url,
      categoryIds: selectedCategories,
      images: imageFiles.length > 0 ? imageFiles : undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setUrl('');
    setSelectedCategories([]);
    setImagePreviews([]);
    setImageFiles([]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">レシピを登録</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="例: 定番のハンバーグ"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com/recipe"
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
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      isSelected
                        ? getCategoryColor(category.id)
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
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
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">
                  プレビュー ({imagePreviews.length}枚):
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
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
                        onClick={() => removeImage(index)}
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

          <div className="flex gap-3 pt-4">
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
              登録する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

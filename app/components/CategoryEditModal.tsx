'use client';

import { Category } from '@/app/types/recipe';
import { useState, useEffect } from 'react';
import { getCategoryColor } from '@/app/lib/categoryColors';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdate: (categoryId: number, newName: string) => Promise<boolean>;
  onAdd: (name: string) => Promise<boolean>;
}

export default function CategoryEditModal({
  isOpen,
  onClose,
  categories,
  onUpdate,
  onAdd,
}: CategoryEditModalProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEditingId(null);
      setEditingName('');
      setNewCategoryName('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    const originalCategory = categories.find((c) => c.id === editingId);
    if (originalCategory && originalCategory.name === editingName.trim()) {
      handleCancelEdit();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const success = await onUpdate(editingId, editingName.trim());

    setIsSubmitting(false);

    if (success) {
      setEditingId(null);
      setEditingName('');
    } else {
      setError('更新に失敗しました');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsAdding(true);
    setError(null);

    const success = await onAdd(newCategoryName.trim());

    setIsAdding(false);

    if (success) {
      setNewCategoryName('');
    } else {
      setError('追加に失敗しました');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCategory();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            カテゴリ編集
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 新規追加フォーム */}
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新しいカテゴリを追加
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={handleAddKeyDown}
                placeholder="カテゴリ名を入力"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                disabled={isAdding}
              />
              <button
                onClick={handleAddCategory}
                disabled={isAdding || !newCategoryName.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isAdding ? '...' : '追加'}
              </button>
            </div>
          </div>

          {/* 既存カテゴリ一覧 */}
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span
                  className={`w-3 h-3 rounded-full ${getCategoryColor(category.id).split(' ')[0]}`}
                />

                {editingId === category.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      autoFocus
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSubmitting || !editingName.trim()}
                      className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '...' : '保存'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-gray-800">{category.name}</span>
                    <button
                      onClick={() => handleStartEdit(category)}
                      className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                      title="編集"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            カテゴリ名を変更すると、すべてのレシピに反映されます。
          </p>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

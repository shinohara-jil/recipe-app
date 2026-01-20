'use client';

import { Category } from '@/app/types/recipe';
import { getCategoryColor } from '@/app/lib/categoryColors';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: number[];
  onToggleCategory: (categoryId: number) => void;
  onClearFilter: () => void;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onToggleCategory,
  onClearFilter,
}: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">カテゴリで絞り込み</h3>
        {selectedCategories.length > 0 && (
          <button
            onClick={onClearFilter}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            クリア
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <button
              key={category.id}
              onClick={() => onToggleCategory(category.id)}
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
    </div>
  );
}

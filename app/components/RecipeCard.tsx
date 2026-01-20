'use client';

import { Recipe } from '@/app/types/recipe';
import Image from 'next/image';
import { getCategoryColor } from '@/app/lib/categoryColors';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  isExpanded: boolean;
}

export default function RecipeCard({ recipe, onClick, isExpanded }: RecipeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div onClick={onClick} className="cursor-pointer p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {recipe.title}
        </h3>

        <div className="flex flex-wrap gap-2">
          {recipe.categories.map((category) => (
            <span
              key={category.id}
              className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(category.id)}`}
            >
              {category.name}
            </span>
          ))}
        </div>
      </div>

      {isExpanded && (
        <div
          className="border-t border-gray-200 p-4 bg-gray-50 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">レシピURL</h4>
              <a
                href={recipe.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
              >
                {recipe.url}
              </a>
            </div>

            {recipe.imageUrls && recipe.imageUrls.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  画像 ({recipe.imageUrls.length}枚)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {recipe.imageUrls.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative h-48 w-full rounded-lg overflow-hidden"
                    >
                      <Image
                        src={imageUrl}
                        alt={`${recipe.title} - ${index + 1}`}
                        fill
                        className="object-cover bg-gray-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">
              登録日: {recipe.createdAt.toLocaleDateString('ja-JP')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

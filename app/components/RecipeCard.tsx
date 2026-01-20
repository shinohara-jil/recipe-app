'use client';

import { Recipe } from '@/app/types/recipe';
import Image from 'next/image';
import { getCategoryColor } from '@/app/lib/categoryColors';
import { useState } from 'react';
import ImageModal from './ImageModal';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  isExpanded: boolean;
}

export default function RecipeCard({ recipe, onClick, isExpanded }: RecipeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const hasMultipleImages = recipe.imageUrls && recipe.imageUrls.length > 1;

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? (recipe.imageUrls?.length || 1) - 1 : prev - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === (recipe.imageUrls?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  return (
    <>
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
            {recipe.url && (
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
            )}

            {recipe.imageUrls && recipe.imageUrls.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  画像 ({recipe.imageUrls.length}枚)
                </h4>
                <div className="relative">
                  <div
                    className="relative h-64 w-full rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => openImageModal(currentImageIndex)}
                  >
                    <Image
                      src={recipe.imageUrls[currentImageIndex]}
                      alt={`${recipe.title} - ${currentImageIndex + 1}`}
                      fill
                      className="object-cover bg-gray-100"
                    />
                  </div>

                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        ‹
                      </button>
                      <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {currentImageIndex + 1} / {recipe.imageUrls.length}
                      </div>
                    </>
                  )}
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

      {showImageModal && recipe.imageUrls && (
        <ImageModal
          images={recipe.imageUrls}
          initialIndex={modalImageIndex}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
}

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
  onEdit: () => void;
}

export default function RecipeCard({ recipe, onClick, isExpanded, onEdit }: RecipeCardProps) {
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
      <div onClick={onClick} className="cursor-pointer p-3">
        <h3 className="text-base font-semibold text-gray-800 mb-2">
          {recipe.title}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {recipe.categories.map((category) => (
            <span
              key={category.id}
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(category.id)}`}
            >
              {category.name}
            </span>
          ))}
        </div>
      </div>

      {isExpanded && (
        <div
          className="border-t border-gray-200 p-3 bg-gray-50 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-2">
            {recipe.url && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-0.5">レシピURL</h4>
                <a
                  href={recipe.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {recipe.url}
                </a>
              </div>
            )}

            {recipe.imageUrls && recipe.imageUrls.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-1.5">
                  画像 ({recipe.imageUrls.length}枚)
                </h4>
                <div className="relative">
                  <div
                    className="relative h-48 w-full rounded-lg overflow-hidden cursor-pointer"
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

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                登録日: {recipe.createdAt.toLocaleDateString('ja-JP')}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                title="編集"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              </button>
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

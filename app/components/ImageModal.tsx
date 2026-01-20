'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ImageModalProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageModal({ images, initialIndex, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
      >
        ×
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 text-white text-4xl hover:text-gray-300 z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ‹
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 text-white text-4xl hover:text-gray-300 z-10 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ›
          </button>
        </>
      )}

      <div
        className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <Image
            src={images[currentIndex]}
            alt={`画像 ${currentIndex + 1}`}
            fill
            className="object-contain"
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

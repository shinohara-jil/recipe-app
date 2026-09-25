'use client';

import { useState } from 'react';
import type { PantryItem } from '@/app/types/recipe';

interface PantryModalProps {
  onClose: () => void;
  items: PantryItem[];
  onAdd: (name: string) => Promise<boolean>;
  onDelete: (item: PantryItem) => void;
}

// 開いている間だけ表示する（閉じると入力中の文字も消える）
export default function PantryModal({ onClose, items, onAdd, onDelete }: PantryModalProps) {
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsAdding(true);
    const ok = await onAdd(newName.trim());
    setIsAdding(false);
    if (ok) setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">家にある物</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none" aria-label="閉じる">
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700">
            ここにある材料は、材料リストの「コピー」に最初から入りません。レシピの材料の横にある「家にある」ボタンからも追加できます。
          </p>

          <form onSubmit={handleAdd} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <label htmlFor="pantry-new" className="block text-sm font-medium text-gray-700 mb-2">
              追加する材料
            </label>
            <div className="flex items-center gap-2">
              <input
                id="pantry-new"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例：ごはん、にんにく"
                className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                disabled={isAdding}
              />
              <button
                type="submit"
                disabled={isAdding || !newName.trim()}
                className="px-4 py-2 bg-orange-700 text-white rounded-lg text-sm font-bold hover:bg-orange-800 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isAdding ? '...' : '追加'}
              </button>
            </div>
          </form>

          <div>
            <p className="text-xs text-gray-500 mb-2">{items.length}品</p>
            <ul className="grid grid-cols-2 gap-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-1 rounded-lg bg-gray-50 pl-3 pr-1 py-1 text-sm text-gray-800">
                  <span className="truncate">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200"
                    aria-label={`${item.name}を外す`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

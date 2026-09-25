'use client';

import { useState } from 'react';
import type { Ingredient, Recipe } from '@/app/types/recipe';
import { copyLines, isChecked, isInPantry, nameOf } from '@/app/lib/ingredients';

interface IngredientPanelProps {
  recipe: Recipe;
  pantryNames: Set<string>;
  checkOverrides: Record<number, boolean>;
  onToggleCheck: (index: number, checked: boolean) => void;
  onAddPantry: (name: string) => void;
  onSaveIngredients: (ingredients: Ingredient[]) => Promise<boolean>;
  onExtract: () => void;
  onCopy: () => void;
}

export default function IngredientPanel({
  recipe,
  pantryNames,
  checkOverrides,
  onToggleCheck,
  onAddPantry,
  onSaveIngredients,
  onExtract,
  onCopy,
}: IngredientPanelProps) {
  const [editing, setEditing] = useState<Ingredient[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const status = recipe.extractionStatus;
  const ingredients = recipe.ingredients;

  const startEdit = () => setEditing(ingredients.length ? ingredients.map((i) => ({ ...i })) : [{ text: '', isGuess: false }]);

  const saveEdit = async () => {
    if (!editing) return;
    setIsSaving(true);
    // 書き換えた行は、そろえた名前を消して行の先頭から判断させる
    const cleaned = editing
      .filter((i) => i.text.trim())
      .map((i) => {
        const original = ingredients.find((o) => o.text === i.text);
        return { text: i.text.trim(), standardName: original?.standardName ?? null, isGuess: false };
      });
    const ok = await onSaveIngredients(cleaned);
    setIsSaving(false);
    if (ok) setEditing(null);
  };

  // 読み取り中
  if (status === 'processing') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700" aria-live="polite">
        <span className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <div>
          <p className="font-medium">材料を読み取っています…</p>
          <p className="text-xs text-gray-500">10秒ほどかかります。閉じても読み取りは続きます。</p>
        </div>
      </div>
    );
  }

  // 編集中
  if (editing) {
    return (
      <div className="space-y-2">
        {editing.map((ing, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              value={ing.text}
              onChange={(e) => setEditing(editing.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)))}
              placeholder="例：豚肉 150g"
              aria-label="材料と分量"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:border-transparent focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={() => setEditing(editing.filter((_, k) => k !== i))}
              className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label={`${ing.text || '空の行'}を削除`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setEditing([...editing, { text: '', isGuess: false }])}
          className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          ＋ 材料を追加
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 font-medium text-gray-700 hover:bg-gray-50">
            やめる
          </button>
          <button
            type="button"
            onClick={saveEdit}
            disabled={isSaving}
            className="flex-1 rounded-lg bg-orange-700 py-2.5 font-semibold text-white hover:bg-orange-800 disabled:bg-gray-300"
          >
            {isSaving ? '保存中…' : '保存する'}
          </button>
        </div>
      </div>
    );
  }

  // 未読み取り・失敗（材料がまだ無い）
  if (!ingredients.length) {
    const failed = status === 'failed';
    return (
      <div className={`space-y-3 rounded-lg p-3 text-sm ${failed ? 'bg-red-50' : 'border border-gray-200 bg-white'}`}>
        <p className={failed ? 'font-semibold text-red-700' : 'text-gray-700'}>
          {failed ? '材料を読み取れませんでした' : 'まだ材料を読み取っていません'}
        </p>
        {failed && (
          <p className="text-gray-700">リンク先に材料が見つからないか、読み取れませんでした。材料が写ったスクショを追加するか、手で入力してください。</p>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onExtract} className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 font-medium text-gray-700 hover:bg-gray-50">
            {failed ? 'もう一度読み取る' : '材料を読み取る'}
          </button>
          <button type="button" onClick={startEdit} className="flex-1 rounded-lg bg-orange-700 py-2.5 font-semibold text-white hover:bg-orange-800">
            手で入力する
          </button>
        </div>
      </div>
    );
  }

  const indexed = ingredients.map((ing, i) => ({ ing, i }));
  const toBuy = indexed.filter(({ ing }) => !isInPantry(ing, pantryNames));
  const atHome = indexed.filter(({ ing }) => isInPantry(ing, pantryNames));
  const lines = copyLines(ingredients, pantryNames, checkOverrides);

  const row = ({ ing, i }: { ing: Ingredient; i: number }) => {
    const checked = isChecked(i, ing, pantryNames, checkOverrides);
    const home = isInPantry(ing, pantryNames);
    const id = `ing-${recipe.id}-${i}`;
    return (
      <li key={i} className="flex items-center gap-2.5 border-t border-gray-200 px-3 py-2 first:border-t-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggleCheck(i, e.target.checked)}
          className="h-5 w-5 flex-none accent-orange-700"
        />
        <label htmlFor={id} className={`flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 text-[15px] ${checked ? 'text-gray-800' : 'text-gray-500'}`}>
          <span>{ing.text}</span>
          {ing.isGuess && <span className="rounded bg-amber-100 px-1.5 text-[10px] font-bold text-amber-800">推測</span>}
        </label>
        {home ? (
          <span className="flex-none rounded bg-gray-100 px-1.5 text-[10px] font-bold text-gray-600">家にある</span>
        ) : (
          <button
            type="button"
            onClick={() => onAddPantry(ing.standardName || nameOf(ing.text))}
            className="flex-none rounded-full border border-gray-300 bg-white px-2 py-0.5 text-[11px] text-gray-700 hover:bg-gray-50"
          >
            ⌂ 家にある
          </button>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-bold text-gray-800">
          材料{recipe.servings && <span className="ml-1 text-xs font-normal text-gray-500">{recipe.servings}</span>}
        </h4>
        <div className="flex gap-3">
          <button type="button" onClick={startEdit} className="text-xs font-semibold text-orange-700 hover:underline">
            編集
          </button>
          <button type="button" onClick={onExtract} className="text-xs font-semibold text-orange-700 hover:underline">
            もう一度読み取る
          </button>
        </div>
      </div>
      {recipe.extractionSource && <p className="text-xs text-gray-500">{recipe.extractionSource}から読み取り</p>}
      {status === 'guess' && (
        <p className="rounded-lg border border-dashed border-amber-500 bg-amber-100 px-3 py-2 text-xs text-amber-800">
          材料が書かれていなかったため、AIが料理名や写真から<b>推測</b>しました。実際のレシピを見て直してください。
        </p>
      )}
      {toBuy.length > 0 && <ul className="rounded-lg border border-gray-200 bg-white">{toBuy.map(row)}</ul>}
      {atHome.length > 0 && (
        <>
          <p className="flex items-center gap-2 text-xs font-semibold text-gray-500 after:h-px after:flex-1 after:bg-gray-200">家にある物（最初はコピーしない）</p>
          <ul className="rounded-lg border border-gray-200 bg-white">{atHome.map(row)}</ul>
        </>
      )}
      <button
        type="button"
        onClick={onCopy}
        disabled={!lines.length}
        className="w-full rounded-lg bg-orange-700 py-3 font-bold text-white hover:bg-orange-800 disabled:bg-gray-300 disabled:text-gray-500"
      >
        チェックした{lines.length}品をコピー
      </button>
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer py-0.5">コピーされる内容を見る</summary>
        <pre className="mt-1.5 whitespace-pre-wrap rounded-lg border border-gray-200 bg-white px-3 py-2 font-sans text-sm text-gray-700">
          {lines.join('\n') || '（なし）'}
        </pre>
      </details>
    </div>
  );
}

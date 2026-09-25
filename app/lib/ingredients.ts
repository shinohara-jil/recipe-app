import type { Ingredient } from '@/app/types/recipe';

// 1行の材料から材料名を取り出す（手で書いた行用）
// 例: 「豚肉 150g」「しょうゆ大さじ1」→ 豚肉 / しょうゆ。「塩麹大さじ1」は「塩麹」なので「塩」とは一致しない
export function nameOf(text: string) {
  const first = text.trim().split(/[\s　]+/)[0];
  return first.replace(/(大さじ|小さじ|少々|適量|適宜|ひとつまみ|お好みで|好みで|[0-9０-９½¼¾]).*$/, '') || text.trim();
}

export function isInPantry(ingredient: Ingredient, pantryNames: Set<string>) {
  return pantryNames.has(ingredient.standardName || nameOf(ingredient.text));
}

// チェックの初期値は「家にある物でなければコピーする」。利用者が変えたものは overrides で上書き
export function isChecked(index: number, ingredient: Ingredient, pantryNames: Set<string>, overrides: Record<number, boolean>) {
  return overrides[index] ?? !isInPantry(ingredient, pantryNames);
}

export function copyLines(ingredients: Ingredient[], pantryNames: Set<string>, overrides: Record<number, boolean>) {
  return ingredients.filter((ing, i) => isChecked(i, ing, pantryNames, overrides)).map((ing) => ing.text);
}

// クリップボードにコピー。使えない環境では昔ながらの方法を試す
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

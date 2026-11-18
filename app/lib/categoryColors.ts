// カテゴリ名に含まれる言葉で色を決める（番号に関係なく効く。後から足したカテゴリ用）
const colorsByName: [RegExp, string][] = [
  [/魚|鮭|さけ|サーモン|さば|鯖|ぶり|鰤|たら|鱈|海鮮|シーフード/, 'bg-sky-100 text-sky-800'],
];

export const getCategoryColor = (categoryId: number, categoryName?: string): string => {
  if (categoryName) {
    const hit = colorsByName.find(([pattern]) => pattern.test(categoryName));
    if (hit) return hit[1];
  }

  const colors: { [key: number]: string } = {
    1: 'bg-pink-100 text-pink-800',      // pickup！
    2: 'bg-red-100 text-red-800',        // 牛肉
    3: 'bg-rose-100 text-rose-800',      // 豚肉
    4: 'bg-amber-100 text-amber-800',    // 鶏肉
    5: 'bg-gray-100 text-gray-800',      // その他
    6: 'bg-purple-100 text-purple-800',  // ホットクック
  };

  return colors[categoryId] || 'bg-orange-100 text-orange-800';
};

// 絞り込み・登録画面のカテゴリボタン。色だけに頼らず、選んだら枠線と ✓ で分かるようにする
export const categoryButtonClass = (categoryId: number, categoryName: string, isSelected: boolean): string =>
  isSelected
    ? `${getCategoryColor(categoryId, categoryName)} ring-2 ring-inset ring-current font-bold`
    : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50';

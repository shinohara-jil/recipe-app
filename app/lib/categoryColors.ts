export const getCategoryColor = (categoryId: number): string => {
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

export interface Category {
  id: number;
  name: string;
}

// 材料（1行。例: 豚肉 150g）
export interface Ingredient {
  text: string;
  standardName?: string | null; // AIがそろえた名前（家にある物との照らし合わせ用）
  isGuess: boolean;
}

// none: 未読み取り / processing: 読み取り中 / done: 完了 / guess: 推測のみ / failed: 失敗
export type ExtractionStatus = 'none' | 'processing' | 'done' | 'guess' | 'failed';

export interface PantryItem {
  id: number;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  url?: string;
  provider?: string;
  imageUrls?: string[];
  categories: Category[];
  createdAt: Date;
  isTodayMenu: boolean;
  todayMenuSetAt?: Date;
  ingredients: Ingredient[];
  servings?: string | null;
  extractionStatus: ExtractionStatus;
  extractionSource?: string | null;
}

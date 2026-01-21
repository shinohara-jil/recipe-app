export interface Category {
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
}

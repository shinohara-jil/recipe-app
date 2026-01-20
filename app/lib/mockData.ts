import { Category, Recipe } from '@/app/types/recipe';

export const categories: Category[] = [
  { id: 1, name: 'pickup！' },
  { id: 2, name: '牛肉' },
  { id: 3, name: '豚肉' },
  { id: 4, name: '鶏肉' },
  { id: 5, name: 'その他' },
  { id: 6, name: 'ホットクック' },
];

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: '定番のハンバーグ',
    url: 'https://example.com/recipe/1',
    imageUrls: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop',
    ],
    categories: [
      { id: 1, name: 'pickup！' },
      { id: 2, name: '牛肉' },
    ],
    createdAt: new Date('2026-01-15'),
  },
  {
    id: '2',
    title: '豚の生姜焼き',
    url: 'https://example.com/recipe/2',
    imageUrls: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'],
    categories: [
      { id: 3, name: '豚肉' },
    ],
    createdAt: new Date('2026-01-14'),
  },
  {
    id: '3',
    title: 'ホットクックで簡単カレー',
    url: 'https://example.com/recipe/3',
    categories: [
      { id: 1, name: 'pickup！' },
      { id: 6, name: 'ホットクック' },
    ],
    createdAt: new Date('2026-01-13'),
  },
  {
    id: '4',
    title: '鶏の唐揚げ',
    url: 'https://example.com/recipe/4',
    imageUrls: ['https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop'],
    categories: [
      { id: 4, name: '鶏肉' },
    ],
    createdAt: new Date('2026-01-12'),
  },
  {
    id: '5',
    title: 'ホットクックで肉じゃが',
    url: 'https://example.com/recipe/5',
    imageUrls: [
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop',
    ],
    categories: [
      { id: 2, name: '牛肉' },
      { id: 6, name: 'ホットクック' },
    ],
    createdAt: new Date('2026-01-11'),
  },
  {
    id: '6',
    title: 'アクアパッツァ',
    url: 'https://example.com/recipe/6',
    imageUrls: ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop'],
    categories: [
      { id: 5, name: 'その他' },
    ],
    createdAt: new Date('2026-01-10'),
  },
];

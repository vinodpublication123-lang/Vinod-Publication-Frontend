import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  category: string;
  tagline?: string;
  price: number;
  currency: string;
  imageUrl: string;
  originalPrice?: number;
  offerText?: string;
  description?: string;
  variantGroups?: unknown[];
}

interface ProductStore {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [],
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      removeProduct: (id) => set((state) => ({ products: state.products.filter(p => p.id !== id) })),
    }),
    {
      name: 'product-storage',
    }
  )
);

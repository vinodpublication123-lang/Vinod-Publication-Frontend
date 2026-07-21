import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique ID combining product name and size
  productId?: string; // Actual backend ID
  name: string;
  category: string;
  price: number;
  currency: string;
  imageUrl: string;
  quantity: number;
  size?: string;
  variantId?: string; // Add variantId for APPAREL
  availableStock?: number;   // real-time stock from backend
  lowStockThreshold?: number; // threshold below which to show low-stock warning
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const id = `${newItem.name}-${newItem.variantId || 'default'}-${newItem.size || 'default'}`;
          const existingItem = state.items.find((item) => item.id === id);

          if (existingItem) {
            const newQuantity = existingItem.quantity + newItem.quantity;
            const cappedQuantity = newItem.availableStock !== undefined 
              ? Math.min(newQuantity, newItem.availableStock) 
              : newQuantity;

            return {
              items: state.items.map((item) =>
                item.id === id
                  ? { ...item, quantity: cappedQuantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { ...newItem, id }],
          };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              const maxAllowed = item.availableStock !== undefined ? item.availableStock : Infinity;
              return { ...item, quantity: Math.min(Math.max(1, quantity), maxAllowed) };
            }
            return item;
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'vinverse-cart-storage',
    }
  )
);

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  name: string;
  priceCents: number;
  imageUrl: string;
  quantity: number;
  stock?: number;
  colorId?: string;
  colorName?: string;
};

export function lineKey(productId: string, colorId?: string): string {
  return `${productId}:${colorId ?? ""}`;
}

type CartContextValue = {
  items: CartItem[];
  totalCents: number;
  totalQuantity: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (lineKey: string, quantity: number) => void;
  removeItem: (lineKey: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "shopfront.cart";

function clampToStock(quantity: number, stock: number | undefined): number {
  return stock === undefined ? quantity : Math.min(quantity, Math.max(0, stock));
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      setItems([]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((current) => {
        const key = lineKey(item.productId, item.colorId);
        const existing = current.find((i) => lineKey(i.productId, i.colorId) === key);
        if (existing) {
          return current.map((i) =>
            lineKey(i.productId, i.colorId) === key
              ? {
                  ...i,
                  ...item,
                  quantity: clampToStock(i.quantity + quantity, item.stock),
                }
              : i,
          );
        }
        const clamped = clampToStock(quantity, item.stock);
        return clamped > 0 ? [...current, { ...item, quantity: clamped }] : current;
      });
    },
    [],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((i) => lineKey(i.productId, i.colorId) !== key)
        : current.map((i) =>
            lineKey(i.productId, i.colorId) === key
              ? { ...i, quantity: Math.max(1, clampToStock(quantity, i.stock)) }
              : i,
        ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((i) => lineKey(i.productId, i.colorId) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalCents: items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
      totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [items, addItem, setQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}

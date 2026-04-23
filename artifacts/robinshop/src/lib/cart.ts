import { useEffect, useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  storeSlug: string;
  name: string;
  price: number;
  imageUrl: string;
  qty: number;
}

const KEY_PREFIX = "robinshop_cart_";

function readCart(slug: string): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + slug);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(slug: string, items: CartItem[]) {
  localStorage.setItem(KEY_PREFIX + slug, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(`cart-changed:${slug}`));
}

export function useCart(storeSlug: string) {
  const [items, setItems] = useState<CartItem[]>(() =>
    typeof window !== "undefined" ? readCart(storeSlug) : [],
  );

  useEffect(() => {
    if (!storeSlug) return;
    const refresh = () => setItems(readCart(storeSlug));
    refresh();
    const handler = () => refresh();
    window.addEventListener(`cart-changed:${storeSlug}`, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(`cart-changed:${storeSlug}`, handler);
      window.removeEventListener("storage", handler);
    };
  }, [storeSlug]);

  const add = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1) => {
      const current = readCart(storeSlug);
      const existing = current.find((c) => c.productId === item.productId);
      let next: CartItem[];
      if (existing) {
        next = current.map((c) =>
          c.productId === item.productId ? { ...c, qty: c.qty + qty } : c,
        );
      } else {
        next = [...current, { ...item, qty }];
      }
      writeCart(storeSlug, next);
    },
    [storeSlug],
  );

  const remove = useCallback(
    (productId: string) => {
      const next = readCart(storeSlug).filter((c) => c.productId !== productId);
      writeCart(storeSlug, next);
    },
    [storeSlug],
  );

  const updateQty = useCallback(
    (productId: string, qty: number) => {
      if (qty < 1) return remove(productId);
      const next = readCart(storeSlug).map((c) =>
        c.productId === productId ? { ...c, qty } : c,
      );
      writeCart(storeSlug, next);
    },
    [storeSlug, remove],
  );

  const clear = useCallback(() => {
    writeCart(storeSlug, []);
  }, [storeSlug]);

  const totalItems = items.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = items.reduce((acc, i) => acc + i.qty * i.price, 0);

  return { items, add, remove, updateQty, clear, totalItems, subtotal };
}

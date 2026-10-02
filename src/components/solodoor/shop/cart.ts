/**
 * The shopping cart, kept in the browser until checkout is connected.
 * A tiny external store: any component can read it with `useCart()`.
 */
import { useSyncExternalStore } from "react";

export interface CartLine {
  /** Same id = same line; adding it again raises the quantity. */
  id: string;
  title: string;
  note?: string;
  image: string | null;
  price: number;
  qty: number;
  /** Lines such as the installation service exist once per order. */
  single?: boolean;
}

interface CartState {
  lines: CartLine[];
  open: boolean;
}

const STORAGE_KEY = "solodoor-cart";
const EMPTY: CartState = { lines: [], open: false };

let state: CartState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function set(next: CartState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.lines));
  } catch {
    // Storage can be unavailable (private mode); the cart then lives for this visit only.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // The saved cart is read after hydration, so the server and first client render match.
  if (!hydrated) {
    hydrated = true;
    queueMicrotask(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as CartLine[];
        if (Array.isArray(saved) && saved.length) {
          state = { ...state, lines: saved };
          listeners.forEach((l) => l());
        }
      } catch {
        // Ignore a corrupted saved cart.
      }
    });
  }
  return () => listeners.delete(listener);
}

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );
}

export const cartTotal = (lines: CartLine[]) => lines.reduce((sum, line) => sum + line.price * line.qty, 0);
export const cartCount = (lines: CartLine[]) => lines.reduce((sum, line) => sum + line.qty, 0);

export const cart = {
  add(added: CartLine[], options: { open?: boolean } = {}) {
    const lines = [...state.lines];
    for (const line of added) {
      const i = lines.findIndex((l) => l.id === line.id);
      if (i === -1) lines.push(line);
      else if (!line.single) lines[i] = { ...lines[i], qty: lines[i].qty + line.qty };
    }
    set({ lines, open: options.open ?? state.open });
  },
  setQty(id: string, qty: number) {
    set({ ...state, lines: state.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l)) });
  },
  remove(id: string) {
    set({ ...state, lines: state.lines.filter((l) => l.id !== id) });
  },
  setOpen(open: boolean) {
    set({ ...state, open });
  },
};

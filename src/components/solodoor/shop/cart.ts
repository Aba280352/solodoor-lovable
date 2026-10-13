/**
 * The shopping cart, kept in the browser until the customer goes to the Shopify checkout (see checkout.ts).
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
  /** The smallest quantity of the line (wallpaper by the metre starts at two metres); one when absent. */
  min?: number;
  /** Lines such as a sample exist once per order. */
  single?: boolean;
  /** The Shopify SKU of the line, when it does not follow from the id (see checkout.ts). */
  sku?: string;
  /** The id of the line this one belongs to (the installation of a door covering). It leaves the cart with that line. */
  parent?: string;
  /** An installation line: the quantity is the number of doors covered on both sides, or on one side only. */
  install?: "double" | "single";
  /** The installation line: the city the installer comes to, checked against the installation areas. */
  city?: string;
  /** The city was picked from the localities and is inside an installation area. */
  cityOk?: boolean;
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

/** The first sample of an order is free, shipping included; every further sample costs this much. */
export const SAMPLE_EXTRA_PRICE = 5;

/** Samples are priced by their place in the cart, so removing the free one makes the next one free. */
function withSamplePrices(lines: CartLine[]): CartLine[] {
  let samples = 0;
  return lines.map((line) => {
    if (!line.id.startsWith("sample:")) return line;
    const first = samples++ === 0;
    return { ...line, price: first ? 0 : SAMPLE_EXTRA_PRICE, note: first ? "חינם" : undefined };
  });
}

function set(next: CartState) {
  state = { ...next, lines: withSamplePrices(next.lines) };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
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
          state = { ...state, lines: withSamplePrices(saved) };
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

/** The installation lines of a cart. "installation" is the single line of carts saved before installation was counted per door. */
export const isInstallLine = (line: CartLine) => !!line.install || line.id === "installation";

/** A line whose quantity is fixed in the cart: an installation, and the door covering it was counted from. */
export const isLockedLine = (line: CartLine, lines: CartLine[]) => !!line.install || lines.some((l) => l.parent === line.id);

export const cart = {
  add(added: CartLine[], options: { open?: boolean } = {}) {
    let lines = [...state.lines];
    for (const line of added) {
      const i = lines.findIndex((l) => l.id === line.id);
      if (i === -1) lines.push(line);
      else if (!line.single) lines[i] = { ...lines[i], qty: lines[i].qty + line.qty };
      // A line that exists once may still name another city.
      else if (line.city) lines[i] = { ...lines[i], city: line.city, cityOk: line.cityOk, note: line.note };
    }
    // The installer comes once, to one place: the city given last counts for every installation in the cart.
    const placed = added.find((line) => line.install && line.city);
    if (placed) lines = lines.map((l) => (l.install ? { ...l, city: placed.city, cityOk: placed.cityOk } : l));
    set({ lines, open: options.open ?? state.open });
  },
  setQty(id: string, qty: number) {
    // Metres come in tenths, so the sum is rounded: 2.3 + 1 stays 3.3.
    set({ ...state, lines: state.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(l.min ?? 1, Math.round(qty * 10) / 10) } : l)) });
  },
  remove(id: string) {
    // A door covering takes its installation along.
    set({ ...state, lines: state.lines.filter((l) => l.id !== id && l.parent !== id) });
  },
  setOpen(open: boolean) {
    set({ ...state, open });
  },
};

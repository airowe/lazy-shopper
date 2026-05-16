import AsyncStorage from '@react-native-async-storage/async-storage';

import { getProduct } from '@/lib/catalog';

const KEY = 'lazy-shopper.wishlist.v1';
export const MAX_WISHLIST = 50;

export type WishlistEntry = {
  productId: string;
  savedAt: string;
  priceWhenSaved: number;
};

async function readRaw(): Promise<WishlistEntry[]> {
  const json = await AsyncStorage.getItem(KEY);
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as WishlistEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeRaw(entries: WishlistEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
}

// Returns the wishlist, most-recently-saved first, with entries whose product
// no longer exists in the catalog pruned out (PRD-03).
export async function getWishlist(): Promise<WishlistEntry[]> {
  const entries = await readRaw();
  const live = entries.filter((e) => getProduct(e.productId));
  if (live.length !== entries.length) await writeRaw(live);
  return live;
}

export async function isSaved(productId: string): Promise<boolean> {
  const entries = await readRaw();
  return entries.some((e) => e.productId === productId);
}

export type AddResult = 'added' | 'already-saved' | 'full';

export async function addToWishlist(
  productId: string,
  priceWhenSaved: number
): Promise<AddResult> {
  const entries = await readRaw();
  if (entries.some((e) => e.productId === productId)) return 'already-saved';
  if (entries.length >= MAX_WISHLIST) return 'full';
  const entry: WishlistEntry = {
    productId,
    savedAt: new Date().toISOString(),
    priceWhenSaved,
  };
  await writeRaw([entry, ...entries]);
  return 'added';
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const entries = await readRaw();
  await writeRaw(entries.filter((e) => e.productId !== productId));
}

import { getOffersFor, OFFERS } from './offers';
import { getProduct, PRODUCTS } from './products';
import { getStore, STORES } from './stores';
import type { Offer, Product } from './types';

export type { Offer, Product, ProductCategory, Store, StoreId } from './types';
export { PRODUCTS, OFFERS, STORES, getProduct, getOffersFor, getStore };

const offerCount = (productId: string): number =>
  OFFERS.reduce((n, o) => (o.productId === productId ? n + 1 : n), 0);

// Case-insensitive substring match against name, brand, and LEGO set number.
// Results: exact name matches first, then by offer count desc (more retailers
// = a more useful product to rank). Empty query returns []. No fuzzy matching
// in v1 — see PRD-01 "future: on-device fuzzy search".
export function search(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matches = PRODUCTS.filter((p) => {
    if (p.discontinued && offerCount(p.id) === 0) return false;
    const haystack = [
      p.name,
      p.brand ?? '',
      p.identifiers.legoSetNumber ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  return matches.sort((a, b) => {
    const aExact = a.name.toLowerCase() === q ? 1 : 0;
    const bExact = b.name.toLowerCase() === q ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    return offerCount(b.id) - offerCount(a.id);
  });
}

export type ProductWithOffers = {
  product: Product;
  offers: Offer[];
};

export function getProductWithOffers(
  id: string
): ProductWithOffers | undefined {
  const product = getProduct(id);
  if (!product) return undefined;
  return { product, offers: getOffersFor(id) };
}

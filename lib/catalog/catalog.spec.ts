import { getProductWithOffers, OFFERS, PRODUCTS, search, STORES } from './index';
import type { StoreId } from './types';

describe('catalog integrity', () => {
  const productIds = new Set(PRODUCTS.map((p) => p.id));
  const storeIds = new Set<string>(STORES.map((s) => s.id));

  it('has unique product ids', () => {
    expect(productIds.size).toBe(PRODUCTS.length);
  });

  it('every offer points at a real product', () => {
    const orphans = OFFERS.filter((o) => !productIds.has(o.productId));
    expect(orphans).toEqual([]);
  });

  it('every offer points at a real store', () => {
    const orphans = OFFERS.filter((o) => !storeIds.has(o.storeId));
    expect(orphans).toEqual([]);
  });

  it('every product has at least one offer', () => {
    const orphans = PRODUCTS.filter(
      (p) => !OFFERS.some((o) => o.productId === p.id)
    );
    expect(orphans.map((p) => p.id)).toEqual([]);
  });

  it('at least some products support a multi-retailer comparison', () => {
    const comparable = PRODUCTS.filter((p) => {
      const stores = new Set(
        OFFERS.filter((o) => o.productId === p.id).map((o) => o.storeId)
      );
      return stores.size >= 2;
    });
    expect(comparable.length).toBeGreaterThan(0);
  });

  it.each(OFFERS)('offer prices are positive ($productId @ $storeId)', (o) => {
    expect(o.price).toBeGreaterThan(0);
  });
});

describe('search', () => {
  it('returns [] for an empty query', () => {
    expect(search('')).toEqual([]);
    expect(search('   ')).toEqual([]);
  });

  it('matches product name case-insensitively', () => {
    const ids = search('creeper').map((p) => p.id);
    expect(ids).toContain('minecraft-creeper-plush-8in');
  });

  it('matches a LEGO set number', () => {
    const ids = search('21261').map((p) => p.id);
    expect(ids).toEqual(['lego-21261-wolf-stronghold']);
  });

  it('matches brand', () => {
    const ids = search('beyblade').map((p) => p.id);
    expect(ids.length).toBeGreaterThanOrEqual(3);
  });

  it('sorts an exact name match first', () => {
    const product = PRODUCTS[0];
    const results = search(product.name);
    expect(results[0].id).toBe(product.id);
  });
});

describe('getProductWithOffers', () => {
  it('returns the product and its offers', () => {
    const result = getProductWithOffers('lego-21261-wolf-stronghold');
    expect(result?.product.name).toContain('Wolf Stronghold');
    expect(result?.offers.length).toBe(2);
  });

  it('returns undefined for an unknown id', () => {
    expect(getProductWithOffers('nope')).toBeUndefined();
  });
});

describe('store reference data', () => {
  it.each(STORES)('store $id has a rating in 1..5', (s) => {
    expect(s.rating).toBeGreaterThanOrEqual(1);
    expect(s.rating).toBeLessThanOrEqual(5);
  });

  it('store ids are the expected set', () => {
    const ids = STORES.map((s) => s.id).sort();
    const expected: StoreId[] = [
      'amazon',
      'bestbuy',
      'gamestop',
      'lego',
      'target',
      'walmart',
    ];
    expect(ids).toEqual(expected);
  });
});

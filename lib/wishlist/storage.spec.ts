import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  addToWishlist,
  getWishlist,
  isSaved,
  MAX_WISHLIST,
  removeFromWishlist,
} from './storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const REAL = 'minecraft-creeper-plush-8in';
const REAL2 = 'lego-21261-wolf-stronghold';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('wishlist storage', () => {
  it('starts empty', async () => {
    expect(await getWishlist()).toEqual([]);
  });

  it('adds a product', async () => {
    expect(await addToWishlist(REAL, 19.99)).toBe('added');
    const list = await getWishlist();
    expect(list).toHaveLength(1);
    expect(list[0].productId).toBe(REAL);
    expect(list[0].priceWhenSaved).toBe(19.99);
  });

  it('reports a saved product', async () => {
    await addToWishlist(REAL, 19.99);
    expect(await isSaved(REAL)).toBe(true);
    expect(await isSaved(REAL2)).toBe(false);
  });

  it('does not add a duplicate', async () => {
    await addToWishlist(REAL, 19.99);
    expect(await addToWishlist(REAL, 17.99)).toBe('already-saved');
    expect(await getWishlist()).toHaveLength(1);
  });

  it('removes a product', async () => {
    await addToWishlist(REAL, 19.99);
    await removeFromWishlist(REAL);
    expect(await getWishlist()).toEqual([]);
  });

  it('orders most-recently-saved first', async () => {
    await addToWishlist(REAL, 19.99);
    await addToWishlist(REAL2, 56.99);
    const list = await getWishlist();
    expect(list[0].productId).toBe(REAL2);
  });

  it('rejects adds past the max', async () => {
    const fake = Array.from({ length: MAX_WISHLIST }, (_, i) => ({
      productId: REAL,
      savedAt: new Date().toISOString(),
      priceWhenSaved: i,
    }));
    await AsyncStorage.setItem(
      'lazy-shopper.wishlist.v1',
      JSON.stringify(fake)
    );
    expect(await addToWishlist(REAL2, 10)).toBe('full');
  });

  it('prunes entries for products no longer in the catalog', async () => {
    await AsyncStorage.setItem(
      'lazy-shopper.wishlist.v1',
      JSON.stringify([
        { productId: 'ghost-product', savedAt: 'x', priceWhenSaved: 1 },
        { productId: REAL, savedAt: 'x', priceWhenSaved: 2 },
      ])
    );
    const list = await getWishlist();
    expect(list.map((e) => e.productId)).toEqual([REAL]);
  });
});

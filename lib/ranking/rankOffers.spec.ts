import { PRODUCTS, STORES, getOffersFor, getProduct } from '../catalog';
import type { Offer } from '../catalog';
import { rankOffers } from './rankOffers';

const NOW = new Date('2026-05-16T00:00:00Z');

const baseOffer = (over: Partial<Offer>): Offer => ({
  productId: 'p',
  storeId: 'amazon',
  price: 20,
  currency: 'USD',
  url: 'https://example.com',
  inStock: true,
  shippingDays: { min: 2, max: 4 },
  freeShippingThreshold: 35,
  capturedAt: '2026-05-15',
  source: 'manual',
  ...over,
});

describe('rankOffers — ordering', () => {
  it('returns [] for no offers', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    expect(rankOffers(p, [], STORES, NOW)).toEqual([]);
  });

  it('puts in-stock offers before out-of-stock', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = [
      baseOffer({ storeId: 'amazon', price: 10, inStock: false }),
      baseOffer({ storeId: 'target', price: 99, inStock: true }),
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    expect(ranked[0].offer.storeId).toBe('target');
    expect(ranked[1].offer.storeId).toBe('amazon');
  });

  it('sorts in-stock offers by price ascending', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = [
      baseOffer({ storeId: 'target', price: 59.99 }),
      baseOffer({ storeId: 'amazon', price: 56.99 }),
      baseOffer({ storeId: 'lego', price: 59.99 }),
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    expect(ranked.map((r) => r.offer.price)).toEqual([56.99, 59.99, 59.99]);
  });

  it('breaks a price tie by higher store rating', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    // target rating 4.6, lego rating 4.8 — lego should win the tie
    const offers = [
      baseOffer({ storeId: 'target', price: 59.99 }),
      baseOffer({ storeId: 'lego', price: 59.99 }),
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    expect(ranked[0].offer.storeId).toBe('lego');
  });

  it('is deterministic for identical inputs', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = getOffersFor(p.id);
    const a = rankOffers(p, offers, STORES, NOW);
    const b = rankOffers(p, offers, STORES, NOW);
    expect(a).toEqual(b);
  });
});

describe('rankOffers — badges', () => {
  it('awards best-value to the cheapest in-stock offer', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = [
      baseOffer({ storeId: 'amazon', price: 14.99 }),
      baseOffer({ storeId: 'target', price: 24.95 }),
      baseOffer({ storeId: 'walmart', price: 24.95 }),
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    const bv = ranked.find((r) => r.badges.includes('best-value'));
    expect(bv?.offer.storeId).toBe('amazon');
  });

  it('never awards best-value to an out-of-stock offer', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = [
      baseOffer({ storeId: 'amazon', price: 5, inStock: false }),
      baseOffer({ storeId: 'target', price: 50, inStock: true }),
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    const bv = ranked.find((r) => r.badges.includes('best-value'));
    expect(bv?.offer.storeId).toBe('target');
  });

  it('awards fastest to the lowest shippingDays.min', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = [
      baseOffer({ storeId: 'amazon', shippingDays: { min: 1, max: 2 } }),
      baseOffer({ storeId: 'target', shippingDays: { min: 2, max: 4 } }),
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    const fast = ranked.find((r) => r.badges.includes('fastest'));
    expect(fast?.offer.storeId).toBe('amazon');
  });

  it('suppresses fastest when all in-stock offers tie on shipping', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = [
      baseOffer({ storeId: 'amazon', shippingDays: { min: 2, max: 4 } }),
      baseOffer({ storeId: 'target', shippingDays: { min: 2, max: 5 } }),
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    expect(ranked.some((r) => r.badges.includes('fastest'))).toBe(false);
  });

  it('never awards closest in v1', () => {
    const p = getProduct('minecraft-creeper-plush-8in')!;
    const ranked = rankOffers(p, getOffersFor(p.id), STORES, NOW);
    expect(ranked.some((r) => r.badges.includes('closest'))).toBe(false);
  });

  it('awards no best-value/fastest when every offer is out of stock', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = [
      baseOffer({ storeId: 'amazon', inStock: false }),
      baseOffer({ storeId: 'target', inStock: false }),
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    expect(ranked.some((r) => r.badges.length > 0)).toBe(false);
  });

  it('prefers a free-shipping offer for best-value when within $1', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    // amazon $34.50 under the $35 threshold; target $35.20 clears it
    const offers = [
      baseOffer({ storeId: 'amazon', price: 34.5, freeShippingThreshold: 35 }),
      baseOffer({ storeId: 'target', price: 35.2, freeShippingThreshold: 35 }),
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    const bv = ranked.find((r) => r.badges.includes('best-value'));
    expect(bv?.offer.storeId).toBe('target');
  });
});

describe('rankOffers — staleness', () => {
  it('flags an offer older than 14 days as stale', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = [
      baseOffer({ storeId: 'amazon', capturedAt: '2026-05-01' }), // 15 days
      baseOffer({ storeId: 'target', capturedAt: '2026-05-15' }), // 1 day
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    expect(ranked.find((r) => r.offer.storeId === 'amazon')?.stale).toBe(true);
    expect(ranked.find((r) => r.offer.storeId === 'target')?.stale).toBe(false);
  });

  it('drops offers older than 30 days from ranking', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = [
      baseOffer({ storeId: 'amazon', capturedAt: '2026-04-10' }), // 36 days
      baseOffer({ storeId: 'target', capturedAt: '2026-05-15' }),
    ];
    const ranked = rankOffers(p, offers, STORES, NOW);
    expect(ranked.map((r) => r.offer.storeId)).toEqual(['target']);
  });

  it('returns [] when every offer is stale-dropped', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const offers = [
      baseOffer({ storeId: 'amazon', capturedAt: '2026-03-01' }),
      baseOffer({ storeId: 'target', capturedAt: '2026-03-01' }),
    ];
    expect(rankOffers(p, offers, STORES, NOW)).toEqual([]);
  });
});

describe('rankOffers — effective price', () => {
  it('sets effectivePrice equal to price in v1', () => {
    const p = getProduct('lego-21261-wolf-stronghold')!;
    const ranked = rankOffers(p, getOffersFor(p.id), STORES, NOW);
    ranked.forEach((r) => expect(r.effectivePrice).toBe(r.offer.price));
  });
});

describe('rankOffers — real catalog smoke test', () => {
  it('ranks every catalog product without throwing', () => {
    PRODUCTS.forEach((p) => {
      const ranked = rankOffers(p, getOffersFor(p.id), STORES, NOW);
      expect(Array.isArray(ranked)).toBe(true);
    });
  });

  it('attaches the matching store to each ranked offer', () => {
    const p = getProduct('minecraft-creeper-plush-8in')!;
    const ranked = rankOffers(p, getOffersFor(p.id), STORES, NOW);
    ranked.forEach((r) => expect(r.store.id).toBe(r.offer.storeId));
  });
});

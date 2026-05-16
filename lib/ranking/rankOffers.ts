import type { Offer, Product, Store } from '../catalog';

export type Badge = 'best-value' | 'fastest' | 'closest' | 'top-rated';

export type RankedOffer = {
  offer: Offer;
  store: Store;
  badges: Badge[];
  stale: boolean;
  effectivePrice: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const STALE_DAYS = 14;
const DROP_DAYS = 30;
const FREE_SHIP_TIEBREAK = 1.0;
const TOP_RATED_MARGIN = 0.3;

const ageInDays = (capturedAt: string, now: Date): number =>
  (now.getTime() - new Date(capturedAt).getTime()) / DAY_MS;

// Effective price used for ranking. v1: equal to sticker price. The field
// exists so phase-2 shipping-fee modeling has a home (PRD-05).
const effectivePriceOf = (offer: Offer): number => offer.price;

const clearsFreeShipping = (offer: Offer): boolean =>
  offer.freeShippingThreshold === undefined ||
  offer.price >= offer.freeShippingThreshold;

// Rank a product's offers per PRD-05. Pure: `now` is explicit for determinism.
export function rankOffers(
  _product: Product,
  offers: Offer[],
  stores: Store[],
  now: Date
): RankedOffer[] {
  const storeById = new Map(stores.map((s) => [s.id, s]));

  // Drop offers older than 30 days before anything else.
  const fresh = offers.filter(
    (o) => ageInDays(o.capturedAt, now) <= DROP_DAYS
  );
  if (fresh.length === 0) return [];

  const ranked: RankedOffer[] = fresh
    .map((offer) => {
      const store = storeById.get(offer.storeId);
      if (!store) throw new Error(`unknown store ${offer.storeId}`);
      return {
        offer,
        store,
        badges: [] as Badge[],
        stale: ageInDays(offer.capturedAt, now) > STALE_DAYS,
        effectivePrice: effectivePriceOf(offer),
      };
    })
    .sort((a, b) => {
      if (a.offer.inStock !== b.offer.inStock) {
        return a.offer.inStock ? -1 : 1;
      }
      if (a.effectivePrice !== b.effectivePrice) {
        return a.effectivePrice - b.effectivePrice;
      }
      if (a.store.rating !== b.store.rating) {
        return b.store.rating - a.store.rating;
      }
      const aShip = a.offer.shippingDays?.min ?? Infinity;
      const bShip = b.offer.shippingDays?.min ?? Infinity;
      if (aShip !== bShip) return aShip - bShip;
      return a.store.name.localeCompare(b.store.name);
    });

  assignBadges(ranked);
  return ranked;
}

function assignBadges(ranked: RankedOffer[]): void {
  const inStock = ranked.filter((r) => r.offer.inStock);
  if (inStock.length === 0) return;

  // best-value: cheapest in-stock offer, with a free-shipping preference
  // when two offers are within $1.
  const cheapest = inStock.reduce((best, r) =>
    r.effectivePrice < best.effectivePrice ? r : best
  );
  let bestValue = cheapest;
  const freeShipContender = inStock.find(
    (r) =>
      r !== cheapest &&
      clearsFreeShipping(r.offer) &&
      !clearsFreeShipping(cheapest.offer) &&
      Math.abs(r.effectivePrice - cheapest.effectivePrice) <=
        FREE_SHIP_TIEBREAK
  );
  if (freeShipContender) bestValue = freeShipContender;
  bestValue.badges.push('best-value');

  // fastest: lowest shippingDays.min among shippable in-stock offers.
  // Suppressed if all such offers tie.
  const shippable = inStock.filter((r) => r.offer.shippingDays);
  if (shippable.length > 0) {
    const minDays = Math.min(
      ...shippable.map((r) => r.offer.shippingDays!.min)
    );
    const allTie = shippable.every(
      (r) => r.offer.shippingDays!.min === minDays
    );
    if (!allTie) {
      const fastest = shippable.find(
        (r) => r.offer.shippingDays!.min === minDays
      )!;
      fastest.badges.push('fastest');
    }
  }

  // top-rated: highest store rating, only if meaningfully above average.
  const avgRating =
    inStock.reduce((sum, r) => sum + r.store.rating, 0) / inStock.length;
  const topRated = inStock.reduce((best, r) =>
    r.store.rating > best.store.rating ? r : best
  );
  if (topRated.store.rating - avgRating >= TOP_RATED_MARGIN) {
    topRated.badges.push('top-rated');
  }

  // closest: not awarded in v1 (no geolocation).
}

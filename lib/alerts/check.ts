import { STORES, getOffersFor, getProduct } from '@/lib/catalog';
import { rankOffers } from '@/lib/ranking/rankOffers';

import type { PriceAlert } from './storage';

export type AlertHit = {
  productId: string;
  productName: string;
  storeName: string;
  price: number;
  targetPrice: number;
};

// The best in-stock price for a product right now, or undefined if nothing
// is buyable.
export function bestInStockPrice(
  productId: string,
  now: Date
): { price: number; storeName: string } | undefined {
  const product = getProduct(productId);
  if (!product) return undefined;
  const ranked = rankOffers(product, getOffersFor(productId), STORES, now);
  const best = ranked.find((r) => r.offer.inStock);
  if (!best) return undefined;
  return { price: best.effectivePrice, storeName: best.store.name };
}

// Pure evaluation: which alerts have a current best price at or below target.
// An already-triggered alert only re-fires if its price went back above target
// and dropped again — handled by the caller via markTriggered.
export function evaluateAlerts(alerts: PriceAlert[], now: Date): AlertHit[] {
  const hits: AlertHit[] = [];
  for (const alert of alerts) {
    const product = getProduct(alert.productId);
    if (!product) continue;
    const best = bestInStockPrice(alert.productId, now);
    if (!best) continue;
    if (best.price <= alert.targetPrice && !alert.triggered) {
      hits.push({
        productId: alert.productId,
        productName: product.name,
        storeName: best.storeName,
        price: best.price,
        targetPrice: alert.targetPrice,
      });
    }
  }
  return hits;
}

// Alerts whose price has risen back above target — re-arm them so a future
// drop fires again.
export function alertsToReArm(alerts: PriceAlert[], now: Date): string[] {
  return alerts
    .filter((a) => {
      if (!a.triggered) return false;
      const best = bestInStockPrice(a.productId, now);
      return !best || best.price > a.targetPrice;
    })
    .map((a) => a.productId);
}

import { alertsToReArm, bestInStockPrice, evaluateAlerts } from './check';
import type { PriceAlert } from './storage';

const NOW = new Date('2026-05-16T00:00:00Z');

const alert = (over: Partial<PriceAlert>): PriceAlert => ({
  productId: 'lego-21595-ender-dragon',
  targetPrice: 100,
  createdAt: '2026-05-10',
  triggered: false,
  ...over,
});

describe('bestInStockPrice', () => {
  it('returns the cheapest in-stock price for a real product', () => {
    const best = bestInStockPrice('lego-21595-ender-dragon', NOW);
    // Amazon $56.99 is the cheapest in-stock offer
    expect(best).toEqual({ price: 56.99, storeName: 'Amazon' });
  });

  it('returns undefined for an unknown product', () => {
    expect(bestInStockPrice('nope', NOW)).toBeUndefined();
  });
});

describe('evaluateAlerts', () => {
  it('fires when the best price is at or below target', () => {
    const hits = evaluateAlerts([alert({ targetPrice: 60 })], NOW);
    expect(hits).toHaveLength(1);
    expect(hits[0].price).toBe(56.99);
    expect(hits[0].storeName).toBe('Amazon');
  });

  it('does not fire when the price is above target', () => {
    expect(evaluateAlerts([alert({ targetPrice: 40 })], NOW)).toEqual([]);
  });

  it('does not re-fire an already-triggered alert', () => {
    const hits = evaluateAlerts(
      [alert({ targetPrice: 60, triggered: true })],
      NOW
    );
    expect(hits).toEqual([]);
  });

  it('skips alerts for products no longer in the catalog', () => {
    const hits = evaluateAlerts(
      [alert({ productId: 'ghost', targetPrice: 999 })],
      NOW
    );
    expect(hits).toEqual([]);
  });
});

describe('alertsToReArm', () => {
  it('re-arms a triggered alert whose price rose back above target', () => {
    const ids = alertsToReArm(
      [alert({ targetPrice: 40, triggered: true })],
      NOW
    );
    expect(ids).toEqual(['lego-21595-ender-dragon']);
  });

  it('leaves a triggered alert still below target alone', () => {
    const ids = alertsToReArm(
      [alert({ targetPrice: 60, triggered: true })],
      NOW
    );
    expect(ids).toEqual([]);
  });

  it('ignores untriggered alerts', () => {
    const ids = alertsToReArm(
      [alert({ targetPrice: 40, triggered: false })],
      NOW
    );
    expect(ids).toEqual([]);
  });
});

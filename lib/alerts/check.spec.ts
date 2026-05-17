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
  // Asserts behavior, not a hardcoded dollar value — prices are refreshed
  // from live retailer data and change between runs.
  it('returns a sane best price for a real product', () => {
    const best = bestInStockPrice('lego-21595-ender-dragon', NOW);
    expect(best).toBeDefined();
    expect(best!.price).toBeGreaterThan(0);
    expect(typeof best!.storeName).toBe('string');
  });

  it('returns undefined for an unknown product', () => {
    expect(bestInStockPrice('nope', NOW)).toBeUndefined();
  });
});

describe('evaluateAlerts', () => {
  // Derive thresholds from the live best price so the test survives a
  // price refresh.
  const REAL = 'lego-21595-ender-dragon';
  const realBest = bestInStockPrice(REAL, NOW)!.price;

  it('fires when the best price is at or below target', () => {
    const hits = evaluateAlerts(
      [alert({ targetPrice: realBest + 5 })],
      NOW
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].price).toBe(realBest);
  });

  it('does not fire when the price is above target', () => {
    expect(
      evaluateAlerts([alert({ targetPrice: realBest - 5 })], NOW)
    ).toEqual([]);
  });

  it('does not re-fire an already-triggered alert', () => {
    const hits = evaluateAlerts(
      [alert({ targetPrice: realBest + 5, triggered: true })],
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
  const realBest = bestInStockPrice('lego-21595-ender-dragon', NOW)!.price;

  it('re-arms a triggered alert whose price rose back above target', () => {
    const ids = alertsToReArm(
      [alert({ targetPrice: realBest - 5, triggered: true })],
      NOW
    );
    expect(ids).toEqual(['lego-21595-ender-dragon']);
  });

  it('leaves a triggered alert still below target alone', () => {
    const ids = alertsToReArm(
      [alert({ targetPrice: realBest + 5, triggered: true })],
      NOW
    );
    expect(ids).toEqual([]);
  });

  it('ignores untriggered alerts', () => {
    const ids = alertsToReArm(
      [alert({ targetPrice: realBest - 5, triggered: false })],
      NOW
    );
    expect(ids).toEqual([]);
  });
});

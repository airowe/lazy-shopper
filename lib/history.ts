import AsyncStorage from '@react-native-async-storage/async-storage';

export type PriceRecord = {
  productId: string;
  retailerId: string;
  price: number;
  date: string;
};

export type PriceStats = {
  avg: number;
  min: number;
  max: number;
  median: number;
  count: number;
  currentPrice: number;
  trend: 'up' | 'down' | 'stable';
  percentFromAvg: number;
};

export type DealIndicator = {
  level: 'great' | 'good' | 'fair' | 'poor';
  label: string;
  color: string;
};

function storageKey(productId: string, retailerId: string): string {
  return `price_history:${productId}:${retailerId}`;
}

function productKeyPrefix(productId: string): string {
  return `price_history:${productId}:`;
}

const ALL_KEYS_PREFIX = 'price_history:';

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function computeStats(records: PriceRecord[]): PriceStats | null {
  if (records.length === 0) return null;

  const prices = records.map((r) => r.price);
  const sorted = [...prices].sort((a, b) => a - b);
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const currentPrice = records[0].price;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentPrices = records
    .filter((r) => new Date(r.date) >= thirtyDaysAgo)
    .map((r) => r.price);

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (recentPrices.length > 0) {
    const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
    if (currentPrice > recentAvg * 1.02) {
      trend = 'up';
    } else if (currentPrice < recentAvg * 0.98) {
      trend = 'down';
    }
  }

  const percentFromAvg = avg !== 0 ? ((currentPrice - avg) / avg) * 100 : 0;

  return {
    avg: Math.round(avg * 100) / 100,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: median(sorted),
    count: prices.length,
    currentPrice,
    trend,
    percentFromAvg: Math.round(percentFromAvg * 100) / 100,
  };
}

export async function savePrice(record: PriceRecord): Promise<void> {
  try {
    const key = storageKey(record.productId, record.retailerId);
    const raw = await AsyncStorage.getItem(key);
    const existing: PriceRecord[] = raw ? JSON.parse(raw) : [];
    existing.push(record);
    existing.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await AsyncStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // fail gracefully
  }
}

export async function getPriceHistory(
  productId: string,
  retailerId: string
): Promise<PriceRecord[]> {
  try {
    const key = storageKey(productId, retailerId);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const records = JSON.parse(raw) as PriceRecord[];
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return records;
  } catch {
    return [];
  }
}

export async function getPriceHistoryForProduct(
  productId: string
): Promise<PriceRecord[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prefix = productKeyPrefix(productId);
    const matchingKeys = keys.filter((k) => k.startsWith(prefix));

    const results: PriceRecord[] = [];
    for (const key of matchingKeys) {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        results.push(...(JSON.parse(raw) as PriceRecord[]));
      }
    }
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return results;
  } catch {
    return [];
  }
}

export async function getPriceStats(
  productId: string,
  retailerId: string
): Promise<PriceStats | null> {
  try {
    const records = await getPriceHistory(productId, retailerId);
    return computeStats(records);
  } catch {
    return null;
  }
}

export async function getAllProductStats(
  productId: string
): Promise<Map<string, PriceStats>> {
  const result = new Map<string, PriceStats>();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const prefix = productKeyPrefix(productId);
    const matchingKeys = keys.filter((k) => k.startsWith(prefix));

    for (const key of matchingKeys) {
      const retailerId = key.slice(prefix.length);
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const records = JSON.parse(raw) as PriceRecord[];
        const stats = computeStats(records);
        if (stats) {
          result.set(retailerId, stats);
        }
      }
    }
  } catch {
    // fail gracefully
  }
  return result;
}

export function getDealIndicator(stats: PriceStats): DealIndicator {
  const pct = stats.percentFromAvg;

  if (pct <= -15) {
    return { level: 'great', label: 'Great deal', color: 'green' };
  }
  if (pct <= 0) {
    return { level: 'good', label: 'Good price', color: 'yellow' };
  }
  if (pct <= 15) {
    return { level: 'fair', label: 'Fair price', color: 'orange' };
  }
  return { level: 'poor', label: 'Overpriced', color: 'red' };
}

export async function getBestHistoricalPrice(
  productId: string
): Promise<PriceRecord | null> {
  try {
    const records = await getPriceHistoryForProduct(productId);
    if (records.length === 0) return null;

    return records.reduce((best, current) =>
      current.price < best.price ? current : best
    );
  } catch {
    return null;
  }
}

export async function clearHistory(productId?: string): Promise<void> {
  try {
    if (productId) {
      const keys = await AsyncStorage.getAllKeys();
      const prefix = productKeyPrefix(productId);
      const matchingKeys = keys.filter((k) => k.startsWith(prefix));
      if (matchingKeys.length > 0) {
        await AsyncStorage.multiRemove(matchingKeys);
      }
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const matchingKeys = keys.filter((k) => k.startsWith(ALL_KEYS_PREFIX));
      if (matchingKeys.length > 0) {
        await AsyncStorage.multiRemove(matchingKeys);
      }
    }
  } catch {
    // fail gracefully
  }
}

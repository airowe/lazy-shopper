import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  savePrice,
  getPriceHistory,
  getPriceHistoryForProduct,
  getPriceStats,
  getAllProductStats,
  getDealIndicator,
  getBestHistoricalPrice,
  clearHistory,
} from './history';
import type { PriceRecord } from './history';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([] as readonly string[])),
}));

const mockedGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockedSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
const mockedGetAllKeys = AsyncStorage.getAllKeys as jest.MockedFunction<typeof AsyncStorage.getAllKeys>;
const mockedMultiRemove = AsyncStorage.multiRemove as jest.MockedFunction<typeof AsyncStorage.multiRemove>;

function makeRecord(overrides: Partial<PriceRecord> = {}): PriceRecord {
  return {
    productId: 'milk-whole-gallon',
    retailerId: 'freshmart',
    price: 4.29,
    date: '2025-01-15T12:00:00Z',
    ...overrides,
  };
}

function storageKey(productId: string, retailerId: string): string {
  return `price_history:${productId}:${retailerId}`;
}

describe('history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('savePrice', () => {
    it('saves a new record to an empty key', async () => {
      const record = makeRecord();
      mockedGetItem.mockResolvedValue(null);

      await savePrice(record);

      expect(mockedSetItem).toHaveBeenCalledWith(
        storageKey(record.productId, record.retailerId),
        JSON.stringify([record])
      );
    });

    it('appends a new record to existing records', async () => {
      const existing = makeRecord({ date: '2025-01-10T12:00:00Z', price: 4.49 });
      const record = makeRecord({ date: '2025-01-15T12:00:00Z', price: 4.29 });
      mockedGetItem.mockResolvedValue(JSON.stringify([existing]));

      await savePrice(record);

      const callArg = mockedSetItem.mock.calls[0][1];
      const saved: PriceRecord[] = JSON.parse(callArg);
      expect(saved).toHaveLength(2);
      expect(saved[0].date).toBe('2025-01-15T12:00:00Z'); // newest first
    });

    it('handles AsyncStorage errors gracefully', async () => {
      mockedGetItem.mockRejectedValue(new Error('storage error'));
      await expect(savePrice(makeRecord())).resolves.toBeUndefined();
    });
  });

  describe('getPriceHistory', () => {
    it('returns records sorted by date descending', async () => {
      const records: PriceRecord[] = [
        makeRecord({ date: '2025-01-10T12:00:00Z', price: 4.49 }),
        makeRecord({ date: '2025-01-15T12:00:00Z', price: 4.29 }),
        makeRecord({ date: '2025-01-05T12:00:00Z', price: 4.59 }),
      ];
      mockedGetItem.mockResolvedValue(JSON.stringify(records));

      const result = await getPriceHistory('milk-whole-gallon', 'freshmart');

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-01-15T12:00:00Z');
      expect(result[1].date).toBe('2025-01-10T12:00:00Z');
      expect(result[2].date).toBe('2025-01-05T12:00:00Z');
    });

    it('returns empty array when no data exists', async () => {
      mockedGetItem.mockResolvedValue(null);
      const result = await getPriceHistory('nonexistent', 'freshmart');
      expect(result).toEqual([]);
    });

    it('handles AsyncStorage errors gracefully', async () => {
      mockedGetItem.mockRejectedValue(new Error('storage error'));
      const result = await getPriceHistory('milk-whole-gallon', 'freshmart');
      expect(result).toEqual([]);
    });
  });

  describe('getPriceHistoryForProduct', () => {
    it('returns all records across retailers sorted by date descending', async () => {
      const freshmartRecords: PriceRecord[] = [
        makeRecord({ retailerId: 'freshmart', date: '2025-01-15T12:00:00Z', price: 4.29 }),
        makeRecord({ retailerId: 'freshmart', date: '2025-01-10T12:00:00Z', price: 4.49 }),
      ];
      const valuegrocerRecords: PriceRecord[] = [
        makeRecord({ retailerId: 'valuegrocer', date: '2025-01-14T12:00:00Z', price: 3.99 }),
      ];

      const store: Record<string, string> = {
        'price_history:milk-whole-gallon:freshmart': JSON.stringify(freshmartRecords),
        'price_history:milk-whole-gallon:valuegrocer': JSON.stringify(valuegrocerRecords),
        'price_history:eggs-large-12:freshmart': JSON.stringify([makeRecord({ productId: 'eggs-large-12' })]),
      };

      mockedGetAllKeys.mockResolvedValue(Object.keys(store));
      mockedGetItem.mockImplementation((key: string) =>
        Promise.resolve(store[key] ?? null)
      );

      const result = await getPriceHistoryForProduct('milk-whole-gallon');

      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2025-01-15T12:00:00Z');
      expect(result[1].date).toBe('2025-01-14T12:00:00Z');
      expect(result[2].date).toBe('2025-01-10T12:00:00Z');
    });

    it('returns empty array when no data exists', async () => {
      mockedGetAllKeys.mockResolvedValue([]);
      const result = await getPriceHistoryForProduct('nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('getPriceStats', () => {
    it('returns correct avg/min/max/median for valid data', async () => {
      const records: PriceRecord[] = [
        makeRecord({ date: '2025-01-15T12:00:00Z', price: 4.29 }),
        makeRecord({ date: '2025-01-10T12:00:00Z', price: 5.00 }),
        makeRecord({ date: '2025-01-05T12:00:00Z', price: 4.00 }),
      ];
      mockedGetItem.mockResolvedValue(JSON.stringify(records));

      const stats = await getPriceStats('milk-whole-gallon', 'freshmart');

      expect(stats).not.toBeNull();
      expect(stats!.count).toBe(3);
      expect(stats!.min).toBe(4.00);
      expect(stats!.max).toBe(5.00);
      expect(stats!.median).toBe(4.29);
      expect(stats!.avg).toBeCloseTo(4.43, 1);
      expect(stats!.currentPrice).toBe(4.29);
    });

    it('returns median as average of two middle values for even count', async () => {
      const records: PriceRecord[] = [
        makeRecord({ date: '2025-01-15T12:00:00Z', price: 4.29 }),
        makeRecord({ date: '2025-01-10T12:00:00Z', price: 5.00 }),
        makeRecord({ date: '2025-01-05T12:00:00Z', price: 4.00 }),
        makeRecord({ date: '2025-01-01T12:00:00Z', price: 3.50 }),
      ];
      mockedGetItem.mockResolvedValue(JSON.stringify(records));

      const stats = await getPriceStats('milk-whole-gallon', 'freshmart');

      // sorted: 3.50, 4.00, 4.29, 5.00 → median = (4.00 + 4.29) / 2
      expect(stats!.median).toBeCloseTo(4.145, 3);
    });

    it('returns null when no data exists', async () => {
      mockedGetItem.mockResolvedValue(null);
      const stats = await getPriceStats('nonexistent', 'freshmart');
      expect(stats).toBeNull();
    });

    it('returns correct trend', async () => {
      const today = new Date().toISOString();
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
      const records: PriceRecord[] = [
        makeRecord({ date: today, price: 5.00 }),
        makeRecord({ date: twoDaysAgo, price: 4.00 }),
      ];
      mockedGetItem.mockResolvedValue(JSON.stringify(records));

      const stats = await getPriceStats('milk-whole-gallon', 'freshmart');
      expect(stats!.trend).toBe('up');
    });
  });

  describe('getAllProductStats', () => {
    it('returns a map of retailerId -> PriceStats', async () => {
      const freshmartRecords: PriceRecord[] = [
        makeRecord({ retailerId: 'freshmart', price: 4.29 }),
      ];
      const valuegrocerRecords: PriceRecord[] = [
        makeRecord({ retailerId: 'valuegrocer', price: 3.99 }),
      ];

      const store: Record<string, string> = {
        'price_history:milk-whole-gallon:freshmart': JSON.stringify(freshmartRecords),
        'price_history:milk-whole-gallon:valuegrocer': JSON.stringify(valuegrocerRecords),
      };

      mockedGetAllKeys.mockResolvedValue(Object.keys(store));
      mockedGetItem.mockImplementation((key: string) =>
        Promise.resolve(store[key] ?? null)
      );

      const result = await getAllProductStats('milk-whole-gallon');

      expect(result.size).toBe(2);
      expect(result.get('freshmart')).toBeDefined();
      expect(result.get('valuegrocer')).toBeDefined();
      expect(result.get('freshmart')!.currentPrice).toBe(4.29);
    });

    it('returns empty map when no data exists', async () => {
      mockedGetAllKeys.mockResolvedValue([]);
      const result = await getAllProductStats('nonexistent');
      expect(result.size).toBe(0);
    });
  });

  describe('getDealIndicator', () => {
    const baseStats = {
      avg: 4.00,
      min: 3.50,
      max: 5.00,
      median: 4.00,
      count: 10,
      currentPrice: 4.00,
      trend: 'stable' as const,
    };

    it('returns great when price is >15% below avg', () => {
      const indicator = getDealIndicator({
        ...baseStats,
        currentPrice: 3.00,
        percentFromAvg: -25,
      });
      expect(indicator.level).toBe('great');
      expect(indicator.color).toBe('green');
    });

    it('returns good when price is 0-15% below avg', () => {
      const indicator = getDealIndicator({
        ...baseStats,
        currentPrice: 3.80,
        percentFromAvg: -5,
      });
      expect(indicator.level).toBe('good');
      expect(indicator.color).toBe('yellow');
    });

    it('returns good when price is exactly at avg', () => {
      const indicator = getDealIndicator({
        ...baseStats,
        currentPrice: 4.00,
        percentFromAvg: 0,
      });
      expect(indicator.level).toBe('good');
    });

    it('returns fair when price is 0-15% above avg', () => {
      const indicator = getDealIndicator({
        ...baseStats,
        currentPrice: 4.40,
        percentFromAvg: 10,
      });
      expect(indicator.level).toBe('fair');
      expect(indicator.color).toBe('orange');
    });

    it('returns poor when price is >15% above avg', () => {
      const indicator = getDealIndicator({
        ...baseStats,
        currentPrice: 5.00,
        percentFromAvg: 25,
      });
      expect(indicator.level).toBe('poor');
      expect(indicator.color).toBe('red');
    });

    it('returns great at exactly the -15% boundary', () => {
      const indicator = getDealIndicator({
        ...baseStats,
        currentPrice: 3.40,
        percentFromAvg: -15,
      });
      expect(indicator.level).toBe('great');
    });
  });

  describe('getBestHistoricalPrice', () => {
    it('returns the record with the lowest price', async () => {
      const store: Record<string, string> = {
        'price_history:milk-whole-gallon:freshmart': JSON.stringify([
          makeRecord({ retailerId: 'freshmart', price: 4.29 }),
          makeRecord({ retailerId: 'freshmart', price: 4.49 }),
        ]),
        'price_history:milk-whole-gallon:valuegrocer': JSON.stringify([
          makeRecord({ retailerId: 'valuegrocer', price: 3.49 }),
          makeRecord({ retailerId: 'valuegrocer', price: 3.99 }),
        ]),
      };

      mockedGetAllKeys.mockResolvedValue(Object.keys(store));
      mockedGetItem.mockImplementation((key: string) =>
        Promise.resolve(store[key] ?? null)
      );

      const result = await getBestHistoricalPrice('milk-whole-gallon');

      expect(result).not.toBeNull();
      expect(result!.price).toBe(3.49);
      expect(result!.retailerId).toBe('valuegrocer');
    });

    it('returns null when no data exists', async () => {
      mockedGetAllKeys.mockResolvedValue([]);
      const result = await getBestHistoricalPrice('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('clearHistory', () => {
    it('removes all price_history keys for a specific product', async () => {
      const keys = [
        'price_history:milk-whole-gallon:freshmart',
        'price_history:milk-whole-gallon:valuegrocer',
        'price_history:eggs-large-12:freshmart',
      ];
      mockedGetAllKeys.mockResolvedValue(keys);

      await clearHistory('milk-whole-gallon');

      expect(mockedMultiRemove).toHaveBeenCalledWith([
        'price_history:milk-whole-gallon:freshmart',
        'price_history:milk-whole-gallon:valuegrocer',
      ]);
    });

    it('removes all price_history keys when no productId given', async () => {
      const keys = [
        'price_history:milk-whole-gallon:freshmart',
        'price_history:eggs-large-12:freshmart',
        'user_settings',
      ];
      mockedGetAllKeys.mockResolvedValue(keys);

      await clearHistory();

      expect(mockedMultiRemove).toHaveBeenCalledWith([
        'price_history:milk-whole-gallon:freshmart',
        'price_history:eggs-large-12:freshmart',
      ]);
    });

    it('does not call multiRemove when no matching keys', async () => {
      mockedGetAllKeys.mockResolvedValue(['user_settings']);

      await clearHistory('nonexistent');

      expect(mockedMultiRemove).not.toHaveBeenCalled();
    });

    it('handles AsyncStorage errors gracefully', async () => {
      mockedGetAllKeys.mockRejectedValue(new Error('storage error'));
      await expect(clearHistory()).resolves.toBeUndefined();
    });
  });
});

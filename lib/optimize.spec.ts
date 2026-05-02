import { findCheapestStore, optimizeBasket } from './optimize';
import type { BasketItem } from './optimize';

describe('optimizeBasket', () => {
  describe('single item, single store', () => {
    it('returns correct allocation when constrained to one store', () => {
      const items: BasketItem[] = [
        { productId: 'milk-whole-gallon', quantity: 2 },
      ];

      const result = optimizeBasket(items, {
        includedStores: ['valuegrocer'],
      });

      expect(result.allocations).toHaveLength(1);
      expect(result.storesUsed).toBe(1);

      const alloc = result.allocations[0];
      expect(alloc.retailerId).toBe('valuegrocer');
      expect(alloc.retailerName).toBe('ValueGrocer');
      expect(alloc.items).toHaveLength(1);

      const item = alloc.items[0];
      expect(item.productId).toBe('milk-whole-gallon');
      expect(item.name).toBe('Whole Milk (Gallon)');
      expect(item.basePrice).toBe(3.99);
      expect(item.effectivePrice).toBe(3.99);
      expect(item.quantity).toBe(2);
      expect(item.lineTotal).toBe(7.98);
      expect(alloc.subtotal).toBe(7.98);
      expect(alloc.deliveryFee).toBe(3.99);
      expect(alloc.total).toBe(11.97);
      expect(alloc.itemCount).toBe(2);

      expect(result.totalCost).toBe(11.97);
      expect(result.singleStoreBaseline).toBe(11.97);
      expect(result.totalSavings).toBe(0);
      expect(result.totalSavingsPercent).toBe(0);
    });
  });

  describe('single item, multiple stores', () => {
    it('picks the cheapest store for the item', () => {
      const items: BasketItem[] = [
        { productId: 'eggs-large-12', quantity: 1 },
      ];

      const result = optimizeBasket(items);

      expect(result.allocations).toHaveLength(1);
      expect(result.storesUsed).toBe(1);

      const alloc = result.allocations[0];
      expect(alloc.retailerId).toBe('megasave');
      expect(alloc.items[0].productId).toBe('eggs-large-12');
      expect(alloc.items[0].basePrice).toBe(4.79);
      expect(alloc.items[0].effectivePrice).toBe(4.79);
      expect(alloc.items[0].lineTotal).toBe(4.79);
      expect(alloc.subtotal).toBe(4.79);
      expect(alloc.deliveryFee).toBe(5.49);
      expect(alloc.total).toBe(10.28);

      expect(result.totalCost).toBe(10.28);
      expect(result.singleStoreBaseline).toBe(8.98);
      expect(result.totalSavings).toBe(-1.3);
    });
  });

  describe('multiple items, multiple stores', () => {
    it('greedily splits items across their cheapest stores', () => {
      const items: BasketItem[] = [
        { productId: 'milk-whole-gallon', quantity: 1 },
        { productId: 'eggs-large-12', quantity: 1 },
        { productId: 'bananas-1lb', quantity: 2 },
      ];

      const result = optimizeBasket(items);

      const valueGrocer = result.allocations.find(
        (a) => a.retailerId === 'valuegrocer'
      )!;
      const megaSave = result.allocations.find(
        (a) => a.retailerId === 'megasave'
      )!;

      expect(result.allocations).toHaveLength(2);
      expect(result.storesUsed).toBe(2);

      expect(valueGrocer.items).toHaveLength(1);
      expect(valueGrocer.items[0].productId).toBe('milk-whole-gallon');
      expect(valueGrocer.items[0].lineTotal).toBe(3.99);
      expect(valueGrocer.subtotal).toBe(3.99);
      expect(valueGrocer.deliveryFee).toBe(3.99);
      expect(valueGrocer.total).toBe(7.98);

      expect(megaSave.items).toHaveLength(2);
      const eggItem = megaSave.items.find(
        (i) => i.productId === 'eggs-large-12'
      )!;
      expect(eggItem.lineTotal).toBe(4.79);
      const bananaItem = megaSave.items.find(
        (i) => i.productId === 'bananas-1lb'
      )!;
      expect(bananaItem.lineTotal).toBe(1.1); // 0.55 * 2
      expect(megaSave.subtotal).toBe(5.89);
      expect(megaSave.deliveryFee).toBe(5.49);
      expect(megaSave.total).toBe(11.38);

      expect(result.totalCost).toBe(19.36);
      expect(result.singleStoreBaseline).toBe(14.15);
      expect(result.totalSavings).toBe(-5.21);
    });
  });

  describe('maxStores=1', () => {
    it('forces all items into the single store with the most items', () => {
      const items: BasketItem[] = [
        { productId: 'milk-whole-gallon', quantity: 1 },
        { productId: 'eggs-large-12', quantity: 1 },
        { productId: 'bananas-1lb', quantity: 2 },
      ];

      const result = optimizeBasket(items, { maxStores: 1 });

      expect(result.allocations).toHaveLength(1);
      expect(result.storesUsed).toBe(1);

      const alloc = result.allocations[0];
      expect(alloc.retailerId).toBe('megasave');
      expect(alloc.items).toHaveLength(3);
      expect(alloc.subtotal).toBe(10.08);
      expect(alloc.deliveryFee).toBe(5.49);
      expect(alloc.total).toBe(15.57);

      expect(result.totalCost).toBe(15.57);
      expect(result.singleStoreBaseline).toBe(14.15);
      expect(result.totalSavings).toBe(-1.42);
    });
  });

  describe('maxStores=2', () => {
    it('does not consolidate when stores used are already at the limit', () => {
      const items: BasketItem[] = [
        { productId: 'milk-whole-gallon', quantity: 1 },
        { productId: 'eggs-large-12', quantity: 1 },
      ];

      const result = optimizeBasket(items, { maxStores: 2 });

      expect(result.allocations).toHaveLength(2);
      expect(result.storesUsed).toBe(2);

      expect(result.totalCost).toBe(18.26);
      expect(result.singleStoreBaseline).toBe(12.97);
      expect(result.totalSavings).toBe(-5.29);
    });
  });

  describe('preferPickup=true', () => {
    it('eliminates delivery fees regardless of subtotal', () => {
      const items: BasketItem[] = [
        { productId: 'milk-whole-gallon', quantity: 1 },
      ];

      const result = optimizeBasket(items, { preferPickup: true });

      const alloc = result.allocations[0];
      expect(alloc.retailerId).toBe('valuegrocer');
      expect(alloc.subtotal).toBe(3.99);
      expect(alloc.deliveryFee).toBe(0);
      expect(alloc.total).toBe(3.99);

      expect(result.totalCost).toBe(3.99);
      expect(result.singleStoreBaseline).toBe(3.99);
      expect(result.totalSavings).toBe(0);
    });
  });

  describe('useMembership=true', () => {
    it('applies membership discounts and can change which store is cheapest', () => {
      const items: BasketItem[] = [
        { productId: 'milk-whole-gallon', quantity: 1 },
      ];

      const withoutMembership = optimizeBasket(items, {
        includedStores: ['freshmart', 'quickstop', 'megasave'],
      });

      expect(withoutMembership.allocations[0].retailerId).toBe('megasave');
      expect(withoutMembership.allocations[0].items[0].effectivePrice).toBe(
        4.19
      );

      const withMembership = optimizeBasket(items, {
        includedStores: ['freshmart', 'quickstop', 'megasave'],
        useMembership: true,
      });

      expect(withMembership.allocations[0].retailerId).toBe('quickstop');
      expect(withMembership.allocations[0].items[0].effectivePrice).toBe(4.04);
      expect(withMembership.allocations[0].total).toBe(11.03);
    });
  });

  describe('includedStores subset', () => {
    it('only considers the specified stores', () => {
      const items: BasketItem[] = [
        { productId: 'milk-whole-gallon', quantity: 1 },
      ];

      const result = optimizeBasket(items, {
        includedStores: ['freshmart', 'quickstop'],
      });

      expect(result.allocations).toHaveLength(1);
      const alloc = result.allocations[0];
      expect(alloc.retailerId).toBe('freshmart');
      expect(alloc.items[0].basePrice).toBe(4.29);
      expect(alloc.total).toBe(9.28);

      expect(result.totalCost).toBe(9.28);
      expect(result.singleStoreBaseline).toBe(9.28);
      expect(result.totalSavings).toBe(0);
    });
  });

  describe('empty basket', () => {
    it('returns an empty result with zero savings', () => {
      const items: BasketItem[] = [];

      const result = optimizeBasket(items);

      expect(result.allocations).toHaveLength(0);
      expect(result.storesUsed).toBe(0);
      expect(result.totalCost).toBe(0);
      expect(result.singleStoreBaseline).toBe(0);
      expect(result.mostExpensiveStoreAllocation).toBe(0);
      expect(result.totalSavings).toBe(0);
      expect(result.totalSavingsPercent).toBe(0);
    });
  });

  describe('item not found at any store', () => {
    it('excludes the unmatched item from the result', () => {
      const items: BasketItem[] = [
        { productId: 'nonexistent-item', quantity: 1 },
      ];

      const result = optimizeBasket(items);

      expect(result.allocations).toHaveLength(0);
      expect(result.storesUsed).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  describe('savings calculation', () => {
    it('computes correct savings when optimization beats single store', () => {
      const items: BasketItem[] = [
        { productId: 'milk-whole-gallon', quantity: 10 },
        { productId: 'eggs-large-12', quantity: 10 },
        { productId: 'chicken-breast-lb', quantity: 5 },
        { productId: 'coffee-ground-12oz', quantity: 5 },
      ];

      const result = optimizeBasket(items);

      expect(result.storesUsed).toBe(2);

      // MegaSave: eggs, chicken, coffee — all hit free delivery threshold
      const megaSave = result.allocations.find(
        (a) => a.retailerId === 'megasave'
      )!;
      const megaEggs = megaSave.items.find(
        (i) => i.productId === 'eggs-large-12'
      )!;
      expect(megaEggs.lineTotal).toBe(47.9); // 4.79 * 10
      const megaChicken = megaSave.items.find(
        (i) => i.productId === 'chicken-breast-lb'
      )!;
      expect(megaChicken.lineTotal).toBe(24.95); // 4.99 * 5
      const megaCoffee = megaSave.items.find(
        (i) => i.productId === 'coffee-ground-12oz'
      )!;
      expect(megaCoffee.lineTotal).toBe(29.95); // 5.99 * 5
      expect(megaSave.subtotal).toBe(102.8);
      expect(megaSave.deliveryFee).toBe(0);
      expect(megaSave.total).toBe(102.8);

      // ValueGrocer: milk — hits free delivery threshold
      const valueGrocer = result.allocations.find(
        (a) => a.retailerId === 'valuegrocer'
      )!;
      const vMilk = valueGrocer.items.find(
        (i) => i.productId === 'milk-whole-gallon'
      )!;
      expect(vMilk.lineTotal).toBe(39.9); // 3.99 * 10
      expect(valueGrocer.subtotal).toBe(39.9);
      expect(valueGrocer.deliveryFee).toBe(0);
      expect(valueGrocer.total).toBe(39.9);

      expect(result.totalCost).toBe(142.7);
      expect(result.singleStoreBaseline).toBe(144.7);
      expect(result.totalSavings).toBe(2.0);
      expect(result.totalSavingsPercent).toBe(1.38);
    });
  });

  describe('findCheapestStore', () => {
    it('can be used to find the cheapest store for a single product', () => {

      const result = findCheapestStore('eggs-large-12', [
        'freshmart',
        'valuegrocer',
        'quickstop',
        'megasave',
      ], false);

      expect(result).not.toBeNull();
      expect(result!.retailerId).toBe('megasave');
      expect(result!.price).toBe(4.79);
      expect(result!.effectivePrice).toBe(4.79);
    });

    it('returns null for an unknown product', () => {

      const result = findCheapestStore('unknown', [
        'freshmart',
        'valuegrocer',
      ], false);

      expect(result).toBeNull();
    });

    it('returns null when product is out of stock at all included stores', () => {

      const result = findCheapestStore('bread-whole-wheat', [
        'megasave',
      ], false);

      expect(result).toBeNull();
    });

    it('applies membership discount to effective price', () => {

      const result = findCheapestStore('milk-whole-gallon', [
        'freshmart',
        'quickstop',
      ], true);

      expect(result).not.toBeNull();
      // freshmart: 4.29 * 0.95 = 4.08, quickstop: 4.49 * 0.9 = 4.04
      expect(result!.retailerId).toBe('quickstop');
      expect(result!.price).toBe(4.49);
      expect(result!.effectivePrice).toBe(4.04);
    });
  });
});

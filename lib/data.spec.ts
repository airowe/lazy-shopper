import { getRetailer, PRODUCTS, RETAILERS } from './data';

describe('data', () => {
  describe('RETAILERS', () => {
    it('has 4 retailers', () => {
      expect(RETAILERS).toHaveLength(4);
    });

    it.each(['freshmart', 'valuegrocer', 'quickstop', 'megasave'])(
      'contains retailer with id %s',
      (id) => {
        expect(RETAILERS.find((r) => r.id === id)).toBeDefined();
      }
    );
  });

  describe('PRODUCTS', () => {
    it('has at least 10 products', () => {
      expect(PRODUCTS.length).toBeGreaterThanOrEqual(10);
    });

    it('every product has offers from all 4 retailers', () => {
      for (const product of PRODUCTS) {
        const retailerIds = product.offers.map((o) => o.retailerId);
        RETAILERS.forEach((r) => {
          expect(retailerIds).toContain(r.id);
        });
      }
    });

    it('every product has a name, category, and image', () => {
      for (const product of PRODUCTS) {
        expect(product.name).toBeTruthy();
        expect(product.category).toBeTruthy();
        expect(product.image).toBeTruthy();
      }
    });
  });

  describe('getRetailer', () => {
    it('returns the retailer for a valid id', () => {
      const retailer = getRetailer('freshmart');
      expect(retailer).toBeDefined();
      expect(retailer!.name).toBe('FreshMart');
      expect(retailer!.deliveryFee).toBe(4.99);
    });

    it('returns undefined for an unknown id', () => {
      expect(getRetailer('nonexistent')).toBeUndefined();
    });
  });
});

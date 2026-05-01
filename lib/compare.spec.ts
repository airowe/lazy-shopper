import { searchProducts, compareOffers } from './compare';
import type { Product } from './data';

const mockProduct: Product = {
  id: 'test-milk',
  name: 'Whole Milk (Gallon)',
  category: 'Dairy',
  image: '🥛',
  offers: [
    { retailerId: 'valuegrocer', price: 3.99, unit: '1 gal', unitPrice: 3.99, inStock: true, onSale: true },
    { retailerId: 'megasave', price: 4.19, unit: '1 gal', unitPrice: 4.19, inStock: true, onSale: false },
    { retailerId: 'freshmart', price: 4.29, unit: '1 gal', unitPrice: 4.29, inStock: true, onSale: false },
    { retailerId: 'quickstop', price: 4.49, unit: '1 gal', unitPrice: 4.49, inStock: true, onSale: false },
  ],
};

describe('searchProducts', () => {
  it('returns products matching the query by name', () => {
    const results = searchProducts('milk');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.name.toLowerCase().includes('milk'))).toBe(true);
  });

  it('returns products matching by category', () => {
    const results = searchProducts('dairy');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.category.toLowerCase().includes('dairy'))).toBe(true);
  });

  it('is case-insensitive', () => {
    const lower = searchProducts('milk');
    const upper = searchProducts('MILK');
    expect(lower).toEqual(upper);
  });

  it('returns empty array for empty string', () => {
    expect(searchProducts('')).toEqual([]);
    expect(searchProducts('   ')).toEqual([]);
  });

  it('returns empty array for no match', () => {
    expect(searchProducts('xyznonexistent123')).toEqual([]);
  });

  it('matches partial names', () => {
    const results = searchProducts('chick');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.name.toLowerCase().includes('chicken'))).toBe(true);
  });
});

describe('compareOffers', () => {
  it('returns sorted offers by effective price (lowest first)', () => {
    const result = compareOffers(mockProduct);
    expect(result.offers).toHaveLength(4);
    expect(result.offers[0].retailer.id).toBe('valuegrocer');
    expect(result.offers[0].effectivePrice).toBe(3.99);
    expect(result.offers[3].retailer.id).toBe('quickstop');
  });

  it('sets bestPick to the lowest-price offer', () => {
    const result = compareOffers(mockProduct);
    expect(result.bestPick).not.toBeNull();
    expect(result.bestPick!.retailer.id).toBe('valuegrocer');
    expect(result.bestPick!.effectivePrice).toBe(3.99);
    expect(result.bestPick!.rank).toBe(1);
  });

  it('calculates savings relative to best price', () => {
    const result = compareOffers(mockProduct);
    const best = result.offers[0];
    expect(best.savings).toBe(0);

    const second = result.offers[1];
    expect(second.savings).toBeGreaterThan(0);
    expect(second.savings).toBeCloseTo(0.20, 1);
  });

  it('ranks offers 1 through N', () => {
    const result = compareOffers(mockProduct);
    result.offers.forEach((o, i) => {
      expect(o.rank).toBe(i + 1);
    });
  });

  it('applies membership discount when useMembership is true', () => {
    const without = compareOffers(mockProduct, false);
    const withMembership = compareOffers(mockProduct, true);

    const freshmartWithout = without.offers.find((o) => o.retailer.id === 'freshmart')!;
    const freshmartWith = withMembership.offers.find((o) => o.retailer.id === 'freshmart')!;

    expect(freshmartWith.effectivePrice).toBeLessThan(freshmartWithout.effectivePrice);
  });

  it('puts out-of-stock items last', () => {
    const productWithOOS: Product = {
      ...mockProduct,
      offers: [
        { retailerId: 'valuegrocer', price: 3.99, unit: '1 gal', unitPrice: 3.99, inStock: false, onSale: true },
        { retailerId: 'freshmart', price: 4.29, unit: '1 gal', unitPrice: 4.29, inStock: true, onSale: false },
        { retailerId: 'megasave', price: 4.19, unit: '1 gal', unitPrice: 4.19, inStock: false, onSale: false },
        { retailerId: 'quickstop', price: 4.49, unit: '1 gal', unitPrice: 4.49, inStock: true, onSale: false },
      ],
    };

    const result = compareOffers(productWithOOS);
    expect(result.offers[0].offer.inStock).toBe(true);
    expect(result.offers[1].offer.inStock).toBe(true);
    expect(result.offers[2].offer.inStock).toBe(false);
    expect(result.offers[3].offer.inStock).toBe(false);
  });

  it('filters out offers with unknown retailer IDs', () => {
    const productWithBadOffer: Product = {
      id: 'bad-offer',
      name: 'Bad Offer',
      category: 'Test',
      image: '📦',
      offers: [
        { retailerId: 'nonexistent', price: 1.00, unit: '1', unitPrice: 1.00, inStock: true, onSale: false },
        { retailerId: 'freshmart', price: 4.29, unit: '1 gal', unitPrice: 4.29, inStock: true, onSale: false },
      ],
    };

    const result = compareOffers(productWithBadOffer);
    expect(result.offers).toHaveLength(1);
    expect(result.offers[0].retailer.id).toBe('freshmart');
  });

  it('handles a product with no offers', () => {
    const emptyProduct: Product = {
      id: 'empty',
      name: 'Empty',
      category: 'Test',
      image: '📦',
      offers: [],
    };

    const result = compareOffers(emptyProduct);
    expect(result.offers).toHaveLength(0);
    expect(result.bestPick).toBeNull();
  });
});

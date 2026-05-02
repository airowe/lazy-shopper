import {
  normalizeUnit,
  inferUnit,
  formatUnitPrice,
  findCommonUnit,
  getUnitCategory,
} from './units';
import type { Unit } from './units';

describe('normalizeUnit', () => {
  describe('same unit', () => {
    it('returns value unchanged for same unit', () => {
      expect(normalizeUnit(16, 'oz', 'oz')).toBe(16);
      expect(normalizeUnit(1, 'lb', 'lb')).toBe(1);
      expect(normalizeUnit(128, 'fl_oz', 'fl_oz')).toBe(128);
      expect(normalizeUnit(1000, 'ml', 'ml')).toBe(1000);
      expect(normalizeUnit(1000, 'g', 'g')).toBe(1000);
    });
  });

  describe('oz <-> lb', () => {
    it('converts oz to lb', () => {
      expect(normalizeUnit(16, 'oz', 'lb')).toBe(1);
      expect(normalizeUnit(32, 'oz', 'lb')).toBe(2);
      expect(normalizeUnit(8, 'oz', 'lb')).toBe(0.5);
    });

    it('converts lb to oz', () => {
      expect(normalizeUnit(1, 'lb', 'oz')).toBe(16);
      expect(normalizeUnit(2.5, 'lb', 'oz')).toBe(40);
      expect(normalizeUnit(0.25, 'lb', 'oz')).toBe(4);
    });
  });

  describe('fl_oz <-> gal', () => {
    it('converts fl_oz to gal', () => {
      expect(normalizeUnit(128, 'fl_oz', 'gal')).toBe(1);
      expect(normalizeUnit(64, 'fl_oz', 'gal')).toBe(0.5);
      expect(normalizeUnit(32, 'fl_oz', 'gal')).toBe(0.25);
    });

    it('converts gal to fl_oz', () => {
      expect(normalizeUnit(1, 'gal', 'fl_oz')).toBe(128);
      expect(normalizeUnit(0.5, 'gal', 'fl_oz')).toBe(64);
    });
  });

  describe('ml <-> L', () => {
    it('converts ml to L', () => {
      expect(normalizeUnit(1000, 'ml', 'L')).toBe(1);
      expect(normalizeUnit(500, 'ml', 'L')).toBe(0.5);
      expect(normalizeUnit(250, 'ml', 'L')).toBe(0.25);
    });

    it('converts L to ml', () => {
      expect(normalizeUnit(1, 'L', 'ml')).toBe(1000);
      expect(normalizeUnit(0.75, 'L', 'ml')).toBe(750);
    });
  });

  describe('g <-> kg', () => {
    it('converts g to kg', () => {
      expect(normalizeUnit(1000, 'g', 'kg')).toBe(1);
      expect(normalizeUnit(500, 'g', 'kg')).toBe(0.5);
    });

    it('converts kg to g', () => {
      expect(normalizeUnit(1, 'kg', 'g')).toBe(1000);
      expect(normalizeUnit(0.2, 'kg', 'g')).toBe(200);
    });
  });

  describe('each and ct (count units)', () => {
    it('passes through each to each', () => {
      expect(normalizeUnit(1.99, 'each', 'each')).toBe(1.99);
    });

    it('passes through ct to ct', () => {
      expect(normalizeUnit(4.99, 'ct', 'ct')).toBe(4.99);
    });

    it('passes through each to another unit', () => {
      expect(normalizeUnit(1.99, 'each', 'oz')).toBe(1.99);
    });

    it('passes through ct to another unit', () => {
      expect(normalizeUnit(4.99, 'ct', 'lb')).toBe(4.99);
    });

    it('passes through when target is count', () => {
      expect(normalizeUnit(16, 'oz', 'each')).toBe(16);
    });
  });

  describe('cross-category fallback', () => {
    it('returns value unchanged for unsupported conversion', () => {
      expect(normalizeUnit(16, 'oz', 'ml')).toBe(16);
    });
  });
});

describe('inferUnit', () => {
  it('parses "1 gal"', () => {
    expect(inferUnit('1 gal')).toBe('gal');
  });

  it('parses "12 ct"', () => {
    expect(inferUnit('12 ct')).toBe('ct');
  });

  it('parses "8 oz"', () => {
    expect(inferUnit('8 oz')).toBe('oz');
  });

  it('parses "1 lb"', () => {
    expect(inferUnit('1 lb')).toBe('lb');
  });

  it('parses "each"', () => {
    expect(inferUnit('each')).toBe('each');
  });

  it('parses "500 ml"', () => {
    expect(inferUnit('500 ml')).toBe('ml');
  });

  it('parses "1 kg"', () => {
    expect(inferUnit('1 kg')).toBe('kg');
  });

  it('parses "1 g"', () => {
    expect(inferUnit('1 g')).toBe('g');
  });

  it('parses "1 L" (uppercase)', () => {
    expect(inferUnit('1 L')).toBe('L');
  });

  it('parses "1 l" (lowercase)', () => {
    expect(inferUnit('1 l')).toBe('L');
  });

  it('parses "64 fl_oz"', () => {
    expect(inferUnit('64 fl_oz')).toBe('fl_oz');
  });

  it('returns null for unrecognized string "xyz"', () => {
    expect(inferUnit('xyz')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(inferUnit('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(inferUnit('   ')).toBeNull();
  });

  it('parses fractional amount "0.5 lb"', () => {
    expect(inferUnit('0.5 lb')).toBe('lb');
  });

  it('is case-insensitive for "Oz"', () => {
    expect(inferUnit('8 Oz')).toBe('oz');
  });
});

describe('formatUnitPrice', () => {
  it('formats oz price', () => {
    expect(formatUnitPrice(0.42, 'oz')).toBe('$0.42/oz');
  });

  it('formats lb price', () => {
    expect(formatUnitPrice(4.99, 'lb')).toBe('$4.99/lb');
  });

  it('formats each price', () => {
    expect(formatUnitPrice(1.99, 'each')).toBe('$1.99/each');
  });

  it('formats ct price', () => {
    expect(formatUnitPrice(0.46, 'ct')).toBe('$0.46/ct');
  });

  it('formats fl_oz price', () => {
    expect(formatUnitPrice(0.08, 'fl_oz')).toBe('$0.08/fl_oz');
  });

  it('formats L price', () => {
    expect(formatUnitPrice(2.5, 'L')).toBe('$2.50/L');
  });

  it('formats kg price', () => {
    expect(formatUnitPrice(3.3, 'kg')).toBe('$3.30/kg');
  });

  it('rounds to two decimal places', () => {
    expect(formatUnitPrice(0.456, 'oz')).toBe('$0.46/oz');
  });

  it('formats zero price', () => {
    expect(formatUnitPrice(0, 'each')).toBe('$0.00/each');
  });

  it('formats integer price', () => {
    expect(formatUnitPrice(5, 'lb')).toBe('$5.00/lb');
  });
});

describe('findCommonUnit', () => {
  it('prefers lb when oz and lb are present', () => {
    const units: Unit[] = ['oz', 'oz', 'lb'];
    expect(findCommonUnit(units)).toBe('lb');
  });

  it('prefers lb for only oz', () => {
    const units: Unit[] = ['oz', 'oz'];
    expect(findCommonUnit(units)).toBe('lb');
  });

  it('returns lb for all lb', () => {
    const units: Unit[] = ['lb', 'lb'];
    expect(findCommonUnit(units)).toBe('lb');
  });

  it('prefers L when ml and L are present', () => {
    const units: Unit[] = ['ml', 'L', 'ml'];
    expect(findCommonUnit(units)).toBe('L');
  });

  it('prefers L for only ml', () => {
    const units: Unit[] = ['ml', 'ml'];
    expect(findCommonUnit(units)).toBe('L');
  });

  it('returns gal for fl_oz units', () => {
    const units: Unit[] = ['fl_oz', 'fl_oz'];
    expect(findCommonUnit(units)).toBe('gal');
  });

  it('prefers kg for g and kg', () => {
    const units: Unit[] = ['g', 'kg'];
    expect(findCommonUnit(units)).toBe('kg');
  });

  it('prefers kg for only g', () => {
    const units: Unit[] = ['g', 'g'];
    expect(findCommonUnit(units)).toBe('kg');
  });

  it('falls back to first unit for count-only units', () => {
    const units: Unit[] = ['each', 'each'];
    expect(findCommonUnit(units)).toBe('each');
  });

  it('falls back to first unit for empty array', () => {
    expect(findCommonUnit([])).toBe('each');
  });

  it('falls back to first unit for unrecognized mix', () => {
    const units: Unit[] = ['ct', 'ct'];
    expect(findCommonUnit(units)).toBe('ct');
  });
});

describe('getUnitCategory', () => {
  describe('weight', () => {
    it('classifies oz as weight', () => {
      expect(getUnitCategory('oz')).toBe('weight');
    });

    it('classifies lb as weight', () => {
      expect(getUnitCategory('lb')).toBe('weight');
    });

    it('classifies g as weight', () => {
      expect(getUnitCategory('g')).toBe('weight');
    });

    it('classifies kg as weight', () => {
      expect(getUnitCategory('kg')).toBe('weight');
    });
  });

  describe('volume', () => {
    it('classifies fl_oz as volume', () => {
      expect(getUnitCategory('fl_oz')).toBe('volume');
    });

    it('classifies gal as volume', () => {
      expect(getUnitCategory('gal')).toBe('volume');
    });

    it('classifies ml as volume', () => {
      expect(getUnitCategory('ml')).toBe('volume');
    });

    it('classifies L as volume', () => {
      expect(getUnitCategory('L')).toBe('volume');
    });
  });

  describe('count', () => {
    it('classifies each as count', () => {
      expect(getUnitCategory('each')).toBe('count');
    });

    it('classifies ct as count', () => {
      expect(getUnitCategory('ct')).toBe('count');
    });
  });
});

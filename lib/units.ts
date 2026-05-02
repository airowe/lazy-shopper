export type Unit = 'oz' | 'lb' | 'fl_oz' | 'gal' | 'ml' | 'L' | 'g' | 'kg' | 'each' | 'ct';

const CONVERSIONS: Record<string, number> = {
  'oz->lb': 1 / 16,
  'lb->oz': 16,
  'fl_oz->gal': 1 / 128,
  'gal->fl_oz': 128,
  'ml->L': 1 / 1000,
  'L->ml': 1000,
  'g->kg': 1 / 1000,
  'kg->g': 1000,
};

export function normalizeUnit(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  if (from === 'each' || from === 'ct' || to === 'each' || to === 'ct') return value;

  const key = `${from}->${to}`;
  const factor = CONVERSIONS[key];

  if (factor !== undefined) return value * factor;

  return value;
}

const UNIT_PATTERNS: [string, Unit][] = [
  ['fl_oz', 'fl_oz'],
  ['gal', 'gal'],
  ['each', 'each'],
  ['ml', 'ml'],
  ['kg', 'kg'],
  ['oz', 'oz'],
  ['lb', 'lb'],
  ['ct', 'ct'],
  ['l', 'L'],
  ['g', 'g'],
];

export function inferUnit(unitString: string): Unit | null {
  const trimmed = unitString.trim().toLowerCase();
  if (!trimmed) return null;

  for (const [pattern, unit] of UNIT_PATTERNS) {
    if (
      trimmed === pattern ||
      trimmed.endsWith(` ${pattern}`)
    ) {
      return unit;
    }
  }

  return null;
}

export function formatUnitPrice(price: number, unit: Unit): string {
  return `$${price.toFixed(2)}/${unit}`;
}

export function findCommonUnit(units: Unit[]): Unit {
  if (units.length === 0) return 'each';

  const unitSet = new Set(units);

  if (unitSet.has('oz') || unitSet.has('lb')) return 'lb';
  if (unitSet.has('g') || unitSet.has('kg')) return 'kg';
  if (unitSet.has('ml') || unitSet.has('L')) return 'L';
  if (unitSet.has('fl_oz') || unitSet.has('gal')) return 'gal';

  return units[0];
}

export function getUnitCategory(unit: Unit): 'weight' | 'volume' | 'count' {
  switch (unit) {
    case 'oz':
    case 'lb':
    case 'g':
    case 'kg':
      return 'weight';
    case 'fl_oz':
    case 'gal':
    case 'ml':
    case 'L':
      return 'volume';
    case 'each':
    case 'ct':
      return 'count';
  }
}

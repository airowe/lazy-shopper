import { StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { inferUnit, findCommonUnit, normalizeUnit, type Unit } from '@/lib/units';
import type { RankedOffer } from '@/lib/compare';

type Props = {
  offers: RankedOffer[];
};

type NormalizedPrice = {
  unit: Unit;
  normPrice: number;
};

const UNIT_LABELS: Record<Unit, string> = {
  oz: 'oz',
  lb: 'lb',
  fl_oz: 'fl oz',
  gal: 'gal',
  ml: 'ml',
  L: 'L',
  g: 'g',
  kg: 'kg',
  each: 'each',
  ct: 'ct',
};

export default function UnitPriceSummary({ offers }: Props) {
  if (offers.length < 2) return null;

  const parsed = offers
    .map((o) => {
      const unit = inferUnit(o.offer.unit);
      if (!unit) return null;
      return { unit, unitPrice: o.offer.unitPrice };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const units = parsed.map((p) => p.unit);
  const uniqueUnits = new Set(units);

  if (uniqueUnits.size <= 1) return null;

  const commonUnit = findCommonUnit(units);

  const normalized: NormalizedPrice[] = parsed.map((p) => ({
    unit: p.unit,
    normPrice: p.unitPrice * normalizeUnit(1, commonUnit, p.unit),
  }));

  const prices = normalized.map((n) => n.normPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const unitLabel = UNIT_LABELS[commonUnit] ?? commonUnit;

  return (
    <View style={styles.card} lightColor="#1e293b" darkColor="#1e293b">
      <View style={styles.header} lightColor="transparent" darkColor="transparent">
        <FontAwesome name="balance-scale" size={14} color="#94a3b8" />
        <Text style={styles.title}>Unit Price Comparison</Text>
      </View>
      <Text style={styles.summary}>
        Price per {unitLabel}:{' '}
        <Text style={styles.priceLow}>${minPrice.toFixed(2)}</Text>
        <Text style={styles.separator}> – </Text>
        <Text style={styles.priceHigh}>${maxPrice.toFixed(2)}</Text>
      </Text>
      <Text style={styles.hint}>
        Normalized from {units.length} different unit sizes to a common {unitLabel} measure
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summary: {
    color: '#cbd5e1',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceLow: {
    color: '#22c55e',
    fontWeight: '700',
  },
  separator: {
    color: '#64748b',
  },
  priceHigh: {
    color: '#ef4444',
    fontWeight: '700',
  },
  hint: {
    color: '#64748b',
    fontSize: 11,
  },
});

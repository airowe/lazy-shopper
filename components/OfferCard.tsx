import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, theme } from '@/constants/theme';
import type { RankedOffer } from '@/lib/ranking/rankOffers';

const BADGE_LABEL: Record<string, { label: string; color: string }> = {
  'best-value': { label: 'Best price', color: theme.badgeBest },
  fastest: { label: 'Fastest', color: theme.badgeFast },
  'top-rated': { label: 'Top rated', color: theme.badgeRated },
  closest: { label: 'Closest', color: theme.grass },
};

function shippingText(ranked: RankedOffer): string {
  const days = ranked.offer.shippingDays;
  if (!days) return 'In-store only';
  if (days.min === days.max) return `${days.min} day${days.min === 1 ? '' : 's'}`;
  return `${days.min}–${days.max} days`;
}

type Props = {
  ranked: RankedOffer;
  onPress: () => void;
  testID?: string;
};

export function OfferCard({ ranked, onPress, testID }: Props) {
  const { offer, store, badges, stale } = ranked;
  const outOfStock = !offer.inStock;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={outOfStock}
      style={({ pressed }) => [
        styles.card,
        outOfStock && styles.cardDisabled,
        pressed && !outOfStock && styles.cardPressed,
      ]}
    >
      <View style={[styles.logo, { backgroundColor: store.brandColor }]}>
        <Text style={styles.logoText}>{store.name.charAt(0)}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.store}>{store.name}</Text>
          <Text style={[styles.price, outOfStock && styles.priceDim]}>
            ${offer.price.toFixed(2)}
          </Text>
        </View>
        <Text style={styles.meta}>
          {outOfStock ? 'Out of stock' : shippingText(ranked)}
          {!outOfStock && offer.freeShippingThreshold !== undefined
            ? ` · free $${offer.freeShippingThreshold}+`
            : ''}
        </Text>
        <View style={styles.badgeRow}>
          {badges.map((b) => {
            const meta = BADGE_LABEL[b];
            if (!meta) return null;
            return (
              <View
                key={b}
                style={[styles.badge, { backgroundColor: meta.color }]}
              >
                <Text style={styles.badgeText}>{meta.label}</Text>
              </View>
            );
          })}
          {stale && !outOfStock ? (
            <View style={[styles.badge, styles.staleBadge]}>
              <Text style={styles.staleText}>Check before buying</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
  },
  cardPressed: { opacity: 0.7 },
  cardDisabled: { opacity: 0.5 },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  body: { flex: 1, gap: 4 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  store: { color: theme.text, fontSize: 16, fontWeight: '600' },
  price: { color: theme.text, fontSize: 18, fontWeight: '700' },
  priceDim: { color: theme.textDim },
  meta: { color: theme.textDim, fontSize: 13 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: { color: '#0F0F12', fontSize: 11, fontWeight: '700' },
  staleBadge: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.gold },
  staleText: { color: theme.gold, fontSize: 11, fontWeight: '600' },
});

import { StyleSheet } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { RankedOffer } from '@/lib/compare';

type Props = {
  bestPick: RankedOffer;
  useMembership: boolean;
};

export default function BestPickBanner({ bestPick, useMembership }: Props) {
  const { retailer, effectivePrice, offer } = bestPick;

  return (
    <View style={styles.container} lightColor="#1e3a5f" darkColor="#1e3a5f">
      <View style={styles.badge} lightColor="#3b82f6" darkColor="#3b82f6">
        <Text style={styles.badgeText}>BEST PICK</Text>
      </View>
      <View style={styles.row} lightColor="transparent" darkColor="transparent">
        <Text style={styles.logo}>{retailer.logo}</Text>
        <View style={styles.info} lightColor="transparent" darkColor="transparent">
          <Text style={styles.store}>{retailer.name}</Text>
          <Text style={styles.price}>
            ${effectivePrice.toFixed(2)}
            <Text style={styles.unit}> / {offer.unit}</Text>
          </Text>
        </View>
      </View>
      <View style={styles.reasons} lightColor="transparent" darkColor="transparent">
        <Text style={styles.reasonItem}>
          {offer.onSale ? '🏷️ On sale' : '💰 Lowest price'}
        </Text>
        {retailer.pickupAvailable && (
          <Text style={styles.reasonItem}>📦 Pickup available</Text>
        )}
        {useMembership && retailer.membershipDiscount > 0 && (
          <Text style={styles.reasonItem}>
            🎟️ {retailer.membershipName} discount
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  logo: {
    fontSize: 40,
  },
  info: {
    flex: 1,
  },
  store: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
  },
  price: {
    color: '#22c55e',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
  },
  unit: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '400',
  },
  reasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonItem: {
    color: '#cbd5e1',
    fontSize: 12,
  },
});

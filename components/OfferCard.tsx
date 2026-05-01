import { StyleSheet, Pressable } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { RankedOffer } from '@/lib/compare';

type Props = {
  offer: RankedOffer;
  isBest: boolean;
  useMembership: boolean;
};

export default function OfferCard({ offer, isBest, useMembership }: Props) {
  const { retailer, offer: productOffer, effectivePrice, savings } = offer;

  const memberPrice = productOffer.price * (1 - retailer.membershipDiscount);
  const showMemberPrice = useMembership && retailer.membershipDiscount > 0;

  return (
    <View
      style={[styles.card, isBest && styles.bestCard]}
      lightColor="#1e293b"
      darkColor="#1e293b"
    >
      {isBest && (
        <View style={styles.bestBadge} lightColor="#3b82f6" darkColor="#3b82f6">
          <Text style={styles.bestBadgeText}>Best Value</Text>
        </View>
      )}

      <View style={styles.header} lightColor="transparent" darkColor="transparent">
        <View style={styles.retailerInfo} lightColor="transparent" darkColor="transparent">
          <Text style={styles.logo}>{retailer.logo}</Text>
          <View lightColor="transparent" darkColor="transparent">
            <Text style={styles.retailerName}>{retailer.name}</Text>
            <Text style={styles.unit}>{productOffer.unit}</Text>
          </View>
        </View>
        <View style={styles.priceBlock} lightColor="transparent" darkColor="transparent">
          {productOffer.onSale && (
            <Text style={styles.saleTag}>SALE</Text>
          )}
          <Text style={styles.price}>${effectivePrice.toFixed(2)}</Text>
          {showMemberPrice && (
            <Text style={styles.memberNote}>
              {retailer.membershipName}: ${memberPrice.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.footer} lightColor="transparent" darkColor="transparent">
        <View style={styles.detailRow} lightColor="transparent" darkColor="transparent">
          <Text style={styles.detailLabel}>Delivery</Text>
          <Text style={styles.detailValue}>
            {retailer.deliveryFee === 0
              ? 'Free'
              : `$${retailer.deliveryFee.toFixed(2)}`}
          </Text>
        </View>
        <View style={styles.detailRow} lightColor="transparent" darkColor="transparent">
          <Text style={styles.detailLabel}>Pickup</Text>
          <Text style={styles.detailValue}>
            {retailer.pickupAvailable ? 'Available' : '—'}
          </Text>
        </View>

        {savings > 0 && (
          <View style={[styles.detailRow, styles.savingsRow]} lightColor="transparent" darkColor="transparent">
            <Text style={styles.detailLabel}>Savings</Text>
            <Text style={styles.savingsValue}>+${savings.toFixed(2)} vs best</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  bestCard: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  bestBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  bestBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  retailerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    fontSize: 32,
  },
  retailerName: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
  },
  unit: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  saleTag: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  price: {
    color: '#f1f5f9',
    fontSize: 22,
    fontWeight: '700',
  },
  memberNote: {
    color: '#64748b',
    fontSize: 11,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savingsRow: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  detailValue: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  savingsValue: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
});

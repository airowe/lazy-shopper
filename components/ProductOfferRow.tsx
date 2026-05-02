import { StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { useBasket } from '@/contexts/BasketContext';
import type { RankedOffer } from '@/lib/compare';

type Props = {
  offer: RankedOffer;
  rank: number;
  useMembership: boolean;
  productId: string;
  productName: string;
  productImage: string;
};

export default function ProductOfferRow({
  offer,
  rank,
  useMembership,
  productId,
  productName,
  productImage,
}: Props) {
  const { retailer, offer: productOffer, effectivePrice } = offer;
  const { addItem } = useBasket();

  const memberPrice = productOffer.price * (1 - retailer.membershipDiscount);
  const showMemberPrice = useMembership && retailer.membershipDiscount > 0;

  const handleAdd = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem({
      productId,
      name: `${productName} (${retailer.name})`,
      image: productImage,
    });
  };

  return (
    <View
      style={[styles.card, !productOffer.inStock && styles.outOfStockCard]}
      lightColor="#1e293b"
      darkColor="#1e293b"
    >
      {rank <= 3 && (
        <View style={styles.rankBadge} lightColor="#3b82f6" darkColor="#3b82f6">
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}

      <View style={styles.topRow} lightColor="transparent" darkColor="transparent">
        <View style={styles.retailerInfo} lightColor="transparent" darkColor="transparent">
          <Text style={styles.logo}>{retailer.logo}</Text>
          <View lightColor="transparent" darkColor="transparent">
            <Text style={styles.retailerName}>{retailer.name}</Text>
            <Text style={styles.unit}>{productOffer.unit}</Text>
          </View>
        </View>

        <View style={styles.priceBlock} lightColor="transparent" darkColor="transparent">
          {productOffer.onSale && (
            <View style={styles.saleBadge} lightColor="#166534" darkColor="#166534">
              <Text style={styles.saleBadgeText}>SALE</Text>
            </View>
          )}
          <Text style={styles.basePrice}>${productOffer.price.toFixed(2)}</Text>
          {showMemberPrice && (
            <Text style={styles.effectivePrice}>
              ${effectivePrice.toFixed(2)}
              <Text style={styles.memberLabel}> w/ membership</Text>
            </Text>
          )}
          <Text style={styles.unitPrice}>${productOffer.unitPrice.toFixed(2)}/{productOffer.unit}</Text>
        </View>
      </View>

      <View style={styles.divider} lightColor="#334155" darkColor="#334155" />

      <View style={styles.details} lightColor="transparent" darkColor="transparent">
        <View style={styles.detailRow} lightColor="transparent" darkColor="transparent">
          <View style={styles.detailItem} lightColor="transparent" darkColor="transparent">
            <FontAwesome name="truck" size={12} color="#94a3b8" />
            <Text style={styles.detailLabel}>Delivery</Text>
            <Text style={styles.detailValue}>
              {retailer.deliveryFee === 0
                ? 'Free'
                : `$${retailer.deliveryFee.toFixed(2)}`}
            </Text>
          </View>
          <Text style={styles.threshold}>
            free over ${retailer.freeDeliveryThreshold}
          </Text>
        </View>

        <View style={styles.detailRow} lightColor="transparent" darkColor="transparent">
          <View style={styles.detailItem} lightColor="transparent" darkColor="transparent">
            <FontAwesome name="shopping-bag" size={12} color="#94a3b8" />
            <Text style={styles.detailLabel}>Pickup</Text>
            <Text style={styles.detailValue}>
              {retailer.pickupAvailable ? 'Available' : '—'}
            </Text>
          </View>
          <View style={[styles.stockBadge, productOffer.inStock ? styles.inStock : styles.outOfStock]} lightColor="transparent" darkColor="transparent">
            <View
              style={[styles.stockDot, productOffer.inStock ? styles.stockDotGreen : styles.stockDotRed]}
              lightColor={productOffer.inStock ? '#22c55e' : '#ef4444'}
              darkColor={productOffer.inStock ? '#22c55e' : '#ef4444'}
            />
            <Text style={[styles.stockText, productOffer.inStock ? styles.stockGreen : styles.stockRed]}>
              {productOffer.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </View>

      {productOffer.inStock && (
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={handleAdd}
        >
          <FontAwesome name="shopping-cart" size={14} color="#fff" />
          <Text style={styles.addButtonText}>Add to Basket</Text>
        </Pressable>
      )}
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
  outOfStockCard: {
    opacity: 0.6,
  },
  rankBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomRightRadius: 10,
  },
  rankText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
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
  saleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  saleBadgeText: {
    color: '#22c55e',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  basePrice: {
    color: '#94a3b8',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  effectivePrice: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
  },
  memberLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '400',
  },
  unitPrice: {
    color: '#cbd5e1',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 10,
  },
  details: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  detailValue: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  threshold: {
    color: '#64748b',
    fontSize: 11,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockDotGreen: {
    backgroundColor: '#22c55e',
  },
  stockDotRed: {
    backgroundColor: '#ef4444',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stockGreen: {
    color: '#22c55e',
  },
  stockRed: {
    color: '#ef4444',
  },
  inStock: {},
  outOfStock: {},
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 11,
  },
  addButtonPressed: {
    backgroundColor: '#2563eb',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

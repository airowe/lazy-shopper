import { StyleSheet } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { StoreAllocation } from '@/lib/optimize';

type Props = {
  allocation: StoreAllocation;
};

export default function StoreCartCard({ allocation }: Props) {
  const {
    retailerLogo,
    retailerName,
    items,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    total,
    itemCount,
  } = allocation;

  const deliveryFree = deliveryFee === 0;
  const thresholdMet = subtotal >= freeDeliveryThreshold;

  return (
    <View style={styles.card} lightColor="#1e293b" darkColor="#1e293b">
      <View style={styles.header} lightColor="transparent" darkColor="transparent">
        <View style={styles.storeInfo} lightColor="transparent" darkColor="transparent">
          <Text style={styles.logo}>{retailerLogo}</Text>
          <View lightColor="transparent" darkColor="transparent">
            <Text style={styles.storeName}>{retailerName}</Text>
            <Text style={styles.itemCount}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>

      <View style={styles.itemList} lightColor="transparent" darkColor="transparent">
        {items.map((item) => (
          <View
            key={item.productId}
            style={styles.itemRow}
            lightColor="transparent"
            darkColor="transparent"
          >
            <View style={styles.itemInfo} lightColor="transparent" darkColor="transparent">
              <Text style={styles.itemEmoji}>{item.image}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {item.quantity > 1 ? (
                <>
                  <Text style={styles.itemMultiplier}>
                    {item.quantity} × ${item.effectivePrice.toFixed(2)}
                  </Text>
                  {'  '}
                </>
              ) : null}
              ${item.lineTotal.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} lightColor="#334155" darkColor="#334155" />

      <View style={styles.totalsSection} lightColor="transparent" darkColor="transparent">
        <View style={styles.totalRow} lightColor="transparent" darkColor="transparent">
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.totalRow} lightColor="transparent" darkColor="transparent">
          <Text style={styles.totalLabel}>Delivery</Text>
          <Text
            style={[styles.totalValue, deliveryFree && styles.freeText]}
          >
            {deliveryFree
              ? thresholdMet
                ? 'Free!'
                : 'Free (pickup)'
              : `$${deliveryFee.toFixed(2)}`}
          </Text>
        </View>

        <View
          style={[styles.totalRow, styles.grandTotal]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    fontSize: 32,
  },
  storeName: {
    color: '#f1f5f9',
    fontSize: 17,
    fontWeight: '600',
  },
  itemCount: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  itemList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  itemEmoji: {
    fontSize: 18,
  },
  itemName: {
    color: '#cbd5e1',
    fontSize: 13,
    flex: 1,
  },
  itemPrice: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '500',
  },
  itemMultiplier: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalsSection: {
    gap: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  totalValue: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  freeText: {
    color: '#22c55e',
  },
  grandTotal: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  grandTotalLabel: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
  },
  grandTotalValue: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '700',
  },
});

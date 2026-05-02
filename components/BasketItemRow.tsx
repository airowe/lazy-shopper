import { StyleSheet, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { findCheapestStore } from '@/lib/optimize';
import { getRetailer, RETAILERS } from '@/lib/data';
import type { BasketItem } from '@/contexts/BasketContext';

type Props = {
  item: BasketItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
};

const ALL_STORES = RETAILERS.map((r) => r.id);

export default function BasketItemRow({ item, onUpdateQuantity, onRemove }: Props) {
  const cheapest = findCheapestStore(item.productId, ALL_STORES, false);
  const cheapestStore = cheapest ? getRetailer(cheapest.retailerId) : null;

  return (
    <View style={styles.card} lightColor="#1e293b" darkColor="#1e293b">
      <View style={styles.topRow} lightColor="transparent" darkColor="transparent">
        <View style={styles.productInfo} lightColor="transparent" darkColor="transparent">
          <Text style={styles.emoji}>{item.image}</Text>
          <Text style={styles.name}>{item.name}</Text>
        </View>

        <View style={styles.stepper} lightColor="transparent" darkColor="transparent">
          <Pressable
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.stepButtonPressed,
            ]}
            onPress={() => onUpdateQuantity(item.quantity - 1)}
          >
            <FontAwesome name="minus" size={12} color="#f1f5f9" />
          </Pressable>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.stepButton,
              pressed && styles.stepButtonPressed,
            ]}
            onPress={() => onUpdateQuantity(item.quantity + 1)}
          >
            <FontAwesome name="plus" size={12} color="#f1f5f9" />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.removeButton,
            pressed && styles.removeButtonPressed,
          ]}
          onPress={onRemove}
        >
          <FontAwesome name="times" size={14} color="#ef4444" />
        </Pressable>
      </View>

      {cheapestStore && (
        <View style={styles.bottomRow} lightColor="transparent" darkColor="transparent">
          <Text style={styles.cheapestLabel}>
            Cheapest at {cheapestStore.logo} {cheapestStore.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 24,
  },
  name: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonPressed: {
    backgroundColor: '#475569',
  },
  quantity: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonPressed: {
    backgroundColor: '#451a1a',
  },
  bottomRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  cheapestLabel: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '500',
  },
});

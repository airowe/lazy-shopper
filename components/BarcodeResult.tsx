import { StyleSheet, Pressable, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { PRODUCTS, RETAILERS, type Product } from '@/lib/data';
import { useBasket } from '@/contexts/BasketContext';

type Props = {
  barcode: string;
};

const BARCODE_MAP: Record<string, string> = {
  '0123456789': 'milk-whole-gallon',
  '1234567890': 'eggs-large-12',
  '2345678901': 'bread-whole-wheat',
  '3456789012': 'chicken-breast-lb',
  '4567890123': 'rice-white-5lb',
  '5678901234': 'bananas-1lb',
  '6789012345': 'coffee-ground-12oz',
  '7890123456': 'cheese-cheddar-8oz',
  '8901234567': 'avocado-each',
};

function lookupProduct(barcode: string): Product | null {
  const productId = BARCODE_MAP[barcode];
  if (productId) {
    return PRODUCTS.find((p) => p.id === productId) ?? null;
  }
  const byId = PRODUCTS.find((p) => p.id.includes(barcode));
  if (byId) return byId;
  const byName = PRODUCTS.find((p) => p.name.toLowerCase().includes(barcode.toLowerCase()));
  return byName ?? null;
}

export default function BarcodeResult({ barcode }: Props) {
  const product = lookupProduct(barcode);
  const { addItem } = useBasket();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [barcode, fadeAnim, slideAnim]);

  const cheapest = product
    ? product.offers
        .filter((o) => o.inStock)
        .sort((a, b) => a.price - b.price)[0]
    : null;

  const cheapestRetailer = cheapest
    ? RETAILERS.find((r) => r.id === cheapest.retailerId)
    : null;

  const handleAdd = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
    });
  };

  return (
    <Animated.View
      style={[
        styles.root,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.barcodeLabel} lightColor="transparent" darkColor="transparent">
        <FontAwesome name="barcode" size={18} color="#94a3b8" />
        <Text style={styles.barcodeText}>Scanned: {barcode}</Text>
      </View>

      {product ? (
        <View style={styles.resultCard} lightColor="#1e293b" darkColor="#1e293b">
          <View style={styles.productHeader} lightColor="transparent" darkColor="transparent">
            <Text style={styles.productEmoji}>{product.image}</Text>
            <View style={styles.productInfo} lightColor="transparent" darkColor="transparent">
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
            </View>
            <FontAwesome name="check-circle" size={20} color="#22c55e" />
          </View>

          {cheapest && cheapestRetailer && (
            <View style={styles.priceSection} lightColor="transparent" darkColor="transparent">
              <View style={styles.priceRow} lightColor="transparent" darkColor="transparent">
                <Text style={styles.priceLabel}>Best price</Text>
                <Text style={styles.priceValue}>${cheapest.price.toFixed(2)}</Text>
              </View>
              <View style={styles.priceRow} lightColor="transparent" darkColor="transparent">
                <Text style={styles.priceLabel}>at {cheapestRetailer.name}</Text>
                <Text style={styles.unitText}>per {cheapest.unit}</Text>
              </View>
              {cheapest.onSale && (
                <View style={styles.saleBadge} lightColor="#22c55e" darkColor="#22c55e">
                  <Text style={styles.saleBadgeText}>ON SALE</Text>
                </View>
              )}
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={handleAdd}
          >
            <FontAwesome name="plus" size={14} color="#fff" />
            <Text style={styles.addButtonText}>Add to Basket</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.notFoundCard} lightColor="#1e293b" darkColor="#1e293b">
          <FontAwesome name="question-circle" size={32} color="#64748b" />
          <Text style={styles.notFoundTitle}>Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            This barcode doesn&apos;t match any product in our database.
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  barcodeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  barcodeText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'SpaceMono',
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 14,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productEmoji: {
    fontSize: 36,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
  },
  productCategory: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  priceValue: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
  },
  unitText: {
    color: '#64748b',
    fontSize: 12,
  },
  saleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  saleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
  },
  addButtonPressed: {
    backgroundColor: '#2563eb',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  notFoundCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    gap: 8,
  },
  notFoundTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
  },
  notFoundSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});

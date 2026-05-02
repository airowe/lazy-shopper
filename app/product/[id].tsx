import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { PRODUCTS } from '@/lib/data';
import { compareOffers, type ComparisonResult } from '@/lib/compare';
import { useBasket } from '@/contexts/BasketContext';
import BestPickBanner from '@/components/BestPickBanner';
import ProductOfferRow from '@/components/ProductOfferRow';
import UnitPriceSummary from '@/components/UnitPriceSummary';

type ScreenState = 'loading' | 'found' | 'not-found' | 'no-offers';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useBasket();

  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [useMembership, setUseMembership] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (!id) return;

    const timer = setTimeout(() => {
      const product = PRODUCTS.find((p) => p.id === id);

      if (!product) {
        setScreenState('not-found');
        return;
      }

      const comparison = compareOffers(product, useMembership);

      if (comparison.offers.length === 0) {
        setScreenState('no-offers');
        return;
      }

      setResult(comparison);
      setScreenState('found');
      animateIn();
    }, 400);

    return () => clearTimeout(timer);
  }, [id, useMembership, animateIn]);

  const handleAddToBasket = () => {
    if (!result) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem({
      productId: result.product.id,
      name: result.product.name,
      image: result.product.image,
    });
  };

  if (screenState === 'loading') {
    return (
      <View style={styles.centerContainer} lightColor="#0f172a" darkColor="#0f172a">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (screenState === 'not-found') {
    return (
      <View style={styles.centerContainer} lightColor="#0f172a" darkColor="#0f172a">
        <Text style={styles.stateEmoji}>🔍</Text>
        <Text style={styles.stateTitle}>Product Not Found</Text>
        <Text style={styles.stateSubtitle}>
          We couldn't find the product you're looking for.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <FontAwesome name="arrow-left" size={14} color="#fff" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (screenState === 'no-offers' || !result) {
    return (
      <View style={styles.centerContainer} lightColor="#0f172a" darkColor="#0f172a">
        <Text style={styles.stateEmoji}>📭</Text>
        <Text style={styles.stateTitle}>No Offers Available</Text>
        <Text style={styles.stateSubtitle}>
          There are currently no offers for this product.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <FontAwesome name="arrow-left" size={14} color="#fff" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const { product, offers, bestPick } = result;

  return (
    <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.header} lightColor="transparent" darkColor="transparent">
            <Pressable
              style={({ pressed }) => [
                styles.backNav,
                pressed && styles.backNavPressed,
              ]}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
            >
              <FontAwesome name="arrow-left" size={16} color="#94a3b8" />
            </Pressable>
            <Text style={styles.headerEmoji}>{product.image}</Text>
            <View style={styles.headerInfo} lightColor="transparent" darkColor="transparent">
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.categoryBadge} lightColor="#1e293b" darkColor="#1e293b">
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
            </View>
          </View>

          <View style={styles.content} lightColor="transparent" darkColor="transparent">
            <Pressable
              style={styles.membershipToggle}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setUseMembership((prev) => !prev);
              }}
            >
              <View
                style={[styles.checkbox, useMembership && styles.checkboxChecked]}
                lightColor={useMembership ? '#3b82f6' : '#334155'}
                darkColor={useMembership ? '#3b82f6' : '#334155'}
              >
                {useMembership && (
                  <FontAwesome name="check" size={10} color="#fff" />
                )}
              </View>
              <Text style={styles.membershipLabel}>Apply membership pricing</Text>
            </Pressable>

            {bestPick && (
              <BestPickBanner bestPick={bestPick} useMembership={useMembership} />
            )}

            <UnitPriceSummary offers={offers} />

            <Text style={styles.offersLabel}>
              All offers ({offers.length})
            </Text>

            {offers.map((offer) => (
              <ProductOfferRow
                key={`${product.id}-${offer.retailer.id}`}
                offer={offer}
                rank={offer.rank}
                useMembership={useMembership}
                productId={product.id}
                productName={product.name}
                productImage={product.image}
              />
            ))}
          </View>

          <View style={styles.spacer} lightColor="transparent" darkColor="transparent" />
        </Animated.View>
      </ScrollView>

      <View style={styles.fabContainer} lightColor="transparent" darkColor="transparent">
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
          onPress={handleAddToBasket}
        >
          <FontAwesome name="shopping-cart" size={18} color="#fff" />
          <Text style={styles.fabText}>Add to Basket</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 14,
  },
  stateEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  stateTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  stateSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonPressed: {
    backgroundColor: '#2563eb',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backNav: {
    paddingTop: 4,
    paddingRight: 8,
  },
  backNavPressed: {
    opacity: 0.6,
  },
  headerEmoji: {
    fontSize: 40,
  },
  headerInfo: {
    flex: 1,
  },
  productName: {
    color: '#f1f5f9',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 24,
  },
  membershipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#3b82f6',
  },
  membershipLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  offersLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  spacer: {
    height: 20,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: {
    backgroundColor: '#2563eb',
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

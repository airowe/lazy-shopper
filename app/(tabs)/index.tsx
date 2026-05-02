import { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { searchProducts, compareOffers, type ComparisonResult } from '@/lib/compare';
import { PRODUCTS } from '@/lib/data';
import OfferCard from '@/components/OfferCard';
import BestPickBanner from '@/components/BestPickBanner';
import { useWeeklyRun } from '@/contexts/WeeklyRunContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useMembership, setUseMembership] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const { suggestRun, startRun, dismissSuggestion, run } = useWeeklyRun();

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

  const handleSearch = useCallback(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Please enter a product name to compare prices.');
      setHasSearched(true);
      setResults([]);
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const products = searchProducts(trimmed);

      if (products.length === 0) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setError('No products found. Try searching for milk, eggs, bread, or chicken.');
        setResults([]);
        setHasSearched(true);
        setIsLoading(false);
        return;
      }

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const comparisons = products.map((p) => compareOffers(p, useMembership));
      setResults(comparisons);
      setHasSearched(true);
      setIsLoading(false);
      animateIn();
    }, 600);
  }, [query, useMembership, animateIn]);

  const handleSuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  }, []);

  const showResults = hasSearched && !error && results.length > 0;
  const showEmpty = hasSearched && !error && results.length === 0 && !isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero} lightColor="#0f172a" darkColor="#0f172a">
          <Text style={styles.heroEmoji}>🛍️</Text>
          <Text style={styles.heroTitle}>Lazy Shopper</Text>
          <Text style={styles.heroSubtitle}>
            Compare grocery prices across stores.{'\n'}Find the best deal in seconds.
          </Text>
        </View>

        {suggestRun && !run.isActive && (
          <View style={styles.runBanner} lightColor="#1e3a5f" darkColor="#1e3a5f">
            <View style={styles.runBannerContent} lightColor="transparent" darkColor="transparent">
              <Text style={styles.runBannerEmoji}>🛒</Text>
              <View style={styles.runBannerText} lightColor="transparent" darkColor="transparent">
                <Text style={styles.runBannerTitle}>Weekly Run Ready</Text>
                <Text style={styles.runBannerSubtitle}>Your recurring list is ready to go.</Text>
              </View>
            </View>
            <View style={styles.runBannerActions} lightColor="transparent" darkColor="transparent">
              <Pressable
                style={styles.runBannerStartBtn}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  startRun();
                  router.push('/run');
                }}
              >
                <Text style={styles.runBannerStartText}>Start Run</Text>
              </Pressable>
              <Pressable onPress={dismissSuggestion} style={styles.runBannerDismiss}>
                <Text style={styles.runBannerDismissText}>Later</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.searchSection} lightColor="#0f172a" darkColor="#0f172a">
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <FontAwesome
                name="search"
                size={16}
                color="#94a3b8"
                style={styles.searchIcon}
              />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Search a product..."
                placeholderTextColor="#64748b"
                value={query}
                onChangeText={(t) => {
                  setQuery(t);
                  if (error) setError(null);
                }}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {query.length > 0 && (
                <Pressable
                  onPress={() => {
                    setQuery('');
                    setError(null);
                    inputRef.current?.focus();
                  }}
                  style={styles.clearButton}
                >
                  <FontAwesome name="times-circle" size={16} color="#64748b" />
                </Pressable>
              )}
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.compareButton,
                pressed && styles.compareButtonPressed,
              ]}
              onPress={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.compareButtonText}>Compare</Text>
              )}
            </Pressable>
          </View>

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

          {error && (
            <Animated.View
              style={[
                styles.errorBanner,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}
        </View>

        {showResults && (
          <Animated.View
            style={[
              styles.resultsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.resultsCount}>
              {results.length} product{results.length > 1 ? 's' : ''} found
            </Text>

            {results.map((result) => (
              <View key={result.product.id} style={styles.productGroup} lightColor="transparent" darkColor="transparent">
                <View style={styles.productHeader} lightColor="transparent" darkColor="transparent">
                  <Text style={styles.productEmoji}>{result.product.image}</Text>
                  <View style={styles.productTitleBlock} lightColor="transparent" darkColor="transparent">
                    <Text style={styles.productName}>{result.product.name}</Text>
                    <Text style={styles.productCategory}>{result.product.category}</Text>
                  </View>
                </View>

                {result.bestPick && (
                  <BestPickBanner
                    bestPick={result.bestPick}
                    useMembership={useMembership}
                  />
                )}

                <Text style={styles.offersLabel}>
                  All offers ({result.offers.length})
                </Text>

                {result.offers.map((offer, idx) => (
                  <OfferCard
                    key={`${result.product.id}-${offer.retailer.id}`}
                    offer={offer}
                    isBest={idx === 0}
                    useMembership={useMembership}
                  />
                ))}
              </View>
            ))}
          </Animated.View>
        )}

        {showEmpty && (
          <Animated.View
            style={[
              styles.emptySection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No Results Yet</Text>
            <Text style={styles.emptySubtitle}>
              Search for common grocery items to compare prices.
            </Text>
          </Animated.View>
        )}

        {!hasSearched && (
          <View style={styles.suggestions} lightColor="#0f172a" darkColor="#0f172a">
            <Text style={styles.suggestionsTitle}>Try searching:</Text>
            <View style={styles.chipRow} lightColor="transparent" darkColor="transparent">
              {['Milk', 'Eggs', 'Bread', 'Chicken', 'Bananas', 'Coffee'].map((item) => (
                <Pressable
                  key={item}
                  style={styles.chip}
                  onPress={() => handleSuggestion(item)}
                >
                  <Text style={styles.chipText}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.spacer} lightColor="transparent" darkColor="transparent" />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 16,
    paddingVertical: 14,
  },
  clearButton: {
    padding: 4,
  },
  compareButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  compareButtonPressed: {
    backgroundColor: '#2563eb',
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  membershipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
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
  errorBanner: {
    backgroundColor: '#451a1a',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    lineHeight: 20,
  },
  resultsSection: {
    paddingHorizontal: 24,
  },
  resultsCount: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  productGroup: {
    marginBottom: 24,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  productEmoji: {
    fontSize: 32,
  },
  productTitleBlock: {
    flex: 1,
  },
  productName: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
  },
  productCategory: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  offersLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  emptySection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  suggestions: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  suggestionsTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },
  runBanner: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  runBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  runBannerEmoji: { fontSize: 32 },
  runBannerText: { flex: 1 },
  runBannerTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  runBannerSubtitle: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  runBannerActions: { flexDirection: 'row', gap: 10 },
  runBannerStartBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center',
  },
  runBannerStartText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  runBannerDismiss: { paddingVertical: 10, paddingHorizontal: 12 },
  runBannerDismissText: { color: '#64748b', fontSize: 13, fontWeight: '500' },
});

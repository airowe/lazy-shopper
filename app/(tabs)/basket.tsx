import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { useBasket } from '@/contexts/BasketContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import {
  optimizeBasket,
  type OptimizationResult,
  type BasketItem as LibBasketItem,
} from '@/lib/optimize';
import BasketItemRow from '@/components/BasketItemRow';
import SavingsSummaryCard from '@/components/SavingsSummaryCard';
import StoreCartCard from '@/components/StoreCartCard';

export default function BasketScreen() {
  const { items, updateQuantity, removeItem, clearBasket, itemCount } =
    useBasket();
  const { preferences } = usePreferences();
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const convertToLibItems = useCallback(
    (): LibBasketItem[] =>
      items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    [items]
  );

  const handleOptimize = useCallback(() => {
    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      const libItems = convertToLibItems();
      const stores =
        preferences.preferredStores.length > 0
          ? preferences.preferredStores
          : undefined;

      const res = optimizeBasket(libItems, {
        maxStores: preferences.maxStoresPerTrip,
        useMembership: preferences.useMembership,
        preferPickup: preferences.fulfillmentPreference === 'pickup',
        includedStores: stores,
      });

      setResult(res);
      setIsLoading(false);
    }, 800);
  }, [convertToLibItems, preferences]);

  const handleShare = useCallback(() => {
    if (!result) return;
    const lines = ['🛒 Basket Optimization\n'];

    for (const a of result.allocations) {
      lines.push(
        `${a.retailerLogo} ${a.retailerName} — $${a.total.toFixed(2)}`
      );
      for (const item of a.items) {
        lines.push(
          `  ${item.image} ${item.name} x${item.quantity} — $${item.lineTotal.toFixed(2)}`
        );
      }
      if (a.deliveryFee > 0) {
        lines.push(`  Delivery: $${a.deliveryFee.toFixed(2)}`);
      }
      lines.push('');
    }

    const saveLine =
      result.totalSavings > 0
        ? ` | Save $${result.totalSavings.toFixed(2)} (${result.totalSavingsPercent}%)`
        : '';

    lines.push(`Total: $${result.totalCost.toFixed(2)}${saveLine}`);
    Share.share({ message: lines.join('\n') });
  }, [result]);

  const handleClear = useCallback(() => {
    clearBasket();
    setResult(null);
  }, [clearBasket]);

  const isEmpty = items.length === 0 && !isLoading;
  const isBuilding = items.length > 0 && !isLoading && !result;
  const isOptimizing = isLoading;
  const showResults = result !== null && result.storesUsed > 1;
  const showNoSplit = result !== null && result.storesUsed <= 1;
  const showPostOptimize =
    result !== null && (showResults || showNoSplit);

  return (
    <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Empty state */}
        {isEmpty && (
          <View
            style={styles.emptySection}
            lightColor="transparent"
            darkColor="transparent"
          >
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>Your basket is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add items to your basket and we'll find{'\n'}the best way to
              split your shop.
            </Text>
            <Link href="/" asChild>
              <Pressable style={styles.searchButton}>
                <FontAwesome
                  name="search"
                  size={14}
                  color="#fff"
                  style={styles.searchButtonIcon}
                />
                <Text style={styles.searchButtonText}>Search products</Text>
              </Pressable>
            </Link>
          </View>
        )}

        {/* Building state */}
        {isBuilding && (
          <View
            style={styles.buildingSection}
            lightColor="transparent"
            darkColor="transparent"
          >
            <View style={styles.countRow} lightColor="transparent" darkColor="transparent">
              <Text style={styles.countText}>
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </Text>
            </View>

            {items.map((item) => (
              <BasketItemRow
                key={item.productId}
                item={item}
                onUpdateQuantity={(qty) =>
                  updateQuantity(item.productId, qty)
                }
                onRemove={() => removeItem(item.productId)}
              />
            ))}

            <Pressable
              style={({ pressed }) => [
                styles.optimizeButton,
                pressed && styles.optimizeButtonPressed,
              ]}
              onPress={handleOptimize}
            >
              <Text style={styles.optimizeButtonText}>Optimize</Text>
            </Pressable>
          </View>
        )}

        {/* Optimizing state */}
        {isOptimizing && (
          <View
            style={styles.loadingSection}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Finding best split...</Text>
          </View>
        )}

        {/* Results state */}
        {showResults && (
          <View
            style={styles.resultsSection}
            lightColor="transparent"
            darkColor="transparent"
          >
            <SavingsSummaryCard
              totalSavings={result.totalSavings}
              totalSavingsPercent={result.totalSavingsPercent}
              totalCost={result.totalCost}
              storesUsed={result.storesUsed}
              singleStoreBaseline={result.singleStoreBaseline}
            />

            {result.allocations.map((a) => (
              <StoreCartCard key={a.retailerId} allocation={a} />
            ))}

            {result.singleStoreBaseline > 0 && (
              <Text style={styles.comparison}>
                Single store would cost: $
                {result.singleStoreBaseline.toFixed(2)}
              </Text>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
              ]}
              onPress={() => setResult(null)}
            >
              <Text style={styles.editButtonText}>Edit basket</Text>
            </Pressable>
          </View>
        )}

        {/* No viable split state */}
        {showNoSplit && result && (
          <View
            style={styles.noSplitSection}
            lightColor="transparent"
            darkColor="transparent"
          >
            {result.storesUsed === 1 ? (
              <>
                <Text style={styles.noSplitEmoji}>
                  {result.allocations[0]?.retailerLogo}
                </Text>
                <Text style={styles.noSplitTitle}>
                  Best to buy everything at{' '}
                  {result.allocations[0]?.retailerName}
                </Text>
                <Text style={styles.noSplitSubtitle}>
                  Splitting across multiple stores{'\n'}won't save you money
                  on this basket.
                </Text>

                {result.allocations[0] && (
                  <StoreCartCard allocation={result.allocations[0]} />
                )}
              </>
            ) : (
              <>
                <Text style={styles.noSplitTitle}>
                  No stores can fulfill this basket
                </Text>
                <Text style={styles.noSplitSubtitle}>
                  Try adjusting your store preferences or removing out-of-stock
                  items.
                </Text>
              </>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
              ]}
              onPress={() => setResult(null)}
            >
              <Text style={styles.editButtonText}>Edit basket</Text>
            </Pressable>
          </View>
        )}

        <View
          style={styles.spacer}
          lightColor="transparent"
          darkColor="transparent"
        />
      </ScrollView>

      {/* Bottom action bar */}
      {(items.length > 0 || showPostOptimize) && (
        <View style={styles.actionBar} lightColor="#0f172a" darkColor="#0f172a">
          {result !== null && (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.shareActionButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handleShare}
            >
              <FontAwesome
                name="share-alt"
                size={14}
                color="#f1f5f9"
                style={styles.actionIcon}
              />
              <Text style={styles.actionButtonText}>Share</Text>
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.clearActionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleClear}
          >
            <FontAwesome
              name="trash"
              size={14}
              color="#ef4444"
              style={styles.actionIcon}
            />
            <Text style={[styles.actionButtonText, styles.clearText]}>
              Clear Basket
            </Text>
          </Pressable>
        </View>
      )}
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
    paddingBottom: 40,
  },
  emptySection: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchButtonIcon: {
    marginRight: 2,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buildingSection: {
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  countRow: {
    marginBottom: 14,
  },
  countText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  optimizeButton: {
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  optimizeButtonPressed: {
    backgroundColor: '#16a34a',
  },
  optimizeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  loadingSection: {
    paddingTop: 80,
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 15,
    marginTop: 16,
  },
  resultsSection: {
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  comparison: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  noSplitSection: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  noSplitEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  noSplitTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  noSplitSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  editButtonPressed: {
    backgroundColor: '#475569',
  },
  editButtonText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  shareActionButton: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  clearActionButton: {
    backgroundColor: '#1e293b',
    borderColor: '#451a1a',
  },
  actionIcon: {
    marginRight: 2,
  },
  actionButtonText: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
  },
  clearText: {
    color: '#ef4444',
  },
});

import { useState } from 'react';
import { StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { View, Text } from '@/components/Themed';
import { useWeeklyRun } from '@/contexts/WeeklyRunContext';
import { useBasket } from '@/contexts/BasketContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { optimizeBasket, type OptimizationResult } from '@/lib/optimize';
import SavingsSummaryCard from '@/components/SavingsSummaryCard';
import StoreCartCard from '@/components/StoreCartCard';

export default function RunScreen() {
  const router = useRouter();
  const { run, advanceStep, toggleItemChecked, completeRun, cancelRun } = useWeeklyRun();
  const { items, updateQuantity, removeItem, clearBasket } = useBasket();
  const { preferences } = usePreferences();
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleStartShop = async () => {
    setOptimizing(true);
    await new Promise((r) => setTimeout(r, 800));

    const basketItems = items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    const includedStores =
      preferences.preferredStores.length > 0 ? preferences.preferredStores : undefined;

    const optResult = optimizeBasket(basketItems, {
      maxStores: preferences.maxStoresPerTrip,
      useMembership: preferences.useMembership,
      preferPickup: preferences.fulfillmentPreference === 'pickup',
      includedStores,
    });

    setResult(optResult);
    setOptimizing(false);
    advanceStep('results');
  };

  const handleStartShopping = () => {
    advanceStep('shop');
  };

  const handleFinish = () => {
    completeRun();
    advanceStep('complete');
  };

  const handleCancel = () => {
    cancelRun();
    clearBasket();
    router.replace('/');
  };

  const checkedCount = run.itemsChecked.length;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const steps = [
    { key: 'review', label: 'Review', icon: 'list' as const },
    { key: 'optimize', label: 'Optimize', icon: 'calculator' as const },
    { key: 'results', label: 'Results', icon: 'bar-chart' as const },
    { key: 'shop', label: 'Shop', icon: 'check' as const },
    { key: 'complete', label: 'Done', icon: 'star' as const },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === run.currentStep);

  return (
    <View style={styles.root} darkColor="#0f172a" lightColor="#0f172a">
      {/* Progress bar */}
      <View style={styles.progressBar} darkColor="#1e293b" lightColor="#1e293b">
        {steps.map((step, i) => (
          <View key={step.key} style={styles.stepCol} darkColor="transparent" lightColor="transparent">
            <View
              style={[
                styles.stepDot,
                i <= currentStepIdx && styles.stepDotActive,
              ]}
              darkColor={i <= currentStepIdx ? '#3b82f6' : '#334155'}
              lightColor={i <= currentStepIdx ? '#3b82f6' : '#334155'}
            >
              {i < currentStepIdx && (
                <FontAwesome name="check" size={10} color="#fff" />
              )}
              {i === currentStepIdx && (
                <View style={styles.stepDotInner} darkColor="#fff" lightColor="#fff" />
              )}
            </View>
            <Text style={[styles.stepLabel, i <= currentStepIdx && styles.stepLabelActive]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Step content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {run.currentStep === 'review' && (
          <ReviewStep
            items={items}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            onOptimize={handleStartShop}
            onCancel={handleCancel}
          />
        )}

        {run.currentStep === 'optimize' && <OptimizeStep />}

        {run.currentStep === 'results' && result && (
          <ResultsStep
            result={result}
            onStartShopping={handleStartShopping}
            onCancel={handleCancel}
          />
        )}

        {run.currentStep === 'shop' && (
          <ShopStep
            items={items}
            checkedItems={run.itemsChecked}
            onToggle={toggleItemChecked}
            onFinish={handleFinish}
            checkedCount={checkedCount}
            totalItems={totalItems}
          />
        )}

        {run.currentStep === 'complete' && (
          <CompleteStep
            checkedCount={checkedCount}
            totalItems={totalItems}
            onDone={handleCancel}
          />
        )}
      </ScrollView>
    </View>
  );
}

function ReviewStep({
  items,
  onUpdateQuantity,
  onRemove,
  onOptimize,
  onCancel,
}: {
  items: { productId: string; name: string; image: string; quantity: number }[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onOptimize: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.stepContent} darkColor="transparent" lightColor="transparent">
      <Text style={styles.stepTitle}>🛒 Review Your List</Text>
      <Text style={styles.stepSubtitle}>
        {items.length === 0
          ? 'Add items to your basket first, then start your run.'
          : 'Check your items and adjust quantities before optimizing.'}
      </Text>

      {items.map((item) => (
        <View key={item.productId} style={styles.itemRow} darkColor="#1e293b" lightColor="#1e293b">
          <Text style={styles.itemEmoji}>{item.image}</Text>
          <View style={styles.itemInfo} darkColor="transparent" lightColor="transparent">
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.qtyRow} darkColor="transparent" lightColor="transparent">
              <Pressable
                style={styles.qtyBtn}
                onPress={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </View>
          <Pressable onPress={() => onRemove(item.productId)} style={styles.removeBtn}>
            <FontAwesome name="trash" size={16} color="#ef4444" />
          </Pressable>
        </View>
      ))}

      <Pressable
        style={[styles.primaryBtn, items.length === 0 && styles.primaryBtnDisabled]}
        onPress={onOptimize}
        disabled={items.length === 0}
      >
        <Text style={styles.primaryBtnText}>
          {items.length === 0 ? 'Add Items to Basket' : 'Optimize — Find Best Split'}
        </Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={onCancel}>
        <Text style={styles.secondaryBtnText}>Cancel Run</Text>
      </Pressable>
    </View>
  );
}

function OptimizeStep() {
  return (
    <View style={styles.stepContent} darkColor="transparent" lightColor="transparent">
      <Text style={styles.stepTitle}>⚡ Optimizing</Text>
      <Text style={styles.stepSubtitle}>Finding the best way to split your basket across stores...</Text>
      <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 32 }} />
    </View>
  );
}

function ResultsStep({
  result,
  onStartShopping,
  onCancel,
}: {
  result: OptimizationResult;
  onStartShopping: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.stepContent} darkColor="transparent" lightColor="transparent">
      <Text style={styles.stepTitle}>📊 Best Split</Text>
      <Text style={styles.stepSubtitle}>Here's the optimal way to shop across stores.</Text>

      <SavingsSummaryCard
        totalSavings={result.totalSavings}
        totalSavingsPercent={result.totalSavingsPercent}
        totalCost={result.totalCost}
        storesUsed={result.storesUsed}
        singleStoreBaseline={result.singleStoreBaseline}
      />

      {result.allocations.map((alloc) => (
        <StoreCartCard key={alloc.retailerId} allocation={alloc} />
      ))}

      <Pressable style={styles.primaryBtn} onPress={onStartShopping}>
        <Text style={styles.primaryBtnText}>Start Shopping</Text>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={onCancel}>
        <Text style={styles.secondaryBtnText}>Cancel Run</Text>
      </Pressable>
    </View>
  );
}

function ShopStep({
  items,
  checkedItems,
  onToggle,
  onFinish,
  checkedCount,
  totalItems,
}: {
  items: { productId: string; name: string; image: string; quantity: number }[];
  checkedItems: string[];
  onToggle: (id: string) => void;
  onFinish: () => void;
  checkedCount: number;
  totalItems: number;
}) {
  return (
    <View style={styles.stepContent} darkColor="transparent" lightColor="transparent">
      <Text style={styles.stepTitle}>✅ Shopping</Text>
      <Text style={styles.stepSubtitle}>
        Check off items as you buy them.
      </Text>

      <View style={styles.progressSummary} darkColor="#1e3a5f" lightColor="#1e3a5f">
        <Text style={styles.progressText}>
          {checkedCount} of {totalItems} items
        </Text>
        <View style={styles.progressTrack} darkColor="#334155" lightColor="#334155">
          <View
            style={[
              styles.progressFill,
              { width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` },
            ]}
            darkColor="#22c55e"
            lightColor="#22c55e"
          />
        </View>
      </View>

      {items.map((item) => {
        const checked = checkedItems.includes(item.productId);
        return (
          <Pressable
            key={item.productId}
            style={[styles.shopItemRow, checked && styles.shopItemRowChecked]}
            onPress={() => onToggle(item.productId)}
          >
            <View style={styles.shopItemLeft} darkColor="transparent" lightColor="transparent">
              <View
                style={[styles.checkCircle, checked && styles.checkCircleChecked]}
                darkColor={checked ? '#22c55e' : '#334155'}
                lightColor={checked ? '#22c55e' : '#334155'}
              >
                {checked && <FontAwesome name="check" size={12} color="#fff" />}
              </View>
              <Text style={styles.itemEmoji}>{item.image}</Text>
              <Text style={[styles.shopItemName, checked && styles.shopItemNameChecked]}>
                {item.name}
              </Text>
            </View>
            <Text style={[styles.shopItemQty, checked && styles.shopItemQtyChecked]}>
              ×{item.quantity}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        style={[styles.primaryBtn, checkedCount < totalItems && styles.primaryBtnDisabled]}
        onPress={onFinish}
        disabled={checkedCount < totalItems}
      >
        <Text style={styles.primaryBtnText}>
          {checkedCount < totalItems ? `${totalItems - checkedCount} items remaining` : 'Finish Run'}
        </Text>
      </Pressable>
    </View>
  );
}

function CompleteStep({
  checkedCount,
  totalItems,
  onDone,
}: {
  checkedCount: number;
  totalItems: number;
  onDone: () => void;
}) {
  return (
    <View style={styles.stepContent} darkColor="transparent" lightColor="transparent">
      <Text style={styles.completeEmoji}>🎉</Text>
      <Text style={styles.stepTitle}>Run Complete!</Text>
      <Text style={styles.stepSubtitle}>
        You checked off {checkedCount} of {totalItems} items.
      </Text>
      <Text style={styles.completeHint}>Prices have been saved to your history.</Text>

      <Pressable style={styles.primaryBtn} onPress={onDone}>
        <Text style={styles.primaryBtnText}>Back to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  stepCol: { alignItems: 'center', flex: 1, gap: 6 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {},
  stepDotInner: { width: 8, height: 8, borderRadius: 4 },
  stepLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  stepLabelActive: { color: '#3b82f6' },
  content: { flex: 1 },
  contentInner: { padding: 20, paddingBottom: 40 },
  stepContent: { gap: 12 },
  stepTitle: { color: '#f1f5f9', fontSize: 24, fontWeight: '700' },
  stepSubtitle: { color: '#94a3b8', fontSize: 14, lineHeight: 20 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  itemEmoji: { fontSize: 28 },
  itemInfo: { flex: 1 },
  itemName: { color: '#f1f5f9', fontSize: 14, fontWeight: '500' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: '#f1f5f9', fontSize: 16, fontWeight: '600' },
  qtyValue: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 8 },
  primaryBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnDisabled: { backgroundColor: '#1e3a5f', opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  // Shop step
  progressSummary: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  progressText: { color: '#f1f5f9', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  shopItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    backgroundColor: '#1e293b',
  },
  shopItemRowChecked: { opacity: 0.5 },
  shopItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleChecked: { borderColor: '#22c55e' },
  shopItemName: { color: '#f1f5f9', fontSize: 14, fontWeight: '500' },
  shopItemNameChecked: { textDecorationLine: 'line-through', color: '#64748b' },
  shopItemQty: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  shopItemQtyChecked: { color: '#64748b' },
  // Complete
  completeEmoji: { fontSize: 64, textAlign: 'center', marginTop: 40 },
  completeHint: { color: '#64748b', fontSize: 13, textAlign: 'center' },
});

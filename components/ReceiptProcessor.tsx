import { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Pressable, Animated, Easing } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { View, Text } from '@/components/Themed';
import { RETAILERS } from '@/lib/data';
import { useScan } from '@/contexts/ScanContext';

type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  confirmed: boolean | null;
};

const MOCK_ITEMS: ReceiptItem[] = [
  { id: '1', name: 'Whole Milk (Gallon)', price: 4.29, confirmed: null },
  { id: '2', name: 'Large Eggs (12 ct)', price: 5.49, confirmed: null },
  { id: '3', name: 'Whole Wheat Bread', price: 3.49, confirmed: null },
  { id: '4', name: 'Bananas (1 lb)', price: 0.69, confirmed: null },
  { id: '5', name: 'Ground Coffee (12 oz)', price: 7.49, confirmed: null },
];

export default function ReceiptProcessor() {
  const [stage, setStage] = useState<'idle' | 'processing' | 'results'>('idle');
  const [progress, setProgress] = useState(0);
  const [detectedStore, setDetectedStore] = useState<string | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [contributed, setContributed] = useState(false);
  const { incrementScanCount, scanCount, badges, isTopContributor, getContributionStats } =
    useScan();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  const stats = getContributionStats();

  const startProcessing = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStage('processing');
    setProgress(0);
    setDetectedStore(null);
    setItems([]);
    setContributed(false);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setDetectedStore(RETAILERS[Math.floor(Math.random() * RETAILERS.length)].name);
          setItems(MOCK_ITEMS.map((i) => ({ ...i })));
          setStage('results');
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 400);
      }
      setProgress(Math.min(p, 100));
    }, 200);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    if (isTopContributor && contributed) {
      badgeAnim.setValue(0);
      Animated.spring(badgeAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [isTopContributor, contributed, badgeAnim]);

  const handleConfirm = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, confirmed: true } : i)),
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeny = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, confirmed: false } : i)),
    );
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContribute = () => {
    const confirmedCount = items.filter((i) => i.confirmed === true).length;
    if (confirmedCount === 0) return;
    incrementScanCount(confirmedCount);
    setContributed(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root} lightColor="transparent" darkColor="transparent">
      {stage === 'idle' && (
        <Pressable
          style={({ pressed }) => [
            styles.captureButton,
            pressed && styles.captureButtonPressed,
          ]}
          onPress={startProcessing}
        >
          <FontAwesome name="camera" size={22} color="#fff" />
          <Text style={styles.captureButtonText}>Take photo of receipt</Text>
        </Pressable>
      )}

      {stage === 'processing' && (
        <View style={styles.processingCard} lightColor="#1e293b" darkColor="#1e293b">
          <Text style={styles.processingTitle}>Processing receipt...</Text>
          <View style={styles.progressBarBg} lightColor="#334155" darkColor="#334155">
            <Animated.View
              style={[styles.progressBarFill, { width: progressWidth }]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          <Text style={styles.processingHint}>Detecting store and items</Text>
        </View>
      )}

      {stage === 'results' && (
        <Animated.View style={{ opacity: 1 }}>
          <View style={styles.storeCard} lightColor="#1e293b" darkColor="#1e293b">
            <FontAwesome name="shopping-bag" size={18} color="#22c55e" />
            <View lightColor="transparent" darkColor="transparent">
              <Text style={styles.storeLabel}>Store detected</Text>
              <Text style={styles.storeName}>{detectedStore}</Text>
            </View>
          </View>

          <Text style={styles.itemsLabel}>Items extracted ({items.length})</Text>

          {items.map((item) => (
            <View key={item.id} style={styles.itemCard} lightColor="#1e293b" darkColor="#1e293b">
              <View style={styles.itemInfo} lightColor="transparent" darkColor="transparent">
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.itemActions} lightColor="transparent" darkColor="transparent">
                <Pressable
                  style={[
                    styles.confirmBtn,
                    item.confirmed === true && styles.confirmBtnActive,
                  ]}
                  onPress={() => handleConfirm(item.id)}
                >
                  <FontAwesome
                    name="check"
                    size={14}
                    color={item.confirmed === true ? '#fff' : '#22c55e'}
                  />
                  <Text
                    style={[
                      styles.confirmBtnText,
                      item.confirmed === true && styles.confirmBtnTextActive,
                    ]}
                  >
                    Correct
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.denyBtn,
                    item.confirmed === false && styles.denyBtnActive,
                  ]}
                  onPress={() => handleDeny(item.id)}
                >
                  <FontAwesome
                    name="times"
                    size={14}
                    color={item.confirmed === false ? '#fff' : '#ef4444'}
                  />
                  <Text
                    style={[
                      styles.denyBtnText,
                      item.confirmed === false && styles.denyBtnTextActive,
                    ]}
                  >
                    Incorrect
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}

          {!contributed && (
            <Pressable
              style={({ pressed }) => [
                styles.contributeButton,
                pressed && styles.contributeButtonPressed,
              ]}
              onPress={handleContribute}
            >
              <FontAwesome name="upload" size={16} color="#fff" />
              <Text style={styles.contributeButtonText}>
                Contribute to price database
              </Text>
            </Pressable>
          )}

          {contributed && (
            <View style={styles.statsCard} lightColor="#1e293b" darkColor="#1e293b">
              <Text style={styles.statsTitle}>Contribution Stats</Text>
              <View style={styles.statRow} lightColor="transparent" darkColor="transparent">
                <Text style={styles.statLabel}>Prices contributed</Text>
                <Text style={styles.statValue}>{scanCount}</Text>
              </View>
              <View style={styles.statRow} lightColor="transparent" darkColor="transparent">
                <Text style={styles.statLabel}>Percentile</Text>
                <Text style={styles.statValue}>{stats.percentile}%</Text>
              </View>

              {badges.length > 0 && (
                <View style={styles.badgesContainer} lightColor="transparent" darkColor="transparent">
                  {badges.map((badge) => (
                    <View key={badge} style={styles.badge} lightColor="#3b82f6" darkColor="#3b82f6">
                      <FontAwesome name="trophy" size={12} color="#fff" />
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  ))}
                </View>
              )}

              {isTopContributor && contributed && (
                <Animated.View
                  style={[
                    styles.topBanner,
                    {
                      backgroundColor: '#22c55e',
                      transform: [
                        {
                          scale: badgeAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0.5, 1.1, 1],
                          }),
                        },
                      ],
                      opacity: badgeAnim,
                    },
                  ]}
                >
                  <Text style={styles.topBannerEmoji}>🏆</Text>
                  <Text style={styles.topBannerText}>Top 5% of shoppers!</Text>
                </Animated.View>
              )}
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 16,
  },
  captureButtonPressed: {
    backgroundColor: '#2563eb',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processingCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    gap: 12,
  },
  processingTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  processingHint: {
    color: '#64748b',
    fontSize: 12,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
    marginBottom: 4,
  },
  storeLabel: {
    color: '#94a3b8',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  storeName: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  itemsLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  itemCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
    gap: 10,
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  itemPrice: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  confirmBtnActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  confirmBtnText: {
    color: '#22c55e',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtnTextActive: {
    color: '#fff',
  },
  denyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  denyBtnActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  denyBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  denyBtnTextActive: {
    color: '#fff',
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#22c55e',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  contributeButtonPressed: {
    backgroundColor: '#16a34a',
  },
  contributeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 4,
    gap: 8,
  },
  statsTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  statValue: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  topBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  topBannerEmoji: {
    fontSize: 24,
  },
  topBannerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

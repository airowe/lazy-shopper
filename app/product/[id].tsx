import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { OfferCard } from '@/components/OfferCard';
import { radius, theme } from '@/constants/theme';
import { STORES, getProductWithOffers } from '@/lib/catalog';
import { getAlert, removeAlert, setAlert } from '@/lib/alerts/storage';
import { rankOffers } from '@/lib/ranking/rankOffers';
import {
  addToWishlist,
  isSaved,
  removeFromWishlist,
} from '@/lib/wishlist/storage';

function specLine(p: {
  pieceCount?: number;
  ageRange?: { min: number; max?: number };
  brand?: string;
}): string {
  const parts: string[] = [];
  if (p.brand) parts.push(p.brand);
  if (p.pieceCount) parts.push(`${p.pieceCount} pieces`);
  if (p.ageRange) {
    parts.push(
      p.ageRange.max
        ? `Ages ${p.ageRange.min}–${p.ageRange.max}`
        : `Ages ${p.ageRange.min}+`
    );
  }
  return parts.join(' · ');
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = getProductWithOffers(id);
  const [saved, setSaved] = useState(false);
  const [alertSet, setAlertSet] = useState(false);

  useEffect(() => {
    if (!id) return;
    isSaved(id).then(setSaved);
    getAlert(id).then((a) => setAlertSet(!!a));
  }, [id]);

  const ranked = data
    ? rankOffers(data.product, data.offers, STORES, new Date())
    : [];
  const best = ranked.find((r) => r.offer.inStock);

  const onToggleSave = useCallback(async () => {
    if (!data) return;
    if (saved) {
      await removeFromWishlist(data.product.id);
      setSaved(false);
    } else {
      const price = best?.effectivePrice ?? ranked[0]?.effectivePrice ?? 0;
      const result = await addToWishlist(data.product.id, price);
      if (result === 'full') {
        Alert.alert('Wishlist is full', 'Remove something to save more.');
        return;
      }
      setSaved(true);
    }
    Haptics.selectionAsync();
  }, [data, saved, best, ranked]);

  const onSetAlert = useCallback(() => {
    if (!data) return;
    if (alertSet) {
      Alert.alert('Price alert', 'You already have an alert on this.', [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Remove alert',
          style: 'destructive',
          onPress: async () => {
            await removeAlert(data.product.id);
            setAlertSet(false);
          },
        },
      ]);
      return;
    }
    const current = best?.effectivePrice ?? 0;
    const suggested = Math.max(1, Math.round(current - 5));
    Alert.prompt(
      'Alert me',
      `Tell me when it drops below this price.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set alert',
          onPress: async (value?: string) => {
            const target = Number(value);
            if (!value || Number.isNaN(target) || target <= 0) return;
            await setAlert(data.product.id, target);
            setAlertSet(true);
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
          },
        },
      ],
      'plain-text',
      String(suggested)
    );
  }, [data, alertSet, best]);

  const onShare = useCallback(async () => {
    if (!data || !best) return;
    const message =
      `I want this from Lazy Shopper:\n` +
      `${data.product.name}\n` +
      `Best price: $${best.effectivePrice.toFixed(2)} at ${best.store.name}\n` +
      `${best.offer.url}`;
    await Share.share({ message });
  }, [data, best]);

  if (!data) {
    return (
      <View style={styles.centered}>
        <Stack.Screen
          options={{ title: 'Not found', ...headerOptions }}
        />
        <Text style={styles.notFound}>We can&apos;t find this anymore.</Text>
      </View>
    );
  }

  const { product } = data;
  const others = ranked.filter((r) => r !== best);
  const freshest = ranked.reduce<string | undefined>((acc, r) => {
    if (!acc || r.offer.capturedAt > acc) return r.offer.capturedAt;
    return acc;
  }, undefined);
  const anyStale = ranked.some((r) => r.stale);
  const updatedDays = freshest
    ? Math.floor(
        (Date.now() - new Date(freshest).getTime()) / (24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: product.name, ...headerOptions }} />

      <View style={styles.hero}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.spec}>{specLine(product)}</Text>
      </View>

      {best ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best pick</Text>
          <OfferCard ranked={best} onPress={() => {}} />
          <Pressable
            testID="open-best"
            onPress={() => WebBrowser.openBrowserAsync(best.offer.url)}
            style={({ pressed }) => [
              styles.openButton,
              pressed && styles.openButtonPressed,
            ]}
          >
            <Text style={styles.openButtonText}>
              Open on {best.store.name} →
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text testID="no-stock" style={styles.noStock}>
          Nobody has this in stock right now.
        </Text>
      )}

      {others.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All stores</Text>
          {others.map((r) => (
            <OfferCard
              key={r.offer.storeId}
              testID={`offer-${r.offer.storeId}`}
              ranked={r}
              onPress={() => {
                if (r.offer.inStock) WebBrowser.openBrowserAsync(r.offer.url);
              }}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          testID="save-button"
          onPress={onToggleSave}
          style={({ pressed }) => [
            styles.actionHalf,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionText}>
            {saved ? '♥ Saved' : '♡ Save'}
          </Text>
        </Pressable>
        <Pressable
          testID="alert-button"
          onPress={onSetAlert}
          style={({ pressed }) => [
            styles.actionHalf,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionText}>
            {alertSet ? '🔔 Alert on' : '🔔 Alert me'}
          </Text>
        </Pressable>
      </View>
      <Pressable
        testID="share-button"
        onPress={onShare}
        disabled={!best}
        style={({ pressed }) => [
          styles.shareButton,
          !best && styles.pressed,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.shareText}>Send to a grown-up</Text>
      </Pressable>

      {updatedDays !== null ? (
        <Text style={[styles.footer, anyStale && styles.footerStale]}>
          Prices updated{' '}
          {updatedDays === 0
            ? 'today'
            : `${updatedDays} day${updatedDays === 1 ? '' : 's'} ago`}
          {anyStale ? ' · check before buying' : ''}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const headerOptions = {
  headerStyle: { backgroundColor: theme.bg },
  headerTintColor: theme.text,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 20, gap: 18 },
  centered: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFound: { color: theme.text, fontSize: 16 },
  hero: { gap: 6 },
  name: { color: theme.text, fontSize: 22, fontWeight: '800' },
  spec: { color: theme.textDim, fontSize: 14 },
  section: { gap: 10 },
  sectionTitle: {
    color: theme.textDim,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  openButton: {
    backgroundColor: theme.grass,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  openButtonPressed: { backgroundColor: theme.grassDark },
  openButtonText: { color: '#0F0F12', fontSize: 16, fontWeight: '800' },
  noStock: { color: theme.gold, fontSize: 15 },
  actions: { flexDirection: 'row', gap: 12 },
  actionHalf: {
    flex: 1,
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: { color: theme.text, fontSize: 15, fontWeight: '700' },
  shareButton: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareText: { color: theme.text, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.6 },
  footer: { color: theme.textDim, fontSize: 12, textAlign: 'center' },
  footerStale: { color: theme.gold },
});

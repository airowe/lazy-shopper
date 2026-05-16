import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfferCard } from '@/components/OfferCard';
import { radius, theme } from '@/constants/theme';
import { STORES, search } from '@/lib/catalog';
import type { Product } from '@/lib/catalog';
import { getOffersFor } from '@/lib/catalog';
import { rankOffers } from '@/lib/ranking/rankOffers';

const EXAMPLES = ['creeper plush', 'ender dragon', 'beyblade'];

type Result =
  | { kind: 'idle' }
  | { kind: 'empty' }
  | { kind: 'no-match' }
  | { kind: 'found'; product: Product };

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result>({ kind: 'idle' });

  const onSubmit = () => {
    const q = query.trim();
    if (!q) {
      setResult({ kind: 'empty' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    const matches = search(q);
    if (matches.length === 0) {
      setResult({ kind: 'no-match' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setResult({ kind: 'found', product: matches[0] });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const ranked =
    result.kind === 'found'
      ? rankOffers(
          result.product,
          getOffersFor(result.product.id),
          STORES,
          new Date()
        )
      : [];
  const bestPick = ranked.find((r) => r.offer.inStock);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.wordmark}>Lazy Shopper</Text>
          <Text style={styles.tagline}>What do you want?</Text>

          <View style={styles.inputRow}>
            <TextInput
              testID="search-input"
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="creeper plush"
              placeholderTextColor={theme.textDim}
              returnKeyType="search"
              onSubmitEditing={onSubmit}
              autoCorrect={false}
            />
            {query.length > 0 ? (
              <Pressable
                testID="clear-button"
                onPress={() => setQuery('')}
                hitSlop={8}
                style={styles.clear}
              >
                <Text style={styles.clearText}>✕</Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            testID="find-button"
            onPress={onSubmit}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          >
            <Text style={styles.ctaText}>Find it →</Text>
          </Pressable>

          {result.kind === 'empty' ? (
            <Text testID="empty-hint" style={styles.hint}>
              Type something first.
            </Text>
          ) : null}

          {result.kind === 'no-match' ? (
            <View testID="no-match" style={styles.noMatch}>
              <Text style={styles.noMatchText}>
                Couldn&apos;t find that. Try:
              </Text>
              <View style={styles.exampleRow}>
                {EXAMPLES.map((ex) => (
                  <Pressable
                    key={ex}
                    onPress={() => {
                      setQuery(ex);
                      const matches = search(ex);
                      if (matches[0]) {
                        setResult({ kind: 'found', product: matches[0] });
                      }
                    }}
                    style={styles.examplePill}
                  >
                    <Text style={styles.examplePillText}>{ex}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          {result.kind === 'found' ? (
            <View style={styles.results}>
              <Text style={styles.productName}>{result.product.name}</Text>
              {bestPick ? (
                <Text testID="insight-bar" style={styles.insight}>
                  Best pick: {bestPick.store.name} $
                  {bestPick.offer.price.toFixed(2)}
                </Text>
              ) : (
                <Text style={styles.insight}>
                  Nobody has this in stock right now.
                </Text>
              )}
              {ranked.map((r) => (
                <OfferCard
                  key={r.offer.storeId}
                  testID={`offer-${r.offer.storeId}`}
                  ranked={r}
                  onPress={() =>
                    router.push(`/product/${result.product.id}`)
                  }
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  flex: { flex: 1 },
  content: { padding: 20, gap: 14 },
  wordmark: {
    color: theme.grass,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: { color: theme.text, fontSize: 22, fontWeight: '700', marginTop: 4 },
  inputRow: { justifyContent: 'center' },
  input: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: theme.text,
    fontSize: 17,
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingRight: 40,
  },
  clear: { position: 'absolute', right: 12, padding: 4 },
  clearText: { color: theme.textDim, fontSize: 16 },
  cta: {
    backgroundColor: theme.grass,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaPressed: { backgroundColor: theme.grassDark },
  ctaText: { color: '#0F0F12', fontSize: 17, fontWeight: '800' },
  hint: { color: theme.gold, fontSize: 14 },
  noMatch: { gap: 10 },
  noMatchText: { color: theme.textDim, fontSize: 15 },
  exampleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  examplePill: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  examplePillText: { color: theme.text, fontSize: 14 },
  results: { gap: 12, marginTop: 6 },
  productName: { color: theme.text, fontSize: 17, fontWeight: '600' },
  insight: { color: theme.grass, fontSize: 15, fontWeight: '700' },
});

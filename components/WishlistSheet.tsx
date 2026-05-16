import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { radius, theme } from '@/constants/theme';
import { getAlert } from '@/lib/alerts/storage';
import { bestInStockPrice } from '@/lib/alerts/check';
import { getProduct } from '@/lib/catalog';
import {
  getWishlist,
  removeFromWishlist,
  type WishlistEntry,
} from '@/lib/wishlist/storage';

type Row = {
  entry: WishlistEntry;
  name: string;
  best?: { price: number; storeName: string };
  hasAlert: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function WishlistSheet({ visible, onClose }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const entries = await getWishlist();
    const now = new Date();
    const built = await Promise.all(
      entries.map(async (entry): Promise<Row> => {
        const product = getProduct(entry.productId);
        const alert = await getAlert(entry.productId);
        return {
          entry,
          name: product?.name ?? 'Unknown',
          best: bestInStockPrice(entry.productId, now),
          hasAlert: !!alert,
        };
      })
    );
    setRows(built);
  };

  useEffect(() => {
    if (visible) load();
  }, [visible]);

  const onRemove = async (productId: string) => {
    await removeFromWishlist(productId);
    load();
  };

  const openProduct = (productId: string) => {
    onClose();
    router.push(`/product/${productId}`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>My Wishlist</Text>
          <Pressable testID="wishlist-close" onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        {rows.length === 0 ? (
          <Text testID="wishlist-empty" style={styles.empty}>
            Nothing saved yet. Find something you want and tap ♥.
          </Text>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {rows.map((row) => {
              const drop =
                row.best && row.best.price < row.entry.priceWhenSaved
                  ? row.entry.priceWhenSaved - row.best.price
                  : 0;
              return (
                <Pressable
                  key={row.entry.productId}
                  testID={`wishlist-row-${row.entry.productId}`}
                  onPress={() => openProduct(row.entry.productId)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={styles.rowBody}>
                    <Text style={styles.rowName} numberOfLines={2}>
                      {row.name}
                    </Text>
                    <Text style={styles.rowMeta}>
                      {row.best
                        ? `Best: $${row.best.price.toFixed(2)} ${
                            row.best.storeName
                          }`
                        : 'Currently unavailable'}
                      {row.hasAlert ? '  🔔' : ''}
                    </Text>
                    {drop > 0 ? (
                      <Text style={styles.drop}>
                        ↓ ${drop.toFixed(2)} cheaper than when you saved it
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    testID={`wishlist-remove-${row.entry.productId}`}
                    onPress={() => onRemove(row.entry.productId)}
                    hitSlop={8}
                    style={styles.remove}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: '45%',
    maxHeight: '80%',
    backgroundColor: theme.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { color: theme.text, fontSize: 20, fontWeight: '800' },
  close: { color: theme.textDim, fontSize: 18 },
  empty: {
    color: theme.textDim,
    fontSize: 15,
    paddingVertical: 32,
    textAlign: 'center',
  },
  list: { gap: 10, paddingBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.surfaceAlt,
    borderRadius: radius.md,
    padding: 14,
  },
  rowPressed: { opacity: 0.7 },
  rowBody: { flex: 1, gap: 3 },
  rowName: { color: theme.text, fontSize: 15, fontWeight: '600' },
  rowMeta: { color: theme.textDim, fontSize: 13 },
  drop: { color: theme.grass, fontSize: 13, fontWeight: '600' },
  remove: { padding: 4 },
  removeText: { color: theme.textDim, fontSize: 16 },
});

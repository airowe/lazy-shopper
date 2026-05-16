import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import { getProduct } from '@/lib/catalog';

// Minimal stub — full product detail per PRD-02 lands in task #5.
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: product?.name ?? 'Product',
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.text,
        }}
      />
      <Text style={styles.text}>
        {product ? product.name : 'Product not found'}
      </Text>
      <Text style={styles.dim}>Product detail screen coming next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  text: { color: theme.text, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  dim: { color: theme.textDim, fontSize: 14 },
});

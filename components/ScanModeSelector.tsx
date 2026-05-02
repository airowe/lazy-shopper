import { StyleSheet, Pressable } from 'react-native';
import { View, Text } from '@/components/Themed';

export type ScanMode = 'barcode' | 'receipt';

type Props = {
  mode: ScanMode;
  onSelect: (mode: ScanMode) => void;
};

export default function ScanModeSelector({ mode, onSelect }: Props) {
  return (
    <View style={styles.container} lightColor="#1e293b" darkColor="#1e293b">
      <Pressable
        style={[styles.tab, mode === 'barcode' && styles.tabActive]}
        onPress={() => onSelect('barcode')}
      >
        <Text style={[styles.tabText, mode === 'barcode' && styles.tabTextActive]}>
          Barcode
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, mode === 'receipt' && styles.tabActive]}
        onPress={() => onSelect('receipt')}
      >
        <Text style={[styles.tabText, mode === 'receipt' && styles.tabTextActive]}>
          Receipt
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
});

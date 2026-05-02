import { useState } from 'react';
import { StyleSheet, Modal, Pressable, TextInput, FlatList } from 'react-native';
import { View, Text } from '@/components/Themed';
import { PRODUCTS, RETAILERS } from '@/lib/data';
import type { PriceAlert } from '@/contexts/AlertsContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'lastTriggeredAt' | 'isActive'>) => void;
};

export default function CreateAlertModal({ visible, onClose, onCreate }: Props) {
  const [query, setQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [selectedRetailerId, setSelectedRetailerId] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'price_drop' | 'restock'>('price_drop');
  const [showResults, setShowResults] = useState(false);

  const filtered = query.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const selectedProduct = PRODUCTS.find((p) => p.id === selectedProductId);

  const canCreate =
    selectedProductId &&
    (alertType === 'restock' || (targetPrice.trim() !== '' && !isNaN(parseFloat(targetPrice))));

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setQuery(PRODUCTS.find((p) => p.id === productId)?.name ?? '');
    setShowResults(false);
  };

  const handleCreate = () => {
    if (!selectedProduct) return;
    onCreate({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: selectedProduct.image,
      retailerId: selectedRetailerId,
      targetPrice: alertType === 'restock' ? 0 : parseFloat(targetPrice) || 0,
      type: alertType,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setQuery('');
    setSelectedProductId(null);
    setTargetPrice('');
    setSelectedRetailerId(null);
    setAlertType('price_drop');
    setShowResults(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay} lightColor="transparent" darkColor="transparent">
        <View style={styles.sheet} lightColor="#1e293b" darkColor="#1e293b">
          <View style={styles.headerRow} lightColor="transparent" darkColor="transparent">
            <Text style={styles.modalTitle}>Create Alert</Text>
            <Pressable onPress={handleClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>

          {/* Product search */}
          <Text style={styles.label}>Product</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setSelectedProductId(null);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search products..."
            placeholderTextColor="#64748b"
          />
          {showResults && filtered.length > 0 && !selectedProductId && (
            <View style={styles.results} lightColor="#0f172a" darkColor="#0f172a">
              <FlatList
                data={filtered.slice(0, 6)}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.resultItem,
                      pressed && styles.resultItemPressed,
                    ]}
                    onPress={() => handleSelectProduct(item.id)}
                  >
                    <Text style={styles.resultEmoji}>{item.image}</Text>
                    <View style={styles.resultText} lightColor="transparent" darkColor="transparent">
                      <Text style={styles.resultName}>{item.name}</Text>
                      <Text style={styles.resultCategory}>{item.category}</Text>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}
          {selectedProduct && (
            <View style={styles.selectedChip} lightColor="#0f172a" darkColor="#0f172a">
              <Text style={styles.selectedText}>
                {selectedProduct.image} {selectedProduct.name}
              </Text>
            </View>
          )}

          {/* Alert type */}
          <Text style={styles.label}>Alert Type</Text>
          <View style={styles.segmentedRow} lightColor="transparent" darkColor="transparent">
            <Pressable
              style={[
                styles.segment,
                alertType === 'price_drop' && styles.segmentActive,
              ]}
              onPress={() => setAlertType('price_drop')}
            >
              <Text
                style={[
                  styles.segmentText,
                  alertType === 'price_drop' && styles.segmentTextActive,
                ]}
              >
                Price Drop
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.segment,
                alertType === 'restock' && styles.segmentActive,
              ]}
              onPress={() => setAlertType('restock')}
            >
              <Text
                style={[
                  styles.segmentText,
                  alertType === 'restock' && styles.segmentTextActive,
                ]}
              >
                Restock
              </Text>
            </Pressable>
          </View>

          {/* Target price (only for price_drop) */}
          {alertType === 'price_drop' && (
            <>
              <Text style={styles.label}>Target Price ($)</Text>
              <TextInput
                style={styles.input}
                value={targetPrice}
                onChangeText={setTargetPrice}
                placeholder="0.00"
                placeholderTextColor="#64748b"
                keyboardType="decimal-pad"
              />
            </>
          )}

          {/* Store selector */}
          <Text style={styles.label}>Store</Text>
          <View style={styles.storeGrid} lightColor="transparent" darkColor="transparent">
            <Pressable
              style={[
                styles.storeChip,
                selectedRetailerId === null && styles.storeChipActive,
              ]}
              onPress={() => setSelectedRetailerId(null)}
            >
              <Text
                style={[
                  styles.storeChipText,
                  selectedRetailerId === null && styles.storeChipTextActive,
                ]}
              >
                Any Store
              </Text>
            </Pressable>
            {RETAILERS.map((r) => (
              <Pressable
                key={r.id}
                style={[
                  styles.storeChip,
                  selectedRetailerId === r.id && styles.storeChipActive,
                ]}
                onPress={() => setSelectedRetailerId(r.id)}
              >
                <Text style={styles.storeChipText}>
                  {r.logo} {r.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Create button */}
          <Pressable
            style={({ pressed }) => [
              styles.createBtn,
              !canCreate && styles.createBtnDisabled,
              pressed && canCreate && styles.createBtnPressed,
            ]}
            onPress={handleCreate}
            disabled={!canCreate}
          >
            <Text style={[styles.createBtnText, !canCreate && styles.createBtnTextDisabled]}>
              Create Alert
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    color: '#94a3b8',
    fontSize: 18,
    padding: 4,
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  results: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 4,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  resultItemPressed: {
    backgroundColor: '#1e293b',
  },
  resultEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '500',
  },
  resultCategory: {
    color: '#64748b',
    fontSize: 12,
  },
  selectedChip: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  selectedText: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '500',
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#1e3a5f',
  },
  segmentText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#93c5fd',
  },
  storeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  storeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
  },
  storeChipActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a5f',
  },
  storeChipText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  storeChipTextActive: {
    color: '#93c5fd',
  },
  createBtn: {
    marginTop: 24,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createBtnPressed: {
    backgroundColor: '#2563eb',
  },
  createBtnDisabled: {
    backgroundColor: '#334155',
  },
  createBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  createBtnTextDisabled: {
    color: '#64748b',
  },
});

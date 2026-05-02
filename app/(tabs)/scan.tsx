import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import ScanModeSelector, { type ScanMode } from '@/components/ScanModeSelector';
import BarcodeResult from '@/components/BarcodeResult';
import ReceiptProcessor from '@/components/ReceiptProcessor';

const MOCK_BARCODES = [
  '0123456789',
  '1234567890',
  '2345678901',
  '3456789012',
  '4567890123',
  '5678901234',
  '6789012345',
  '7890123456',
  '8901234567',
];

export default function ScanScreen() {
  const [mode, setMode] = useState<ScanMode>('barcode');
  const [barcodeText, setBarcodeText] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);

  const handleScan = useCallback(() => {
    const trimmed = barcodeText.trim();
    if (!trimmed) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScannedBarcode(trimmed);
  }, [barcodeText]);

  const handleMockBarcode = useCallback((code: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBarcodeText(code);
    setScannedBarcode(code);
  }, []);

  return (
    <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero} lightColor="transparent" darkColor="transparent">
          <Text style={styles.heroEmoji}>📷</Text>
          <Text style={styles.heroTitle}>Scan</Text>
          <Text style={styles.heroSubtitle}>
            Scan barcodes or receipts to compare prices and contribute data.
          </Text>
        </View>

        <View style={styles.selectorSection} lightColor="transparent" darkColor="transparent">
          <ScanModeSelector mode={mode} onSelect={setMode} />
        </View>

        {mode === 'barcode' && (
          <View style={styles.section} lightColor="transparent" darkColor="transparent">
            <View style={styles.cameraPlaceholder} lightColor="#1e293b" darkColor="#1e293b">
              <Text style={styles.cameraEmoji}>📷</Text>
              <Text style={styles.cameraText}>Camera would render here</Text>
              <Text style={styles.cameraHint}>expo-camera integration — Phase 2</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <FontAwesome
                  name="barcode"
                  size={16}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter barcode number..."
                  placeholderTextColor="#64748b"
                  value={barcodeText}
                  onChangeText={setBarcodeText}
                  onSubmitEditing={handleScan}
                  returnKeyType="search"
                  keyboardType="number-pad"
                />
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.scanButton,
                  pressed && styles.scanButtonPressed,
                ]}
                onPress={handleScan}
              >
                <Text style={styles.scanButtonText}>Scan</Text>
              </Pressable>
            </View>

            <Text style={styles.mockLabel}>Mock barcodes</Text>
            <View style={styles.chipRow} lightColor="transparent" darkColor="transparent">
              {MOCK_BARCODES.map((code) => (
                <Pressable
                  key={code}
                  style={styles.chip}
                  onPress={() => handleMockBarcode(code)}
                >
                  <Text style={styles.chipText}>{code}</Text>
                </Pressable>
              ))}
            </View>

            {scannedBarcode && <BarcodeResult barcode={scannedBarcode} />}
          </View>
        )}

        {mode === 'receipt' && (
          <View style={styles.section} lightColor="transparent" darkColor="transparent">
            <ReceiptProcessor />
          </View>
        )}

        <View style={styles.spacer} lightColor="transparent" darkColor="transparent" />
      </ScrollView>
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
  hero: {
    paddingTop: 60,
    paddingBottom: 20,
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
  selectorSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 24,
    gap: 14,
  },
  cameraPlaceholder: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  cameraEmoji: {
    fontSize: 40,
  },
  cameraText: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '500',
  },
  cameraHint: {
    color: '#64748b',
    fontSize: 12,
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
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 16,
    paddingVertical: 14,
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  scanButtonPressed: {
    backgroundColor: '#2563eb',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  mockLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'SpaceMono',
  },
  spacer: {
    height: 40,
  },
});

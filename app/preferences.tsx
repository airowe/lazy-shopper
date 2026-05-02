import { useState, useCallback } from 'react';
import { StyleSheet, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { usePreferences, type FulfillmentPreference } from '@/contexts/PreferencesContext';
import { RETAILERS } from '@/lib/data';

const FULFILLMENT_OPTIONS: { key: FulfillmentPreference; label: string; icon: string }[] = [
  { key: 'delivery', label: 'Delivery', icon: 'truck' },
  { key: 'pickup', label: 'Pickup', icon: 'shopping-bag' },
  { key: 'both', label: 'Both', icon: 'check-square-o' },
];

export default function PreferencesScreen() {
  const { preferences, updatePreference, toggleStore, resetPreferences } = usePreferences();

  const [savingsInput, setSavingsInput] = useState(String(preferences.minSavingsThreshold));

  const allStoresVisible = preferences.preferredStores.length === 0;

  const handleFulfillmentChange = useCallback(
    (value: FulfillmentPreference) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      updatePreference('fulfillmentPreference', value);
    },
    [updatePreference],
  );

  const handleMembershipToggle = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePreference('useMembership', !preferences.useMembership);
  }, [preferences.useMembership, updatePreference]);

  const handleSavingsBlur = useCallback(() => {
    const parsed = parseFloat(savingsInput);
    if (isNaN(parsed) || parsed < 0) {
      setSavingsInput('0');
      updatePreference('minSavingsThreshold', 0);
    } else {
      const rounded = Math.round(parsed * 100) / 100;
      setSavingsInput(String(rounded));
      updatePreference('minSavingsThreshold', rounded);
    }
  }, [savingsInput, updatePreference]);

  const handleMaxStores = useCallback(
    (delta: number) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = Math.min(5, Math.max(1, preferences.maxStoresPerTrip + delta));
      updatePreference('maxStoresPerTrip', next);
    },
    [preferences.maxStoresPerTrip, updatePreference],
  );

  const handleReset = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Reset Preferences', 'Restore all settings to their defaults?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetPreferences();
          setSavingsInput('0');
        },
      },
    ]);
  }, [resetPreferences]);

  return (
    <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Preferred Stores --- */}
        <View style={styles.section} lightColor="transparent" darkColor="transparent">
          <Text style={styles.sectionTitle}>Preferred Stores</Text>
          <Text style={styles.sectionHint}>
            {allStoresVisible
              ? 'All stores are visible. Toggle stores to filter.'
              : 'Only selected stores will appear in results.'}
          </Text>
          <View style={styles.card} lightColor="#1e293b" darkColor="#1e293b">
            {RETAILERS.map((retailer, idx) => {
              const isEnabled = allStoresVisible || preferences.preferredStores.includes(retailer.id);
              return (
                <View key={retailer.id} lightColor="transparent" darkColor="transparent">
                  {idx > 0 && <View style={styles.divider} lightColor="#334155" darkColor="#334155" />}
                  <Pressable
                    style={styles.storeRow}
                    onPress={() => toggleStore(retailer.id)}
                  >
                    <View style={styles.storeInfo} lightColor="transparent" darkColor="transparent">
                      <Text style={styles.storeLogo}>{retailer.logo}</Text>
                      <Text style={styles.storeName}>{retailer.name}</Text>
                    </View>
                    <View
                      style={[styles.toggle, isEnabled && styles.toggleOn]}
                      lightColor={isEnabled ? '#3b82f6' : '#334155'}
                      darkColor={isEnabled ? '#3b82f6' : '#334155'}
                    >
                      <View
                        style={[styles.toggleKnob, isEnabled && styles.toggleKnobOn]}
                        lightColor="#fff"
                        darkColor="#fff"
                      />
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {/* --- Fulfillment Preference --- */}
        <View style={styles.section} lightColor="transparent" darkColor="transparent">
          <Text style={styles.sectionTitle}>Fulfillment</Text>
          <View style={styles.segmentedControl} lightColor="#1e293b" darkColor="#1e293b">
            {FULFILLMENT_OPTIONS.map((opt) => {
              const isActive = preferences.fulfillmentPreference === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[
                    styles.segment,
                    isActive && styles.segmentActive,
                  ]}
                  onPress={() => handleFulfillmentChange(opt.key)}
                >
                  <FontAwesome
                    name={opt.icon as any}
                    size={14}
                    color={isActive ? '#fff' : '#94a3b8'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[styles.segmentText, isActive && styles.segmentTextActive]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* --- Membership Pricing --- */}
        <View style={styles.section} lightColor="transparent" darkColor="transparent">
          <View style={styles.card} lightColor="#1e293b" darkColor="#1e293b">
            <Pressable style={styles.toggleRow} onPress={handleMembershipToggle}>
              <View style={styles.toggleLabel} lightColor="transparent" darkColor="transparent">
                <Text style={styles.toggleTitle}>Membership Pricing</Text>
                <Text style={styles.toggleHint}>
                  Apply loyalty and membership discounts to prices
                </Text>
              </View>
              <View
                style={[styles.toggle, preferences.useMembership && styles.toggleOn]}
                lightColor={preferences.useMembership ? '#3b82f6' : '#334155'}
                darkColor={preferences.useMembership ? '#3b82f6' : '#334155'}
              >
                <View
                  style={[styles.toggleKnob, preferences.useMembership && styles.toggleKnobOn]}
                  lightColor="#fff"
                  darkColor="#fff"
                />
              </View>
            </Pressable>
          </View>
        </View>

        {/* --- Minimum Savings Threshold --- */}
        <View style={styles.section} lightColor="transparent" darkColor="transparent">
          <Text style={styles.sectionTitle}>Minimum Savings</Text>
          <View style={styles.card} lightColor="#1e293b" darkColor="#1e293b">
            <View style={styles.inputRow} lightColor="transparent" darkColor="transparent">
              <View style={styles.inputPrefix} lightColor="#334155" darkColor="#334155">
                <Text style={styles.inputPrefixText}>$</Text>
              </View>
              <TextInput
                style={styles.input}
                value={savingsInput}
                onChangeText={setSavingsInput}
                onBlur={handleSavingsBlur}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#64748b"
                returnKeyType="done"
                onSubmitEditing={handleSavingsBlur}
              />
            </View>
            <Text style={styles.inputHint}>
              Only show offers that save you more than this amount
            </Text>
          </View>
        </View>

        {/* --- Max Stores Per Trip --- */}
        <View style={styles.section} lightColor="transparent" darkColor="transparent">
          <Text style={styles.sectionTitle}>Max Stores Per Trip</Text>
          <View style={styles.card} lightColor="#1e293b" darkColor="#1e293b">
            <View style={styles.stepperRow} lightColor="transparent" darkColor="transparent">
              <Pressable
                style={({ pressed }) => [
                  styles.stepperBtn,
                  preferences.maxStoresPerTrip <= 1 && styles.stepperBtnDisabled,
                  pressed && !(preferences.maxStoresPerTrip <= 1) && styles.stepperBtnPressed,
                ]}
                onPress={() => handleMaxStores(-1)}
                disabled={preferences.maxStoresPerTrip <= 1}
              >
                <FontAwesome
                  name="minus"
                  size={16}
                  color={preferences.maxStoresPerTrip <= 1 ? '#475569' : '#f1f5f9'}
                />
              </Pressable>
              <Text style={styles.stepperValue}>{preferences.maxStoresPerTrip}</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.stepperBtn,
                  preferences.maxStoresPerTrip >= 5 && styles.stepperBtnDisabled,
                  pressed && !(preferences.maxStoresPerTrip >= 5) && styles.stepperBtnPressed,
                ]}
                onPress={() => handleMaxStores(1)}
                disabled={preferences.maxStoresPerTrip >= 5}
              >
                <FontAwesome
                  name="plus"
                  size={16}
                  color={preferences.maxStoresPerTrip >= 5 ? '#475569' : '#f1f5f9'}
                />
              </Pressable>
            </View>
            <Text style={styles.inputHint}>
              Split your basket across this many stores at most
            </Text>
          </View>
        </View>

        {/* --- Reset --- */}
        <Pressable
          style={({ pressed }) => [styles.resetBtn, pressed && styles.resetBtnPressed]}
          onPress={handleReset}
        >
          <FontAwesome name="refresh" size={14} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.resetBtnText}>Reset to defaults</Text>
        </Pressable>

        <View style={styles.spacer} lightColor="transparent" darkColor="transparent" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionHint: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeLogo: {
    fontSize: 24,
  },
  storeName: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '500',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {},
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: '#3b82f6',
  },
  segmentText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLabel: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  toggleHint: {
    color: '#64748b',
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  inputPrefix: {
    width: 36,
    height: 42,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputPrefixText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    height: 42,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 12,
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600',
  },
  inputHint: {
    color: '#64748b',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    lineHeight: 17,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 20,
  },
  stepperBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnPressed: {
    backgroundColor: '#475569',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperValue: {
    color: '#f1f5f9',
    fontSize: 28,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#451a1a',
    marginTop: 8,
  },
  resetBtnPressed: {
    backgroundColor: '#451a1a',
  },
  resetBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});

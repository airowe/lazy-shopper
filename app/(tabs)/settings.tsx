import { StyleSheet, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
      <View style={styles.section} lightColor="transparent" darkColor="transparent">
        <Text style={styles.sectionTitle}>App Settings</Text>

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => router.push('/preferences')}
        >
          <View style={styles.rowLeft} lightColor="transparent" darkColor="transparent">
            <View style={[styles.iconBox, { backgroundColor: '#1e3a5f' }]}>
              <FontAwesome name="sliders" size={16} color="#3b82f6" />
            </View>
            <View lightColor="transparent" darkColor="transparent">
              <Text style={styles.rowTitle}>Preferences</Text>
              <Text style={styles.rowSubtitle}>
                Stores, membership, fulfillment
              </Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#64748b" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => router.push('/alerts')}
        >
          <View style={styles.rowLeft} lightColor="transparent" darkColor="transparent">
            <View style={[styles.iconBox, { backgroundColor: '#451a1a' }]}>
              <FontAwesome name="bell" size={16} color="#ef4444" />
            </View>
            <View lightColor="transparent" darkColor="transparent">
              <Text style={styles.rowTitle}>Price Alerts</Text>
              <Text style={styles.rowSubtitle}>
                Get notified when prices drop
              </Text>
            </View>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#64748b" />
        </Pressable>
      </View>

      <View style={styles.footer} lightColor="transparent" darkColor="transparent">
        <Text style={styles.footerText}>Lazy Shopper v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rowPressed: {
    opacity: 0.8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowSubtitle: {
    color: '#64748b',
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    color: '#475569',
    fontSize: 12,
  },
});

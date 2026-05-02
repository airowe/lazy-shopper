import { StyleSheet, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';

export default function AlertsScreen() {
  const router = useRouter();

  return (
    <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
      <View style={styles.container} lightColor="transparent" darkColor="transparent">
        <Text style={styles.emoji}>🔔</Text>
        <Text style={styles.title}>Price Alerts</Text>

        <View style={styles.comingSoonBadge} lightColor="#1e3a5f" darkColor="#1e3a5f">
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>

        <Text style={styles.description}>
          Price drop alerts will notify you when your target items hit your desired price.{'\n\n'}
          Set a target price for any product and we'll let you know the moment it drops. Never
          miss a deal again.
        </Text>

        <View style={styles.featureList} lightColor="transparent" darkColor="transparent">
          <View style={styles.featureItem} lightColor="transparent" darkColor="transparent">
            <FontAwesome name="bell-o" size={14} color="#3b82f6" style={{ marginRight: 10 }} />
            <Text style={styles.featureText}>Push notifications for price drops</Text>
          </View>
          <View style={styles.featureItem} lightColor="transparent" darkColor="transparent">
            <FontAwesome name="line-chart" size={14} color="#3b82f6" style={{ marginRight: 10 }} />
            <Text style={styles.featureText}>Track price history over time</Text>
          </View>
          <View style={styles.featureItem} lightColor="transparent" darkColor="transparent">
            <FontAwesome name="star-o" size={14} color="#3b82f6" style={{ marginRight: 10 }} />
            <Text style={styles.featureText}>Set custom threshold for each product</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    color: '#f1f5f9',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  comingSoonBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 24,
  },
  comingSoonText: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  featureList: {
    width: '100%',
    marginBottom: 32,
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  featureText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  backBtnPressed: {
    backgroundColor: '#1e293b',
  },
  backBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
});

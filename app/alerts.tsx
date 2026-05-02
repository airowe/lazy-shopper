import { useState } from 'react';
import { StyleSheet, Pressable, FlatList } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useAlerts } from '@/contexts/AlertsContext';
import AlertRow from '@/components/AlertRow';
import CreateAlertModal from '@/components/CreateAlertModal';

export default function AlertsScreen() {
  const router = useRouter();
  const { alerts, createAlert, toggleAlert, deleteAlert, checkAlerts, alertCount } = useAlerts();
  const [modalVisible, setModalVisible] = useState(false);
  const [triggered, setTriggered] = useState<{ alertId: string; productName: string; currentPrice: number }[] | null>(null);

  const handleCheck = async () => {
    const results = await checkAlerts();
    setTriggered(results.length > 0 ? results : null);
  };

  return (
    <View style={styles.root} lightColor="#0f172a" darkColor="#0f172a">
      <View style={styles.container} lightColor="transparent" darkColor="transparent">
        {/* Header */}
        <View style={styles.header} lightColor="transparent" darkColor="transparent">
          <View style={styles.headerLeft} lightColor="transparent" darkColor="transparent">
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            >
              <Text style={styles.backBtnText}>←</Text>
            </Pressable>
            <Text style={styles.title}>Price Alerts</Text>
          </View>
          <View style={styles.headerRight} lightColor="transparent" darkColor="transparent">
            <View style={styles.countBadge} lightColor="#1e3a5f" darkColor="#1e3a5f">
              <Text style={styles.countText}>{alertCount} active</Text>
            </View>
          </View>
        </View>

        {/* Action bar */}
        <View style={styles.actionBar} lightColor="transparent" darkColor="transparent">
          <Pressable
            style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createBtnText}>+ Create Alert</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.checkBtn, pressed && styles.checkBtnPressed]}
            onPress={handleCheck}
          >
            <Text style={styles.checkBtnText}>Check Now</Text>
          </Pressable>
        </View>

        {/* Triggered banner */}
        {triggered && triggered.length > 0 && (
          <View style={styles.triggeredBanner} lightColor="#1e3a5f" darkColor="#1e3a5f">
            <Text style={styles.triggeredTitle}>Alerts Triggered!</Text>
            {triggered.map((t) => (
              <Text key={t.alertId} style={styles.triggeredItem}>
                {t.productName} — now ${t.currentPrice.toFixed(2)}
              </Text>
            ))}
            <Pressable onPress={() => setTriggered(null)} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </Pressable>
          </View>
        )}

        {/* Alert list */}
        {alerts.length === 0 ? (
          <View style={styles.empty} lightColor="transparent" darkColor="transparent">
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>No price alerts yet</Text>
            <Text style={styles.emptyDesc}>
              Set up alerts for products you care about and we'll notify you when prices drop or
              items come back in stock.
            </Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AlertRow
                alert={item}
                onToggle={toggleAlert}
                onDelete={deleteAlert}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Create modal */}
        <CreateAlertModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onCreate={createAlert}
        />
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backBtnPressed: {
    backgroundColor: '#1e293b',
  },
  backBtnText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  createBtn: {
    flex: 2,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  createBtnPressed: {
    backgroundColor: '#2563eb',
  },
  createBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  checkBtnPressed: {
    backgroundColor: '#334155',
  },
  checkBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  triggeredBanner: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  triggeredTitle: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  triggeredItem: {
    color: '#f1f5f9',
    fontSize: 13,
    marginBottom: 3,
  },
  dismissBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  dismissText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  list: {
    paddingBottom: 20,
  },
});

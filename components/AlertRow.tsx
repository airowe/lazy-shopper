import { StyleSheet, Pressable, Switch } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { PriceAlert } from '@/contexts/AlertsContext';
import { RETAILERS } from '@/lib/data';

type Props = {
  alert: PriceAlert;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function AlertRow({ alert, onToggle, onDelete }: Props) {
  const retailerName = alert.retailerId
    ? RETAILERS.find((r) => r.id === alert.retailerId)?.name ?? 'Unknown'
    : 'Any store';

  const typeLabel = alert.type === 'price_drop' ? 'Price Drop' : 'Restock';

  const lastTriggered = alert.lastTriggeredAt
    ? new Date(alert.lastTriggeredAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <View style={styles.card} lightColor="#1e293b" darkColor="#1e293b">
      <View style={styles.row} lightColor="transparent" darkColor="transparent">
        <View style={styles.info} lightColor="transparent" darkColor="transparent">
          <View style={styles.nameRow} lightColor="transparent" darkColor="transparent">
            <Text style={styles.emoji}>{alert.productImage}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {alert.productName}
            </Text>
          </View>

          <Text style={styles.target}>
            {alert.type === 'price_drop'
              ? `Below $${alert.targetPrice.toFixed(2)} at ${retailerName}`
              : `Back in stock at ${retailerName}`}
          </Text>

          <View style={styles.metaRow} lightColor="transparent" darkColor="transparent">
            <View style={[styles.badge, alert.type === 'price_drop' ? styles.badgeDrop : styles.badgeRestock]} lightColor="transparent" darkColor="transparent">
              <Text style={styles.badgeText}>{typeLabel}</Text>
            </View>
            {lastTriggered && (
              <Text style={styles.lastTriggered}>Last triggered: {lastTriggered}</Text>
            )}
          </View>
        </View>

        <View style={styles.actions} lightColor="transparent" darkColor="transparent">
          <Switch
            value={alert.isActive}
            onValueChange={() => onToggle(alert.id)}
            trackColor={{ false: '#475569', true: '#2563eb' }}
            thumbColor={alert.isActive ? '#60a5fa' : '#94a3b8'}
          />
          <Pressable
            onPress={() => onDelete(alert.id)}
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
          >
            <Text style={styles.deleteBtnText}>✕</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  name: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  target: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDrop: {
    backgroundColor: '#1e3a5f',
  },
  badgeRestock: {
    backgroundColor: '#3b2f1e',
  },
  badgeText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
  },
  lastTriggered: {
    color: '#64748b',
    fontSize: 11,
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: {
    backgroundColor: '#ef4444',
  },
  deleteBtnText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '700',
  },
});

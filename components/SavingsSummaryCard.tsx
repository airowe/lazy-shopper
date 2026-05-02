import { StyleSheet } from 'react-native';
import { View, Text } from '@/components/Themed';

type Props = {
  totalSavings: number;
  totalSavingsPercent: number;
  totalCost: number;
  storesUsed: number;
  singleStoreBaseline: number;
};

export default function SavingsSummaryCard({
  totalSavings,
  totalSavingsPercent,
  totalCost,
  storesUsed,
}: Props) {
  const showSavings = totalSavings > 0;

  return (
    <View style={styles.card} lightColor="#1e293b" darkColor="#1e293b">
      <View style={styles.savingsRow} lightColor="transparent" darkColor="transparent">
        {showSavings ? (
          <>
            <Text style={styles.savingsAmount}>
              Save ${totalSavings.toFixed(2)}
            </Text>
            <View style={styles.percentBadge} lightColor="#22c55e" darkColor="#22c55e">
              <Text style={styles.percentText}>{totalSavingsPercent}%</Text>
            </View>
          </>
        ) : (
          <Text style={styles.savingsAmount}>No savings found</Text>
        )}
      </View>

      <View style={styles.divider} lightColor="#334155" darkColor="#334155" />

      <View style={styles.statsRow} lightColor="transparent" darkColor="transparent">
        <View style={styles.stat} lightColor="transparent" darkColor="transparent">
          <Text style={styles.statLabel}>{storesUsed}</Text>
          <Text style={styles.statSubtitle}>Store{storesUsed !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.stat} lightColor="transparent" darkColor="transparent">
          <Text style={styles.statLabel}>${totalCost.toFixed(2)}</Text>
          <Text style={styles.statSubtitle}>Total</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savingsAmount: {
    color: '#22c55e',
    fontSize: 20,
    fontWeight: '800',
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    alignItems: 'flex-start',
  },
  statLabel: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
  },
  statSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 1,
  },
});

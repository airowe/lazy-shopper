import { Pressable, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text } from '@/components/Themed';
import { openRetailerApp, openRetailerWithProduct } from '@/lib/deepLinks';

const RETAILER_LABELS: Record<string, string> = {
  freshmart: 'Open in FreshMart',
  valuegrocer: 'Open in ValueGrocer',
  quickstop: 'Open in QuickStop',
  megasave: 'Open in MegaSave',
};

type Props = {
  retailerId: string;
  productId?: string;
  label?: string;
};

export default function DeepLinkButton({ retailerId, productId, label }: Props) {
  const displayLabel =
    label ?? RETAILER_LABELS[retailerId.toLowerCase()] ?? `Open in ${retailerId}`;

  const handlePress = () => {
    if (productId) {
      openRetailerWithProduct(retailerId, productId);
    } else {
      openRetailerApp(retailerId);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={handlePress}
    >
      <FontAwesome
        name="external-link"
        size={12}
        color="#64748b"
        style={styles.icon}
      />
      <Text style={styles.label}>{displayLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  buttonPressed: {
    backgroundColor: '#334155',
  },
  icon: {
    marginRight: 2,
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
});

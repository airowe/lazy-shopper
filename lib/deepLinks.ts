import { Linking, Alert } from 'react-native';

const RETAILER_URLS: Record<string, string> = {
  freshmart: 'https://freshmart.example.com',
  valuegrocer: 'https://valuegrocer.example.com',
  quickstop: 'https://quickstop.example.com',
  megasave: 'https://megasave.example.com',
};

export function getRetailerUrl(retailerId: string): string | null {
  return RETAILER_URLS[retailerId.toLowerCase()] ?? null;
}

export function openRetailerApp(retailerId: string): void {
  const url = getRetailerUrl(retailerId);

  if (!url) {
    Alert.alert('Unknown Retailer', `No URL configured for "${retailerId}".`);
    return;
  }

  Linking.openURL(url).catch(() => {
    Alert.alert('Error', `Could not open ${retailerId}.`);
  });
}

export function openRetailerWithProduct(
  retailerId: string,
  productId: string,
): void {
  const baseUrl = getRetailerUrl(retailerId);

  if (!baseUrl) {
    Alert.alert('Unknown Retailer', `No URL configured for "${retailerId}".`);
    return;
  }

  const url = `${baseUrl}/product/${encodeURIComponent(productId)}`;

  Linking.openURL(url).catch(() => {
    Alert.alert('Error', `Could not open ${retailerId}.`);
  });
}

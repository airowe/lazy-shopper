import AsyncStorage from '@react-native-async-storage/async-storage';

import { getProduct } from '@/lib/catalog';

const KEY = 'lazy-shopper.alerts.v1';

export type PriceAlert = {
  productId: string;
  targetPrice: number;
  createdAt: string;
  triggered: boolean;
};

async function readRaw(): Promise<PriceAlert[]> {
  const json = await AsyncStorage.getItem(KEY);
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as PriceAlert[]) : [];
  } catch {
    return [];
  }
}

async function writeRaw(alerts: PriceAlert[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(alerts));
}

// All alerts, with entries whose product no longer exists pruned out.
export async function getAlerts(): Promise<PriceAlert[]> {
  const alerts = await readRaw();
  const live = alerts.filter((a) => getProduct(a.productId));
  if (live.length !== alerts.length) await writeRaw(live);
  return live;
}

export async function getAlert(
  productId: string
): Promise<PriceAlert | undefined> {
  const alerts = await readRaw();
  return alerts.find((a) => a.productId === productId);
}

// One alert per product (PRD-02). Re-setting an alert replaces the existing
// one and re-arms it.
export async function setAlert(
  productId: string,
  targetPrice: number
): Promise<void> {
  const alerts = await readRaw();
  const others = alerts.filter((a) => a.productId !== productId);
  const alert: PriceAlert = {
    productId,
    targetPrice,
    createdAt: new Date().toISOString(),
    triggered: false,
  };
  await writeRaw([alert, ...others]);
}

export async function removeAlert(productId: string): Promise<void> {
  const alerts = await readRaw();
  await writeRaw(alerts.filter((a) => a.productId !== productId));
}

export async function markTriggered(
  productId: string,
  triggered: boolean
): Promise<void> {
  const alerts = await readRaw();
  await writeRaw(
    alerts.map((a) => (a.productId === productId ? { ...a, triggered } : a))
  );
}

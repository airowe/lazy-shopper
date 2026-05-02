import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCTS, RETAILERS } from '@/lib/data';

const STORAGE_KEY = 'price_alerts';

export type PriceAlert = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  retailerId: string | null;
  targetPrice: number;
  type: 'price_drop' | 'restock';
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt: string | null;
};

type TriggeredAlert = {
  alertId: string;
  productName: string;
  currentPrice: number;
};

type AlertsContextType = {
  alerts: PriceAlert[];
  createAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'lastTriggeredAt' | 'isActive'>) => void;
  toggleAlert: (id: string) => void;
  deleteAlert: (id: string) => void;
  checkAlerts: () => Promise<TriggeredAlert[]>;
  alertCount: number;
};

const AlertsContext = createContext<AlertsContextType | null>(null);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setAlerts(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((next: PriceAlert[]) => {
    setAlerts(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const createAlert = useCallback(
    (input: Omit<PriceAlert, 'id' | 'createdAt' | 'lastTriggeredAt' | 'isActive'>) => {
      const now = new Date().toISOString();
      const alert: PriceAlert = {
        ...input,
        id: generateId(),
        isActive: true,
        createdAt: now,
        lastTriggeredAt: null,
      };
      setAlerts((prev) => {
        const next = [alert, ...prev];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const toggleAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const next = prev.map((a) =>
        a.id === id ? { ...a, isActive: !a.isActive } : a
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const checkAlerts = useCallback(async (): Promise<TriggeredAlert[]> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    let currentAlerts: PriceAlert[];
    try {
      currentAlerts = JSON.parse(stored);
    } catch {
      return [];
    }

    const activeAlerts = currentAlerts.filter((a) => a.isActive);
    const triggered: TriggeredAlert[] = [];
    const now = new Date().toISOString();

    for (const alert of activeAlerts) {
      const product = PRODUCTS.find((p) => p.id === alert.productId);
      if (!product) continue;

      let bestPrice: number | null = null;

      if (alert.type === 'restock') {
        if (alert.retailerId) {
          const offer = product.offers.find((o) => o.retailerId === alert.retailerId);
          if (offer && offer.inStock) {
            triggered.push({
              alertId: alert.id,
              productName: alert.productName,
              currentPrice: offer.price,
            });
          }
        } else {
          const inStock = product.offers.some((o) => o.inStock);
          if (inStock) {
            const cheapest = product.offers
              .filter((o) => o.inStock)
              .reduce((min, o) => (o.price < min.price ? o : min));
            triggered.push({
              alertId: alert.id,
              productName: alert.productName,
              currentPrice: cheapest.price,
            });
          }
        }
      } else {
        if (alert.retailerId) {
          const offer = product.offers.find((o) => o.retailerId === alert.retailerId);
          if (offer && offer.inStock && offer.price <= alert.targetPrice) {
            bestPrice = offer.price;
          }
        } else {
          const inStock = product.offers.filter((o) => o.inStock);
          for (const offer of inStock) {
            if (offer.price <= alert.targetPrice) {
              if (bestPrice === null || offer.price < bestPrice) {
                bestPrice = offer.price;
              }
            }
          }
        }

        if (bestPrice !== null) {
          triggered.push({
            alertId: alert.id,
            productName: alert.productName,
            currentPrice: bestPrice,
          });
        }
      }
    }

    if (triggered.length > 0) {
      const updatedAlerts: PriceAlert[] = currentAlerts.map((a) => {
        const trig = triggered.find((t) => t.alertId === a.id);
        return trig ? { ...a, lastTriggeredAt: now } : a;
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAlerts));
      setAlerts(updatedAlerts);
    }

    return triggered;
  }, []);

  const alertCount = alerts.length;

  return (
    <AlertsContext.Provider
      value={{ alerts, createAlert, toggleAlert, deleteAlert, checkAlerts, alertCount }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider');
  return ctx;
}

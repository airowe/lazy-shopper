import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'user_preferences';

export type FulfillmentPreference = 'delivery' | 'pickup' | 'both';

export type UserPreferences = {
  preferredStores: string[];
  fulfillmentPreference: FulfillmentPreference;
  useMembership: boolean;
  minSavingsThreshold: number;
  maxStoresPerTrip: number;
};

const DEFAULTS: UserPreferences = {
  preferredStores: [],
  fulfillmentPreference: 'both',
  useMembership: false,
  minSavingsThreshold: 0,
  maxStoresPerTrip: 3,
};

type PreferencesContextType = {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  toggleStore: (storeId: string) => void;
  resetPreferences: () => void;
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setPreferences({ ...DEFAULTS, ...JSON.parse(stored) });
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((prefs: UserPreferences) => {
    setPreferences(prefs);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, []);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const toggleStore = useCallback((storeId: string) => {
    setPreferences((prev) => {
      const isPreferred = prev.preferredStores.includes(storeId);
      const next: UserPreferences = {
        ...prev,
        preferredStores: isPreferred
          ? prev.preferredStores.filter((s) => s !== storeId)
          : [...(prev.preferredStores.length === 0 ? ['freshmart', 'valuegrocer', 'quickstop', 'megasave'] : prev.preferredStores), storeId].filter((s) =>
              isPreferred ? s !== storeId : true
            ),
      };
      // If we're adding the first store, initialize with all except the toggled one
      if (!isPreferred && prev.preferredStores.length === 0) {
        next.preferredStores = ['freshmart', 'valuegrocer', 'quickstop', 'megasave'];
      }
      if (isPreferred) {
        next.preferredStores = next.preferredStores.filter((s) => s !== storeId);
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    persist(DEFAULTS);
  }, [persist]);

  return (
    <PreferencesContext.Provider
      value={{ preferences, updatePreference, toggleStore, resetPreferences }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}

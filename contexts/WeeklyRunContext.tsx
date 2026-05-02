import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBasket, type BasketItem } from './BasketContext';
import { useLists } from './ListsContext';
import { usePreferences } from './PreferencesContext';

const STORAGE_KEY = 'weekly_run_state';

export type RunStep = 'review' | 'optimize' | 'results' | 'shop' | 'complete';

export type RunState = {
  isActive: boolean;
  currentStep: RunStep;
  listId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  totalSpent: number;
  itemsChecked: string[];
  contributedPrices: number;
};

type WeeklyRunContextType = {
  run: RunState;
  startRun: (listId?: string) => void;
  advanceStep: (step: RunStep) => void;
  toggleItemChecked: (productId: string) => void;
  completeRun: () => void;
  cancelRun: () => void;
  hasRecurringList: boolean;
  suggestRun: boolean;
  dismissSuggestion: () => void;
};

const EMPTY_RUN: RunState = {
  isActive: false,
  currentStep: 'review',
  listId: null,
  startedAt: null,
  completedAt: null,
  totalSpent: 0,
  itemsChecked: [],
  contributedPrices: 0,
};

const WeeklyRunContext = createContext<WeeklyRunContextType | null>(null);

export function WeeklyRunProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState<RunState>(EMPTY_RUN);
  const [suggestRun, setSuggestRun] = useState(false);
  const { addItem } = useBasket();
  const { lists } = useLists();
  const { preferences } = usePreferences();

  const hasRecurringList = lists.some((l) => l.isRecurring);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setRun(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    if (hasRecurringList && !run.isActive) {
      AsyncStorage.getItem('weekly_run_dismissed').then((dismissed) => {
        if (!dismissed) {
          setSuggestRun(true);
        }
      });
    }
  }, [hasRecurringList, run.isActive]);

  const persist = useCallback((state: RunState) => {
    setRun(state);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, []);

  const startRun = useCallback(
    (listId?: string) => {
      const targetListId = listId ?? lists.find((l) => l.isRecurring)?.id ?? null;
      if (targetListId) {
        const list = lists.find((l) => l.id === targetListId);
        if (list) {
          list.items.forEach((item) => {
            addItem({
              productId: item.productId,
              name: item.name,
              image: item.image,
              quantity: item.quantity,
            });
          });
        }
      }
      persist({
        isActive: true,
        currentStep: 'review',
        listId: targetListId,
        startedAt: new Date().toISOString(),
        completedAt: null,
        totalSpent: 0,
        itemsChecked: [],
        contributedPrices: 0,
      });
      setSuggestRun(false);
    },
    [lists, addItem, persist]
  );

  const advanceStep = useCallback(
    (step: RunStep) => {
      setRun((prev) => {
        const next = { ...prev, currentStep: step };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const toggleItemChecked = useCallback(
    (productId: string) => {
      setRun((prev) => {
        const isChecked = prev.itemsChecked.includes(productId);
        const next = {
          ...prev,
          itemsChecked: isChecked
            ? prev.itemsChecked.filter((id) => id !== productId)
            : [...prev.itemsChecked, productId],
        };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const completeRun = useCallback(() => {
    const completed = {
      ...run,
      currentStep: 'complete' as RunStep,
      completedAt: new Date().toISOString(),
    };
    persist(completed);
  }, [run, persist]);

  const cancelRun = useCallback(() => {
    persist(EMPTY_RUN);
  }, [persist]);

  const dismissSuggestion = useCallback(() => {
    setSuggestRun(false);
    AsyncStorage.setItem('weekly_run_dismissed', 'true');
  }, []);

  return (
    <WeeklyRunContext.Provider
      value={{
        run,
        startRun,
        advanceStep,
        toggleItemChecked,
        completeRun,
        cancelRun,
        hasRecurringList,
        suggestRun,
        dismissSuggestion,
      }}
    >
      {children}
    </WeeklyRunContext.Provider>
  );
}

export function useWeeklyRun() {
  const ctx = useContext(WeeklyRunContext);
  if (!ctx) throw new Error('useWeeklyRun must be used within WeeklyRunProvider');
  return ctx;
}

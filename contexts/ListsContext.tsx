import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'saved_lists';

export type ListItem = {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  note?: string;
  addedAt: string;
};

export type ShoppingList = {
  id: string;
  name: string;
  emoji: string;
  items: ListItem[];
  isRecurring: boolean;
  recurringInterval?: 'weekly' | 'biweekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
};

type ListsContextType = {
  lists: ShoppingList[];
  createList: (name: string, emoji: string) => ShoppingList;
  updateList: (id: string, updates: Partial<Omit<ShoppingList, 'id' | 'createdAt'>>) => void;
  deleteList: (id: string) => void;
  addItemToList: (listId: string, item: Omit<ListItem, 'addedAt'>) => void;
  removeItemFromList: (listId: string, productId: string) => void;
  updateItemQuantity: (listId: string, productId: string, quantity: number) => void;
  getList: (id: string) => ShoppingList | undefined;
};

const ListsContext = createContext<ListsContextType | null>(null);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function ListsProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState<ShoppingList[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setLists(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((newLists: ShoppingList[]) => {
    setLists(newLists);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLists));
  }, []);

  const createList = useCallback(
    (name: string, emoji: string): ShoppingList => {
      const now = new Date().toISOString();
      const list: ShoppingList = {
        id: generateId(),
        name,
        emoji,
        items: [],
        isRecurring: false,
        createdAt: now,
        updatedAt: now,
      };
      setLists((prev) => {
        const next = [...prev, list];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      return list;
    },
    []
  );

  const updateList = useCallback(
    (id: string, updates: Partial<Omit<ShoppingList, 'id' | 'createdAt'>>) => {
      setLists((prev) => {
        const next = prev.map((l) =>
          l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const deleteList = useCallback((id: string) => {
    setLists((prev) => {
      const next = prev.filter((l) => l.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addItemToList = useCallback(
    (listId: string, item: Omit<ListItem, 'addedAt'>) => {
      setLists((prev) => {
        const next = prev.map((l) => {
          if (l.id !== listId) return l;
          const existing = l.items.find((i) => i.productId === item.productId);
          const items = existing
            ? l.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            : [...l.items, { ...item, addedAt: new Date().toISOString() }];
          return { ...l, items, updatedAt: new Date().toISOString() };
        });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeItemFromList = useCallback((listId: string, productId: string) => {
    setLists((prev) => {
      const next = prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.filter((i) => i.productId !== productId),
              updatedAt: new Date().toISOString(),
            }
          : l
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateItemQuantity = useCallback(
    (listId: string, productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItemFromList(listId, productId);
        return;
      }
      setLists((prev) => {
        const next = prev.map((l) =>
          l.id === listId
            ? {
                ...l,
                items: l.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
                updatedAt: new Date().toISOString(),
              }
            : l
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [removeItemFromList]
  );

  const getList = useCallback(
    (id: string) => lists.find((l) => l.id === id),
    [lists]
  );

  return (
    <ListsContext.Provider
      value={{
        lists,
        createList,
        updateList,
        deleteList,
        addItemToList,
        removeItemFromList,
        updateItemQuantity,
        getList,
      }}
    >
      {children}
    </ListsContext.Provider>
  );
}

export function useLists() {
  const ctx = useContext(ListsContext);
  if (!ctx) throw new Error('useLists must be used within ListsProvider');
  return ctx;
}

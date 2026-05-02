# PRD: Basket Optimization

## Status
Not started

## Problem
Users shop at 3-6 stores but can't determine the optimal way to split their grocery list. The single-item comparison on the home screen is useful for one-off purchases but doesn't help with a full basket. No existing app solves multi-store cart optimization.

## User Story
> "I need milk, eggs, bread, chicken, rice, coffee, bananas, and olive oil. I shop at 4 stores. I want to know: which items should I buy at which store to minimize my total cost including delivery fees?"

## Route
`/basket`

Or triggered from saved list: `/list/:id/optimize`

## States
| State | Trigger | UI |
|-------|---------|-----|
| Empty | No items in basket | "Add items to compare" + search shortcut |
| Building | Adding items | Basket list with running count + est. total |
| Optimizing | Tap "Optimize" | Progress animation |
| Results | Algorithm done | Split-cart recommendation |
| No viable split | No combination saves money | "Best to buy everything at [Store]" |
| Error | Algorithm error | Error + retry |

## Features

### 1. Basket builder
- Add items from search, product detail, or saved lists
- Adjust quantity per item
- Remove items (swipe to delete)
- Clear all
- Running item count and estimated total

### 2. Optimization algorithm

**This is the core IP of the feature.**

```
Input:
  items: { productId, quantity }[]
  stores: retailerId[]  (from user preferences)
  maxStores: number     (user-configurable, default: unlimited)
  useMembership: boolean
  preferPickup: boolean

Output:
  allocation: { retailerId, items: { productId, price, quantity }[], subtotal, deliveryFee, total }[]
  totalSavings: number  (vs. best single-store)
  totalCost: number
```

**Algorithm (greedy with threshold optimization):**

1. For each item, find the cheapest store (factoring in membership, stock)
2. Assign each item to its cheapest store
3. Count how many unique stores are used
4. If stores used > maxStores:
   - For each store beyond the limit, find the "cheapest migration" — move its items to another already-used store with the smallest price increase
   - Sort migrations by cost increase, apply until store count ≤ maxStores
5. For each store's allocation:
   - Calculate subtotal
   - Add delivery fee (or $0 if pickup preferred or subtotal exceeds free delivery threshold)
6. Compare total to best single-store baseline
7. Return allocation + savings

**Complexity:** O(n × s) for n items and s stores — trivial for grocery-scale baskets.

### 3. Split-cart recommendation UI
- Each store gets a "cart" card
  - Store name, logo
  - Items list with individual prices
  - Subtotal
  - Delivery fee (or "Free!" if threshold met)
  - Total
- Summary card at top:
  - "2 stores, save $4.31 (16%)"
  - vs. single-store baseline
  - Total: $22.69

### 4. Actions
- **Share** → send split-cart to partner
- **Save as list** → save this configuration
- **Open in store app** → deep link (where supported)
- **Adjust preferences** → change max stores, pickup preference

## Technical Design

### Pure function (no side effects)
```typescript
// lib/optimize.ts

type BasketItem = {
  productId: string;
  quantity: number;
};

type StoreAllocation = {
  retailerId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    effectivePrice: number;
    quantity: number;
    lineTotal: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

type OptimizationResult = {
  allocations: StoreAllocation[];
  totalCost: number;
  singleStoreBaseline: number;
  totalSavings: number;
  storesUsed: number;
};

function optimizeBasket(
  items: BasketItem[],
  options: {
    maxStores?: number;
    useMembership?: boolean;
    preferPickup?: boolean;
    includedStores?: string[];
  }
): OptimizationResult;
```

### State management
- Basket items: React Context or Zustand (lightweight)
- Persist to AsyncStorage so basket survives app restarts
- Clear on checkout or manual clear

### Component tree
```
BasketScreen
├── BasketToolbar (item count, clear all)
├── BasketItemList
│   └── BasketItemRow (product name, quantity stepper, cheapest store badge, remove)
├── AddItemButton (opens search)
├── OptimizeButton ("Optimize — find best split")
├── OptimizationResults (shown after optimization)
│   ├── SavingsSummaryCard
│   ├── StoreCartCard (per store)
│   │   ├── StoreHeader (logo, name)
│   │   ├── CartItemRow (per item)
│   │   └── CartTotal (subtotal, delivery, total)
│   └── SingleStoreComparison ("vs. $27.00 at FreshMart")
└── ActionBar (share, save, preferences)
```

## Dependencies
- Existing: `lib/compare.ts`, `lib/data.ts`
- New: `lib/optimize.ts`
- New: `components/BasketItemRow.tsx`, `components/StoreCartCard.tsx`, `components/SavingsSummaryCard.tsx`
- State: `contexts/BasketContext.tsx` or Zustand store

## Acceptance Criteria
- [ ] Add items to basket from search results
- [ ] Adjust quantities
- [ ] Remove items
- [ ] Optimize correctly allocates items to minimize total cost
- [ ] maxStores constraint respected
- [ ] Delivery fees correctly factored in
- [ ] Savings vs. single-store baseline displayed
- [ ] Basket persists across app restarts
- [ ] Empty basket state handled
- [ ] Tests: pure function (all algorithm edge cases), integration (basket context), UI (screen states)

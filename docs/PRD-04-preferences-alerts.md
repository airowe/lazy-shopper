# PRD: Store Filters, Preferences & Price Alerts

## Status
Not started

## Problem
The current comparison treats all 4 stores equally. Users have preferred stores, distance limits, delivery preferences, and price targets. Without filters, results include irrelevant stores (too far, delivery-only when user wants pickup). Without alerts, users miss deals on items they care about.

## Route
`/preferences` (filters), alerts managed from product detail or dedicated `/alerts` page

## Features

### Store Filters
- **Preferred stores** — toggle each retailer on/off. Excluded stores don't appear in any comparison.
- **Max distance** — slider (1-50 miles). Mock for MVP: assign fake distances to retailers. Real geolocation + store locations later.
- **Fulfillment preference** — "Delivery only", "Pickup only", or "Both"
- **Membership** — toggle membership pricing (moves existing toggle here)
- **Minimum savings threshold** — "$" input. "Only show me a different store if I save at least $____"
- **Max stores per trip** — stepper (1-5). Feeds into basket optimization `maxStores` param.

### Price Alerts
- **Set from product detail** — "Alert me when [product] drops below $[target] at [store|any store]"
- **Restock alert** — "Alert me when [product] is back in stock at [store]"
- **Alert list** — view all active alerts, pause/resume, delete
- **Alert history** — past triggered alerts with date

### Weekly Digest (Phase 2)
- "5 items on your list dropped in price this week"
- "Eggs hit your target price at MegaSave ($4.79)"
- Push notification + in-app card

### Alert Checking (MVP)
- Check active alerts on app open
- Compare current prices to alert targets
- Trigger notification if condition met
- Deduplicate: don't re-alert for the same condition within 24h

## Data Model
```typescript
type UserPreferences = {
  preferredStores: string[];
  maxDistance: number | null;
  fulfillmentPreference: 'delivery' | 'pickup' | 'both';
  useMembership: boolean;
  minSavingsThreshold: number;
  maxStoresPerTrip: number;
};

type PriceAlert = {
  id: string;
  productId: string;
  productName: string;
  retailerId: string | null; // null = any store
  targetPrice: number;
  type: 'price_drop' | 'restock';
  isActive: boolean;
  createdAt: string;
  lastTriggeredAt: string | null;
};
```

## Technical
- Storage: AsyncStorage for preferences and alerts
- Alert checking: `checkAlerts()` function called on app foreground + after any search
- Notifications: `expo-notifications` for local notifications (MVP), push later

## Acceptance Criteria
- [ ] Toggle stores on/off, comparison excludes toggled-off stores
- [ ] Fulfillment preference filters results correctly
- [ ] Membership toggle persisted across sessions
- [ ] Create price alert from product detail
- [ ] Alert triggers when price condition met on app open
- [ ] Alert list with pause/resume/delete
- [ ] Preferences persist across app restarts
- [ ] Tests: filter logic, alert checking, persistence

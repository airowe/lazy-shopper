# PRD: Saved Lists & Shopping List

## Status
Not started

## Problem
Users build the same grocery list weekly. Re-entering items is tedious. Without saved lists, there's no path to the weekly grocery run habit, which is where the app delivers its highest value (basket optimization across a full list).

## Route
`/lists` (all lists), `/list/:id` (single list), `/list/:id/optimize` → basket optimization

## Features

### 1. List CRUD
- Create list with name, emoji, optional color
- Rename, duplicate, delete
- Archive (for seasonal/temporary lists)

### 2. Add items
- From search results ("Add to list" button on each result card)
- From product detail
- Manual text entry with autocomplete
- Quantity: default 1, adjustable with stepper
- Optional note per item ("get the organic one")

### 3. Recurring lists
- Mark list as "weekly", "biweekly", "monthly"
- "Time for your weekly run?" prompt on app open
- Template: duplicate a list for a new run (preserves original)

### 4. Compare all
- One-tap re-run comparison for entire list
- Opens basket optimization with list items pre-loaded

### 5. Check-off mode
- Toggle check-off mode
- Tap to mark purchased
- Running total updates as you check off
- Visual: strikethrough on checked items, total at bottom

### 6. List history
- Past lists saved with date and prices paid
- "Last time you spent $47.32 on this list"
- Builds personal price database over time

### 7. Share lists
- Share link (generates a read-only view)
- Real-time sync for household (Phase 2: simple polling)

## Data Model
```typescript
type ShoppingList = {
  id: string;
  name: string;
  emoji: string;
  items: ListItem[];
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
  recurringInterval?: 'weekly' | 'biweekly' | 'monthly';
};

type ListItem = {
  productId: string;
  name: string;
  quantity: number;
  note?: string;
  addedAt: string;
};

type ListRun = {
  id: string;
  listId: string;
  date: string;
  items: (ListItem & { pricePaid?: number; storeId?: string })[];
  totalSpent?: number;
};
```

## Technical
- Storage: AsyncStorage (MVP), SQLite (scale)
- Context: `ListContext` with CRUD operations
- Persist on every mutation, load on app start

## Acceptance Criteria
- [ ] Create, rename, delete lists
- [ ] Add items from search and product detail
- [ ] Adjust quantities
- [ ] Check-off mode with running total
- [ ] "Compare all" opens basket optimization
- [ ] Lists persist across app restarts
- [ ] Empty state ("Create your first list")
- [ ] Tests: list operations, persistence, UI states

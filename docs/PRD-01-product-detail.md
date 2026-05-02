# PRD: Product Detail Screen

## Status
Not started

## Problem
Users see a ranked list of offers on the home screen but can't understand *why* one store beats another. Without unit-price normalization, delivery/pickup tradeoff analysis, and price history, the comparison is shallow — same failure mode that killed Basket.

## User Story
> "I searched for chicken breast. MegaSave is cheapest at $4.99/lb but charges $5.49 delivery. ValueGrocer is $5.49/lb but free delivery over $30. Which is actually cheaper for my basket? And is $4.99/lb even a good price, or should I wait?"

## Route
`/product/[id]`

## States
| State | Trigger | UI |
|-------|---------|-----|
| Loading | Navigating to product | Skeleton cards |
| Found | Product exists with offers | Full detail view |
| Not found | Invalid product ID | "Product not found" + back to search |
| No offers | Product has 0 offers | "No offers available" + related products |
| Error | Network/data error | Error message + retry |

## Features

### 1. Store-by-store breakdown
Show each retailer's:
- Logo, name
- Base price
- Unit price (normalized)
- Effective price (after membership discount)
- Delivery fee and free delivery threshold
- Pickup availability
- Stock status + sale badge
- Rank (1st, 2nd, etc.)

### 2. Unit price normalization
**Critical feature that killed Basket when done wrong.**

Mapping table for unit conversions:
```
oz → lb: divide by 16
fl oz → gal: divide by 128
ml → L: divide by 1000
g → kg: divide by 1000
each → per unit: pass through
ct (count) → per item: divide price by count
```

Display logic:
- If all offers use the same unit → show that unit
- If mixed units → normalize to most common denominator
- Always show original unit in parentheses for verification

### 3. Delivery vs. pickup comparison
- Side-by-side cost comparison card
- For each retailer: total cost = item price + delivery fee (or $0 for pickup)
- "Free delivery if you add $X more" nudges
- Pickup availability indicator

### 4. Membership savings calculator
- Show price with and without membership discount
- Annual membership cost / savings break-even
- "You'd save $0.21 with FreshPass on this item"

### 5. Price history chart (Phase 2)
- 90-day line chart, one line per retailer
- Requires persistent price storage
- Horizontal line: "your target price"
- "This is 12% below the 90-day average" insight

### 6. "Is this a good deal?" indicator
- 🟢 Green: ≥15% below historical average
- 🟡 Yellow: within 15% of average
- 🔴 Red: ≥15% above average
- ⚪ Grey: insufficient data (new product)

### 7. Actions
- **Add to list** → save to shopping list
- **Set price alert** → notify when below $X
- **Share** → send product comparison to someone

## Technical Design

### Data flow
```
productId → searchProducts (already in lib/compare.ts)
         → compareOffers(product, useMembership)
         → render ProductDetail with RankedOffer[]
```

### Unit normalization function (new)
```typescript
// lib/units.ts
type Unit = 'oz' | 'lb' | 'fl_oz' | 'gal' | 'ml' | 'L' | 'g' | 'kg' | 'each' | 'ct';

function normalizeUnit(value: number, from: Unit, to: Unit): number;
function inferUnit(unitString: string): Unit;
function formatNormalizedPrice(price: number, unit: Unit): string;
```

### Price history (Phase 2)
```typescript
// lib/history.ts
type PriceRecord = {
  productId: string;
  retailerId: string;
  price: number;
  date: string; // ISO
};

function savePrice(record: PriceRecord): Promise<void>;
function getPriceHistory(productId: string, days: number): Promise<PriceRecord[]>;
function getPriceStats(history: PriceRecord[]): { avg: number; min: number; max: number };
```

### Component tree
```
ProductDetailScreen
├── ProductHeader (emoji, name, category)
├── BestPickBanner (reuse existing)
├── UnitPriceSummary (average unit price across stores)
├── OfferBreakdownList
│   └── OfferDetailCard (per retailer)
│       ├── RetailerInfo (logo, name)
│       ├── PriceBreakdown (base, unit, effective)
│       ├── FulfillmentInfo (delivery, pickup)
│       └── MembershipInfo (discount, break-even)
├── DeliveryVsPickupCard (side-by-side)
├── PriceHistoryChart (Phase 2)
└── ActionBar (add to list, alert, share)
```

## Dependencies
- Existing: `lib/compare.ts`, `lib/data.ts`, `components/BestPickBanner.tsx`, `components/OfferCard.tsx`
- New: `lib/units.ts`, `lib/history.ts` (Phase 2)
- New: `components/OfferDetailCard.tsx`, `components/UnitPriceSummary.tsx`

## Acceptance Criteria
- [ ] Navigate from home screen offer card to product detail
- [ ] All 4 retailers shown with price, unit price, delivery/pickup
- [ ] Unit prices normalized when mixed units present
- [ ] Membership discount shown when toggle is on
- [ ] Best pick clearly highlighted
- [ ] Back navigation returns to search results (preserving state)
- [ ] Loading, empty, and error states all handled
- [ ] Tests: unit (units.ts), integration (components), UI (screen states)

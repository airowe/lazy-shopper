# Lazy Shopper — Product Roadmap

## Competitive Landscape (from market research)

| App | Price Compare | Shopping List | Unit Pricing | Crowdsourced | Status |
|-----|:---:|:---:|:---:|:---:|--------|
| **Basket** | ✓ | ✗ | ✗ (broken) | ✓ | Dead — acquired, shut down |
| **Flipp** | Partial* | ✓ | ✗ | ✗ | 50M+ downloads, $200M rev |
| **AnyList** | Manual only | ✓ | ✗ | ✗ | 78K ratings, 4.9★ |
| **Bring!** | Minimal | ✓ | ✗ | ✗ | 9.7K ratings, 4.8★ |
| **Instacart** | Workaround | ✗ | ✗ | ✗ | Marked up 10-30% |
| **Store apps** | Single-store | ✗ | ✗ | ✗ | Siloed per chain |
| **Lazy Shopper** | ✓ | ✗ | ✓ | ✗ | MVP — 4 retailers, mock data |

*Flipp only shows advertised sale prices, never regular shelf prices*

## The Gap
There is no functioning grocery price comparison app in 2026. Basket died because of bad unit-price normalization and stale crowdsourced data. Flipp only shows sales flyers. Users track prices in spreadsheets and notepads. r/Frugal (4.5M subscribers) has 12 years of posts asking for exactly this.

## User Profile
- Shops at 3-6 grocery stores in rotation
- Spends ~$475/mo on groceries (US average)
- Manually compares prices or just guesses
- Would switch stores for 15%+ savings
- Willing to pay $3-5/mo for $48/mo in savings (10-16x ROI)

---

## Priority Tiers

### Tier 1 — Core Value Prop (next 2 sprints)
These are what make the app worth using vs. a spreadsheet.

### Tier 2 — Engagement & Retention
These keep users coming back weekly and convert free → paid.

### Tier 3 — Growth & Scale
These solve the data freshness problem and enable network effects.

---

## Tier 1: Product Detail & Basket Optimization

### 1. Product Detail Screen

**Route:** `/product/:id`

**Problem:** Users can see a ranked list of offers but can't dive into *why* one store is better than another. No unit-price breakdown, no delivery vs. pickup tradeoff analysis, no historical price context.

**Features:**

- **Store-by-store breakdown** — show each retailer's price, unit price, and effective price after fees/discounts
- **Unit price normalization** — automatically convert and display all prices in a consistent unit (price per oz, per lb, etc.) regardless of how the retailer lists it
- **Delivery vs. pickup comparison** — side-by-side cost including delivery fee, free delivery threshold, pickup availability
- **Membership savings calculator** — show price with and without membership discount, break-even on membership cost
- **Price history chart** — 90-day price trend for this product at each retailer (requires data over time)
- **"Is this a good deal?" indicator** — green/yellow/red based on historical price ranges
- **Sale alert toggle** — notify me when this product drops below $X
- **Add to list** — save to shopping list

**States:** loading, product found, product not found, no offers available, offline

**Technical notes:**
- Unit normalization needs a mapping table (oz → lb, ml → fl oz, each → per unit, etc.)
- Price history requires persistent storage — start with AsyncStorage, migrate to SQLite at scale

---

### 2. Basket Optimization

**Route:** `/basket` (when list has items)

**Problem:** Users shop at multiple stores but can't determine which items to buy where to minimize total cost. They either buy everything at one store (overpay) or guess at splitting (waste time).

**Features:**

- **Add items to a basket** — from search results, product detail, or manual entry
- **Multi-store optimization algorithm** — given a basket of items, compute the cheapest way to allocate them across stores, factoring in:
  - Item prices at each store
  - Delivery fees (and free delivery thresholds)
  - Minimum basket size per store ($10 minimum, etc.)
  - Time/effort cost (user-configurable: "I'll visit max 2 stores")
- **Split-cart recommendation** — "Buy milk, eggs, bread at ValueGrocer ($8.47). Buy chicken, rice, coffee at MegaSave ($14.22). Total: $22.69. Savings: $4.31 vs. single store."
- **Estimated total savings** — prominently display savings vs. single-store baseline
- **Share basket** — send to partner/roommate
- **"Add to cart" links** — deep-link to each retailer's website/app (where supported)

**States:** empty basket, optimizing (loading), results, no viable split found

**Algorithm notes:**
- This is a variant of the "minimum cost multi-source procurement" problem
- For small baskets (<15 items, <5 stores), brute force all combinations
- For larger baskets, use a greedy heuristic: assign each item to its cheapest available store, then merge/redistribute to hit delivery thresholds
- Store as a pure function with strong test coverage

---

## Tier 2: Saved Lists, Preferences & Alerts

### 3. Saved List / Shopping List

**Route:** `/list` or `/list/:id`

**Problem:** Users build the same grocery list every week. Re-entering items is tedious. No way to save and re-run comparisons.

**Features:**

- **Create/save lists** — name, icon, optional store preference
- **Add items** — from search, product detail, barcode scan (future), or free text
- **Recurring lists** — "Weekly Groceries", "Costco Run", "Party Supplies"
- **Compare entire list** — one-tap re-run comparison for all items
- **Check-off mode** — mark items as purchased, see running total
- **List history** — past lists with prices paid (builds personal price database)
- **Share lists** — real-time sync with household members
- **Quick-add suggestions** — based on purchase history, "You usually buy milk on Sundays"

**States:** empty, loading, list view, edit mode, compare results

**Technical notes:**
- Use AsyncStorage for MVP, migrate to SQLite or backend when needed
- Real-time sync via simple polling for MVP, WebSockets later

---

### 4. Store Filters & Preferences

**Route:** `/preferences`

**Problem:** Users have preferred stores, distance limits, and delivery preferences. The current comparison treats all stores equally, producing irrelevant results.

**Features:**

- **Preferred stores** — toggle which retailers to include/exclude
- **Max distance** — slider or zip code (mock for MVP, real geolocation later)
- **Delivery only / Pickup only / Both** — filter by fulfillment method
- **Membership pricing toggle** — already exists, move here and persist
- **Minimum savings threshold** — "Only show me a different store if I save at least $2"
- **Max stores per trip** — "I'll visit at most 2 stores"

**Persistence:** Save to AsyncStorage, apply as filters to comparison engine

---

### 5. Price Drop & Restock Alerts

**Route:** configured from product detail or saved list

**Problem:** Users want to know when an item they care about drops in price or comes back in stock. Without alerts, they have to manually check.

**Features:**

- **Set price target** — "Alert me when milk drops below $3.50"
- **Restock alert** — "Alert me when avocado is back in stock at QuickStop"
- **Weekly digest** — "Here's what changed in your saved items this week"
- **Push notification** — via Expo Notifications
- **Alert management** — list of active alerts, pause/resume, delete

**Technical notes:**
- MVP: check alerts on app open (compare current prices to targets)
- Production: server-side cron job checking prices daily
- Expo Notifications for push; test with `expo-notifications`

---

## Tier 3: Receipt Scanning, Settings & Weekly Runs

### 6. Receipt Scanning & Crowdsourced Prices

**Feature:** Users scan receipts to contribute real price data. This solves the #1 problem that killed Basket: stale/scraped data.

**Approach:**
- OCR via device camera (expo-camera + Vision API or on-device ML)
- Extract: store name, date, items, prices, quantities
- User confirms/corrects OCR output
- Contributed data feeds into the price database
- Gamification: "You've contributed 47 prices this month — top 5% of shoppers!"
- Privacy: strip personally identifiable data, aggregate before sharing

**Why this matters:** Research shows users explicitly want "Waze for groceries." This is the only way to get real prices for stores without APIs (Aldi, Trader Joe's, ethnic markets).

---

### 7. Settings & Account

**Route:** `/settings`

- **Location** — zip code (determines which stores and prices are relevant)
- **Notification preferences** — price alerts, weekly digest, restock alerts
- **Theme** — light/dark/system (already dark-only)
- **App info** — version, privacy policy, terms, feedback
- **Data management** — export my data, delete account

---

### 8. Weekly Grocery Run Flow

**Orchestrated flow:**

1. Open app → "Time for your weekly run?" (if recurring list exists)
2. Review saved list → add/remove items
3. Tap "Compare All" → basket optimization runs
4. See split-cart recommendation → "2 stores, save $11.43"
5. Check off items as you shop
6. End of trip → save prices paid, contribute to database

**This is the killer workflow** that turns a comparison tool into a weekly habit.

---

## Monetization Architecture

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 stores, manual search, basic comparison, ads |
| **Pro** | $4.99/mo or $39.99/yr | Unlimited stores, basket optimization, price alerts, price history, receipt scanning |
| **Family** | $7.99/mo or $59.99/yr | Pro + shared lists, household budget, pantry inventory |

**Rationale:** If the app saves a household $48/mo (10% of $475), $5/mo is a 10x ROI. AnyList charges $10-15/yr with 78K ratings — users pay for grocery utility.

---

## Immediate Next Steps

1. **Product Detail** — highest impact, lowest complexity, builds on existing comparison engine
2. **Basket Optimization** — the core differentiator no competitor has
3. **Saved Lists** — enables the weekly grocery run habit loop
4. **Store Preferences** — makes results personally relevant

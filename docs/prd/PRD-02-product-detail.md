# PRD-02 — Product Detail

## Goal
The kid tapped an offer card. This screen answers "tell me everything, and let me act." Store-by-store breakdown, save it, get alerted when it drops, send it to a parent. The app never spends money — every "buy" path opens the retailer in the browser.

## The screen

```
┌─────────────────────────────┐
│  ‹ Back                      │
│                              │
│        [ product image ]     │
│                              │
│  LEGO Minecraft              │
│  The Ender Dragon 21595      │
│  797 pieces · Ages 9+        │
│                              │
│  Best pick                   │
│  ┌─────────────────────────┐ │
│  │ Amazon  $56.99   ⭐⚡     │ │
│  │ 1–2 days · free $35+    │ │
│  │ [ Open on Amazon → ]    │ │
│  └─────────────────────────┘ │
│                              │
│  All stores                  │
│  Target   $59.99  2–4 days   │
│  LEGO     $59.99  3–5 days   │
│                              │
│  ┌──────────┐ ┌────────────┐ │
│  │ ♥ Save   │ │ 🔔 Alert me │ │
│  └──────────┘ └────────────┘ │
│  ┌─────────────────────────┐ │
│  │   Send to a grown-up    │ │
│  └─────────────────────────┘ │
│                              │
│  Prices updated 1 day ago    │
└─────────────────────────────┘
```

## Sections

**Header** — image, full name, key specs (piece count, age range, brand). Specs come straight from `Product`; show only the fields that exist.

**Best pick** — the rank-1 offer from `rankOffers` (PRD-05), called out with its badges and a primary **"Open on {store} →"** button. Tapping it opens `offer.url` in the system browser (`expo-web-browser` / `Linking`). No in-app webview checkout. This is the only money path and it hands off to the retailer.

**All stores** — every other offer, ranked. Each row: store, price, shipping window, badges. Tapping a row opens that store's `offer.url`. Stale offers (PRD-05) show a small "Check before buying" tag. Out-of-stock offers are greyed, no open button, labeled "Out of stock".

**Actions** — three buttons:
- **Save** (♥) — add/remove this product from the wishlist (PRD-03). Toggles filled/outline. AsyncStorage-backed.
- **Alert me** (🔔) — open the price-alert flow (see below).
- **Send to a grown-up** — open the OS share sheet (see below).

**Freshness footer** — "Prices updated N days ago" from the freshest `capturedAt` among shown offers. Yellow if any shown offer is stale.

## Price alerts (folded in from the old PRD-04)

**Setting an alert**
- Tap "Alert me" → a simple sheet: "Tell me when it drops below $___". Pre-filled with a sensible default — $5 under the current best price, rounded.
- One alert per product in v1. Re-tapping edits the existing alert. A filled bell means an alert is set.
- Stored in AsyncStorage: `{ productId, targetPrice, createdAt }`.

**When alerts fire**
- v1: checked **on app open**. On launch, for each saved alert, compare the current best in-stock `effectivePrice` to `targetPrice`. If at or below → fire a **local notification** (`expo-notifications`, local only, no push server): "Good news — The Ender Dragon dropped to $54.99 at Amazon."
- After firing, the alert is marked triggered so it doesn't re-fire every launch; it re-arms if the price goes back up.
- No server-side checking in v1. Real daily cron is phase 2.

**Managing alerts** — v1 has no dedicated alerts screen. An alert is visible/editable only from its product's detail screen (filled bell). A wishlist item shows a bell glyph if it has an alert. A standalone "my alerts" list is phase 2.

**Permissions** — ask for notification permission the first time the kid sets an alert, not on app launch. If denied, the alert is still saved and still shows a message in-app on next open ("The Ender Dragon is now $54.99!") — we just can't push.

## Send to a grown-up (folded in from old PRD-05)

**Why** — the kid finds a deal but can't and shouldn't buy it. This hands the decision to a parent.

**How** — the OS share sheet (`expo-sharing` / React Native `Share`). No parent account, no backend, no app-to-app messaging we operate.

**What gets shared** — plain text the parent can read in iMessage/email without our app:
```
Bowie wants this from Lazy Shopper:
LEGO Minecraft The Ender Dragon 21595
Best price: $56.99 at Amazon
https://www.amazon.com/s?k=lego+minecraft+21595
```
Product name + best in-stock offer (store, price, URL). No app-internal deep link in v1 — the parent gets a real retailer URL they can act on immediately.

## States
- **Loading** — near-instant (local catalog); spinner only if needed.
- **Loaded** — as above.
- **Product not found** — bad id (e.g. stale wishlist entry after a catalog change): "We can't find this anymore" + back button. PRD-03 also prunes these.
- **All offers stale-dropped / out of stock** — header still shows; "All stores" section shows the unbuyable state; Save still works, Alert still works (it'll fire when stock + price return).
- **Offline** — catalog is bundled so the screen renders; "Open on {store}" still launches the browser (which then handles offline itself).

## Out of scope (v1)
- In-app purchase / webview checkout
- Price history chart (no time-series data)
- Reviews, Q&A, long descriptions — the retailer page covers that
- Multiple alerts per product, alert on restock specifically (v1 alert is price-only; a back-in-stock alert is phase 2)
- A standalone alerts management screen

## Success criteria
- Bowie opens The Ender Dragon, sees Amazon flagged cheapest + fastest, taps "Open on Amazon", lands on Amazon in the browser
- He sets "alert me below $55", closes the app; next open after a (simulated) price drop, he gets a local notification
- He taps "Send to a grown-up", picks iMessage, his dad receives a readable message with a working link
- Nothing on the screen lets him spend money inside the app

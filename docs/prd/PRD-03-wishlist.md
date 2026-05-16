# PRD-03 — Wishlist

## Goal
A 10-year-old's wishlist *is* the core use case — the things he's saving up for or hoping someone buys him. But it doesn't earn a tab. It's a pull-up sheet from the home screen: one tap to see it, one tap to dismiss.

## Why a sheet, not a tab
PRD-00: one screen does the job. A tab bar implies multiple destinations of equal weight; the wishlist is secondary to search. A sheet keeps home as the single home and makes the wishlist feel like a drawer the kid opens, not a place he navigates to.

## The sheet

```
┌─────────────────────────────┐
│  ───                         │  ← grab handle
│  My Wishlist            ✕    │
│                              │
│  ┌─────────────────────────┐ │
│  │ [img] Ender Dragon 21595│ │
│  │ Best: $56.99 Amazon  🔔 │ │  ← bell if an alert is set
│  ├─────────────────────────┤ │
│  │ [img] Creeper Plush 8"  │ │
│  │ Best: $19.99 Target     │ │
│  │ ↓ $3 cheaper than saved │ │  ← price-drop note
│  ├─────────────────────────┤ │
│  │ [img] Beyblade Xtreme   │ │
│  │ Best: $49.99 Amazon     │ │
│  └─────────────────────────┘ │
└─────────────────────────────┘
```

## Behavior

**Opening** — a ♥ button on the home screen opens the sheet (`@gorhom/bottom-sheet` or the RN modal sheet). Swipe down or ✕ closes it.

**Adding / removing** — items are added/removed from product detail's Save button (PRD-02). The wishlist sheet itself supports remove via swipe-left or a small ✕ per row. No "add" affordance inside the sheet — you add from a product.

**Each row** shows: image, product name, current best in-stock price + store, an alert bell if an alert exists, and a price-drop note if the current best price is below the price recorded when the item was saved.

**Tapping a row** → product detail (PRD-02). Sheet dismisses.

**Empty state** — "Nothing saved yet. Find something you want and tap ♥." Friendly, with the heart glyph.

## Persistence

AsyncStorage. One key, a JSON array:

```ts
type WishlistEntry = {
  productId: string;
  savedAt: string;        // ISO — when added
  priceWhenSaved: number; // best in-stock effectivePrice at save time
};
```

- `priceWhenSaved` is the snapshot the price-drop note compares against.
- Max **50** items. At 50, Save shows "Wishlist is full" — generous ceiling, just guards runaway storage.
- Order: most-recently-saved first.

**Pruning** — on app open, drop entries whose `productId` no longer exists in the catalog (a product was removed/discontinued between app versions). Silent; the kid never sees a broken row.

## Price-drop note
For each row, compare current best in-stock `effectivePrice` (via `rankOffers`, PRD-05) to `priceWhenSaved`:
- Cheaper → "↓ $N cheaper than when you saved it" (green).
- Same or higher → no note (don't nag with bad news).
- This is display-only. The *actionable* version is price alerts (PRD-02) — the note is passive, the alert is a push.

## Relationship to alerts
Wishlist and alerts are independent. You can save without an alert and alert without saving (alert is set from product detail regardless). The wishlist row just *surfaces* whether an alert exists, as a bell glyph, for convenience.

## States
- **Empty** — friendly empty state.
- **Populated** — rows, most-recent first.
- **Item now unbuyable** — product still in catalog but all offers out of stock/stale: row shows "Currently unavailable" instead of a price, still tappable.
- **Offline** — renders from AsyncStorage + bundled catalog; images may placeholder.

## Out of scope (v1)
- Multiple named lists ("birthday", "saved up for") — one wishlist
- Sharing the whole wishlist (send-to-parent is per-product, PRD-02)
- Reordering by hand, sorting options
- Sync across devices (no accounts)
- Notes/priority per item

## File
`lib/wishlist/` — storage module (`getWishlist`, `addToWishlist`, `removeFromWishlist`, `pruneWishlist`) wrapping AsyncStorage, pure-ish and testable with a mocked store. Sheet component under `components/`.

## Success criteria
- Bowie saves three things, closes and reopens the app, all three are still there
- A saved item that's since dropped in price shows the green "$N cheaper" note
- Removing the LEGO theme from a future catalog build doesn't leave a broken wishlist row
- The wishlist never becomes a tab

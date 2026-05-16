# PRD-01 — Search & Ranked Offers (Home)

## Goal
The one screen. A kid types what they want, taps a button, sees where to get it cheapest, fastest, and most reliably. Everything else in the app is a detail view or a sheet reached from here.

## The screen

```
┌─────────────────────────────┐
│  Lazy Shopper                │  ← wordmark, blocky type, small
│                              │
│  What do you want?           │
│  ┌─────────────────────────┐ │
│  │ creeper plush         ✕ │ │  ← text input
│  └─────────────────────────┘ │
│  ┌─────────────────────────┐ │
│  │      Find it →          │ │  ← primary CTA
│  └─────────────────────────┘ │
│                              │
│  Best pick: Target $19.99    │  ← insight bar (after a search)
│                              │
│  ┌─────────────────────────┐ │
│  │ [img] Creeper Plush 8"  │ │  ← offer cards, ranked
│  │ Target  $19.99  ⭐Best   │ │
│  │ 2–4 days · free $35+    │ │
│  ├─────────────────────────┤ │
│  │ Walmart $21.47          │ │
│  │ Amazon  $22.99  ⚡Fast   │ │
│  └─────────────────────────┘ │
│                              │
│              [♥ Wishlist]    │  ← opens wishlist sheet
└─────────────────────────────┘
```

## Behavior

**Input**
- Single text field. Placeholder: "What do you want?"
- Clear (✕) button when non-empty.
- Submit via the button or the keyboard return key — both do the same thing.

**On submit**
1. Trim the query. If empty → show "Type something first." inline, no navigation, warning haptic.
2. Call `search(query)` from `lib/catalog`.
3. If results: render the first product's offers as ranked cards (one product per search in v1 — see below), update the insight bar, success haptic.
4. If no results: show "Couldn't find that. Try: creeper plush, ender dragon, beyblade" with three real example queries from the catalog. Error haptic.

**One product per search (v1 simplification)**
The catalog is small; a query like "lego" matches many products. v1 shows the **top-ranked product's offers**, not a product picker. If the kid's query is ambiguous, the example suggestions guide them to be specific. A product-list intermediate screen is a phase-2 add if Bowie keeps landing on the wrong product.

**Ranked offer cards**
Each card shows: store name + logo, price, shipping window or "in-store only", free-shipping threshold, in-stock state. Ranking and badges per PRD-05. Out-of-stock offers render greyed at the bottom, not hidden — the kid still learns the store carries it.

**Insight bar**
One line above the cards: "Best pick: {store} ${price}". The single most important takeaway. Tapping it scrolls to that card.

**Tapping a card** → product detail (PRD-02).

## States
- **Initial** — wordmark, input, CTA, no cards. Maybe one line of help text.
- **Searching** — brief; catalog is local so this is near-instant. A spinner only if it ever isn't.
- **Results** — insight bar + ranked cards.
- **No match** — friendly message + 3 example queries.
- **Empty input** — inline nudge.
- **Offline** — catalog is bundled, so search works offline. Images may not load; show a placeholder block. No error screen.

## Out of scope (v1)
- Autocomplete / search suggestions while typing
- Search history
- Browse-by-category (no category grid; the kid types)
- Comparing multiple products side by side
- Voice search

## Future: on-device fuzzy search
v1 search is exact substring matching (`lib/catalog` `search()`). A 10-year-old will mistype ("creper", "the dragon lego") and get zero results. The clean fix is an **on-device LLM** mapping a fuzzy query to a catalog product — Apple Foundation Models (iOS 18.2+, free, private, no network) via a small Expo native module. Deferred from v1 because: the catalog is ~17 items so exact matching covers it, and the native-module work contradicts PRD-00's "lazy, minimal" principle for a problem we don't have yet. Revisit when the catalog passes ~100 items or when we observe Bowie missing searches.

## Success criteria
- Bowie types "ender dragon", taps once, sees 3 stores ranked, with Amazon flagged cheapest
- A no-match query gives him a usable next step, never a dead end
- The screen never shows more than one primary action

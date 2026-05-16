# PRD-05 — Ranking Algorithm

## Goal
Given a product's offers, decide the order they appear in and which badges they earn. The ranking is the app's intelligence — it's what makes this better than opening six tabs.

## Inputs
A `Product` and its `Offer[]` from `lib/catalog`. Each offer has: `price`, `inStock`, `shippingDays`, `freeShippingThreshold`, `unitPrice`, `capturedAt`, `storeId`. Plus the `Store` for `rating`.

## Pure function
Ranking is a pure function — `rankOffers(product, offers, stores) → RankedOffer[]` — with strong test coverage. No dates from `Date.now()` passed implicitly; the staleness cutoff takes an explicit `now` argument so tests are deterministic.

```ts
type RankedOffer = {
  offer: Offer;
  store: Store;
  badges: Badge[];
  stale: boolean;          // capturedAt older than 14 days
  effectivePrice: number;  // price used for ranking — see below
};

type Badge = 'best-value' | 'fastest' | 'closest' | 'top-rated';
```

## Sort order
1. **In-stock offers first**, out-of-stock last. An out-of-stock offer the kid can't buy never outranks one they can.
2. Within each group, sort by **effective price ascending** (cheapest first).
3. Tiebreak on price: higher store `rating` first.
4. Tiebreak again: faster `shippingDays.min` first.
5. Final tiebreak: alphabetical by store name (stable, deterministic).

## Effective price
The number used for ranking — not always the sticker price.

- Start with `offer.price`.
- If `offer.price` is **below** `offer.freeShippingThreshold`, the kid pays shipping. v1 has no real shipping-cost data, so we **don't** add a fee — but a sub-threshold offer does **not** earn the `best-value` badge if a near-priced offer clears free shipping. (See badges.)
- `membershipPrice` is **ignored** for ranking in v1 — a kid isn't a Prime member. It can show on product detail as info, but it doesn't move the rank.

So in v1, `effectivePrice === offer.price`. The field exists so phase-2 fee modeling has a home without re-plumbing.

## Badges
At most one of each badge across the whole offer set. A single offer can hold multiple badges.

- **`best-value`** — the in-stock offer with the lowest `effectivePrice`. If two offers are within $1.00 of each other and one clears its free-shipping threshold while the other doesn't, the free-shipping one wins the badge even if a few cents higher. Never awarded to an out-of-stock offer.
- **`fastest`** — the in-stock offer with the lowest `shippingDays.min`. Suppressed if all in-stock offers share the same `shippingDays.min` (no point flagging "fastest" when everything ties). Offers with no `shippingDays` (in-store only) are not eligible.
- **`closest`** — v1 has no geolocation, so **not awarded in v1**. The badge type exists for when location lands. Until then `rankOffers` never emits it.
- **`top-rated`** — the in-stock offer whose `store.rating` is the highest, *and* at least 0.3 above the set's average store rating (only flag it when it's meaningfully better). Suppressed otherwise.

## Staleness
- `stale = true` when `capturedAt` is more than **14 days** before `now`.
- Offers more than **30 days** old are dropped from ranking entirely (the product can still appear; that store just doesn't show). This is a filter applied before sorting.
- A stale-but-shown offer keeps its badges but the UI marks it "Check before buying" (PRD-01/02).

## Edge cases
- **One offer only** — it ranks first, earns `best-value` if in stock, no `fastest`/`top-rated` (nothing to compare against). PRD-04 says products need ≥2 offers to ship, so this mainly guards against all-but-one being stale-dropped.
- **All offers out of stock** — sorted by price, no `best-value`/`fastest`/`top-rated` badges. UI shows "Nobody has this in stock right now."
- **All offers stale-dropped** — `rankOffers` returns `[]`. PRD-01 treats this like no-match for that product.
- **Zero offers** — returns `[]`.

## Out of scope (v1)
- Real shipping-fee arithmetic (needs fee data)
- Membership-price-aware ranking
- Distance/drive-time ranking (needs geolocation)
- Price-history-aware "good deal" scoring (needs time-series data)
- Personalized ranking (preferred stores) — there are no preferences in v1

## File
`lib/ranking/rankOffers.ts` + `lib/ranking/rankOffers.spec.ts`. Pure, no React, no storage, no network.

## Success criteria
- For the Creeper Plush, Target ($19.99, in stock) ranks above Amazon ($22.99) and earns `best-value`; Amazon earns `fastest` (1–2 days vs 2–4)
- For an all-out-of-stock product, no `best-value` badge appears anywhere
- `rankOffers` called twice with the same args returns identical output (deterministic)

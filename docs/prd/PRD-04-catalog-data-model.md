# PRD-04 — Catalog & Data Model

## Goal
Define the data shapes that the search, ranking, product detail, wishlist, and alerts features all read from. Define what's in the v1 Minecraft catalog and how it stays current.

## Data model

### `Product`
The thing a kid is shopping for. Identity is ours, not a retailer's.

```ts
type Product = {
  id: string;                    // 'lego-21263-deep-dark-battle'
  name: string;                  // 'LEGO Minecraft The Deep Dark Battle 21263'
  category: ProductCategory;
  subcategory?: string;          // 'Lego Set', 'Plush', 'Figure', 'Apparel', 'Game', 'Book'
  brand?: string;                // 'LEGO', 'Mattel', 'Mojang', 'Jinx'
  imageUrl: string;              // CDN URL we control or a stable retailer URL
  ageRange?: { min: number; max?: number };  // From manufacturer, not a filter
  pieceCount?: number;           // Lego-specific; null otherwise
  releaseYear?: number;
  identifiers: {                 // For matching across retailers
    upc?: string;
    asin?: string;               // Amazon
    legoSetNumber?: string;      // '21263'
    targetTcin?: string;
    walmartItemId?: string;
  };
};

type ProductCategory = 'minecraft' | 'lego' | 'beyblade';   // v1 categories. Schema-ready for 'pokemon', etc.
```

### `Store`
A retailer. Static catalog, not data.

```ts
type Store = {
  id: string;                    // 'amazon', 'target', 'walmart', 'lego', 'bestbuy', 'gamestop'
  name: string;                  // 'Amazon'
  logoUrl: string;
  rating: number;                // 1–5, our editorial trust score (returns, customer service)
  supportsPickup: boolean;
  supportsDelivery: boolean;
  membershipName?: string;       // 'Prime', 'Target Circle 360', 'Walmart+'
};
```

### `Offer`
A single retailer's price for a single product at a point in time. This is the heart of the app.

```ts
type Offer = {
  productId: string;
  storeId: string;
  price: number;                 // In USD, two decimal places
  currency: 'USD';
  url: string;                   // Deep link to the product page on the retailer
  inStock: boolean;
  shippingDays?: { min: number; max: number };  // null if in-store-only
  freeShippingThreshold?: number;                // 35 for Amazon non-Prime, 35 for Target, etc.
  membershipPrice?: number;      // Price for Prime / Target Circle / etc.
  unitPrice?: { value: number; unit: string };  // '$0.12/piece' for Lego, '$5.00/oz' for plush — see below
  capturedAt: string;            // ISO datetime — when this price was last verified
  source: 'manual' | 'amazon-pa' | 'target-redsky' | 'walmart-open' | 'scrape';
};
```

### Why these three shapes
- A `Product` is what the kid searches for. One `Product` has many `Offer`s.
- A `Store` is reference data — rarely changes.
- An `Offer` is the volatile data. Everything we care about — ranking, badges, alerts — derives from offers.

## Unit price
Only meaningful for things that come in countable variants. Examples:

- **Lego sets**: `$/piece` — `price / pieceCount`. Useful for comparing two sets you might both like.
- **Plush multi-packs**: `$/plush` — `price / packQuantity`.
- **Trading card booster bundles**: `$/pack`.

For everything else (a single plush, a t-shirt, a copy of the game), unit price is `null` and we don't show it. Don't fabricate units that don't help the comparison.

## V1 catalog scope

**~15–20 products, seeded with plausible-but-fake data.** Three categories Bowie cares about, broad enough to show the comparison UX working across product types:

- **Minecraft** — Lego sets, plushies, figures, the game itself
- **Lego (non-Minecraft)** — popular sets a 10yo would want (Star Wars, City, Technic)
- **Beyblade** — launchers, starter sets, stadiums, individual tops

Categories live on `Product.category` so search and (eventually) filtering can scope by category.

**Catalog audit (May 2026):** the first seed draft had fabricated and
mis-numbered products. The catalog was rebuilt from a verified product list —
every product now has a real name, real LEGO set number / Amazon ASIN, and is
released and buyable. Fabricated, mis-numbered, and unreleased-2026 entries
were dropped.

Prices come from `scripts/refresh-prices.ts`, which fetches live retailer
prices via the TinyFish Fetch API and regenerates `offers.ts`. A page that
blocks the fetch or yields no parseable price falls back to verified
manufacturer RRP (`source: 'manual'`); scraped prices are `source: 'scrape'`.
The hand-authored seed lives in `offers.seed.ts`.

**Each product needs at least one verified offer.** The earlier "≥2 retailers"
rule was relaxed: the audit could only verify a direct Amazon product page for
plush / Beyblade / game items, and fabricating a second retailer's offer to
hit the rule would violate "real prices or no prices." LEGO sets have two
offers (Amazon + LEGO Shop). Single-offer products show no cross-store
comparison until more retailers are verified — honest, if thinner.

Expansion happens once the v1 catalog is shipped. Phase 2 widens the catalog,
adds verified second-retailer offers, and improves scrape coverage.

## Where prices come from (by phase)

| Phase | Source | Freshness | Effort |
|---|---|---|---|
| **v1** | Manual snapshot, committed as JSON | Updated weekly by hand | High but bounded — 50 items × 6 stores = 300 lookups, ~2 hrs |
| **v2** | Real APIs: Amazon Product Advertising API, Target RedSky, Walmart Open API. Scrape Lego.com, Best Buy, GameStop where no API exists. | Hourly cron | Backend lift |
| **v3** | Same as v2 plus community-submitted price reports for the long tail | Mixed | Requires moderation |

V1 must work and feel real on manual data alone. If real prices land while we're still hand-curating, great — but don't gate v1 shipping on backend work.

## File layout

```
lib/
  catalog/
    products.ts          // Product[] — the 50 items
    stores.ts            // Store[] — the 6 retailers
    offers.ts            // Offer[] — every (product, store) pair we have data for
    index.ts             // search(query), getProduct(id), getOffersFor(productId)
```

All three files are plain TypeScript modules with typed exports. No JSON until we have a reason — TS gives us type checking on the seed data, which catches "I typed `'targt'` instead of `'target'`" at build time.

## Search behavior (catalog API, not UI)

```ts
search(query: string): Product[]
```

- Case-insensitive substring match against `name`, `brand`, `identifiers.legoSetNumber`
- No fuzzy matching in v1 — kid types "creeper plush," we match "Creeper Plush." If we need fuzziness, add it when we see Bowie miss a search.
- Empty query returns `[]`, not all products. The home screen handles "browse" separately if at all.
- Results sorted by: exact name match first, then by total offer count desc (more retailers = more useful product to rank).

## Freshness UI
Every offer card shows a relative "Updated 2 days ago" stamp derived from `capturedAt`. Offers older than 14 days get a yellow "Check before buying" indicator. Offers older than 30 days are hidden from ranking (the product can still appear; that retailer just doesn't show).

## Explicitly out of scope (this PRD)
- Price history time series (need a real backend)
- Reviews, Q&A, descriptions beyond name (kid uses the retailer page for that)
- Variant SKUs (color, size) — treated as separate `Product`s if they meaningfully differ in price; one `Product` otherwise
- Localization, non-USD currency, non-US retailers

## Resolved decisions
1. **Pickup fields dropped from v1.** `pickupAvailable` and `pickupDistanceMiles` need geolocation to be useful. Adding back when we wire location.
2. **Image hosting: hotlink to retailer CDNs in v1.** Fragile but fine for Bowie's device. Revisit before public TestFlight — copy to our own CDN if we go public.
3. **`Product.discontinued?: boolean` added.** Lego retires sets constantly. Discontinued products with no in-stock offers don't show in search.

import type { StoreId } from '../lib/catalog/types.ts';

// What to fetch for each product. `rrp` is the verified manufacturer list
// price (a sanity bound and the fallback when a fetch misses).
//
// Only direct product pages (productPage: true) are fetched and parsed.
// Every product here is audit-verified with a real Amazon /dp/ URL; LEGO
// sets also have an official LEGO.com product page.

export type FetchTarget = {
  storeId: StoreId;
  url: string;
  productPage: boolean;
};

export type ProductPlan = {
  productId: string;
  rrp: number;
  targets: FetchTarget[];
};

const amazon = (asin: string): FetchTarget => ({
  storeId: 'amazon',
  url: `https://www.amazon.com/dp/${asin}`,
  productPage: true,
});

const lego = (slug: string): FetchTarget => ({
  storeId: 'lego',
  url: `https://www.lego.com/en-us/product/${slug}`,
  productPage: true,
});

export const FETCH_PLAN: ProductPlan[] = [
  {
    productId: 'lego-21261-wolf-stronghold',
    rrp: 34.99,
    targets: [amazon('B0CV2KC5RL'), lego('the-wolf-stronghold-21261')],
  },
  {
    productId: 'lego-21260-cherry-blossom-garden',
    rrp: 27.99,
    targets: [amazon('B0CV297ML5'), lego('the-cherry-blossom-garden-21260')],
  },
  {
    productId: 'lego-75387-boarding-tantive-iv',
    rrp: 54.99,
    targets: [amazon('B0CGY4QJTC'), lego('boarding-the-tantive-iv-75387')],
  },
  {
    productId: 'minecraft-creeper-plush-8in',
    rrp: 14.99,
    targets: [amazon('B08HR84LWQ')],
  },
  {
    productId: 'minecraft-creeper-plush-16in',
    rrp: 24.99,
    targets: [amazon('B0CNJGRZVH')],
  },
  {
    productId: 'minecraft-cuutopia-creeper-plush',
    rrp: 19.99,
    targets: [amazon('B09QLGYM6T')],
  },
  {
    productId: 'minecraft-game-switch',
    rrp: 29.99,
    targets: [amazon('B07D13QGXM')],
  },
  {
    productId: 'beyblade-x-xtreme-battle-set',
    rrp: 39.99,
    targets: [amazon('B0CQ3HMP9M')],
  },
  {
    productId: 'beyblade-x-drop-attack-battle-set',
    rrp: 39.99,
    targets: [amazon('B0DN6YTNYZ')],
  },
  {
    productId: 'beyblade-x-sword-dran-starter',
    rrp: 9.99,
    targets: [amazon('B0CS8L1HGM')],
  },
];

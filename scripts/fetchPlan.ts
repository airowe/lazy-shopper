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
    targets: [
      amazon('B08HR84LWQ'),
      {
        storeId: 'walmart',
        url: 'https://www.walmart.com/ip/Minecraft-Basic-Plush-Creeper-Stuffed-Animal-8-inch-Soft-Doll-Inspired-by-Video-Game-Character/277349703',
        productPage: true,
      },
    ],
  },
  {
    productId: 'minecraft-creeper-plush-16in',
    rrp: 24.99,
    targets: [
      amazon('B0CNJGRZVH'),
      {
        storeId: 'walmart',
        url: 'https://www.walmart.com/ip/Minecraft-Creeper-16-in-Scale-Jumbo-Plush-Figure-with-Pixelated-Design-Game/12909910834',
        productPage: true,
      },
    ],
  },
  {
    productId: 'minecraft-cuutopia-creeper-plush',
    rrp: 19.99,
    targets: [
      amazon('B09QLGYM6T'),
      {
        storeId: 'target',
        url: 'https://www.target.com/p/mattel-minecraft-cuutopia-creeper-plush-10-inch-soft-rounded-pillow-doll/-/A-1001588773',
        productPage: true,
      },
    ],
  },
  {
    productId: 'minecraft-game-switch',
    rrp: 29.99,
    targets: [
      amazon('B07D13QGXM'),
      {
        storeId: 'target',
        url: 'https://www.target.com/p/minecraft-nintendo-switch/-/A-53662394',
        productPage: true,
      },
    ],
  },
  {
    productId: 'beyblade-x-xtreme-battle-set',
    rrp: 39.99,
    targets: [
      amazon('B0CQ3HMP9M'),
      {
        storeId: 'walmart',
        url: 'https://www.walmart.com/ip/Beyblade-X-Xtreme-Battle-Set-with-Beystadium-2-Right-Spinning-Battling-Tops-and-2-Launchers/5455100107',
        productPage: true,
      },
    ],
  },
  {
    productId: 'beyblade-x-drop-attack-battle-set',
    rrp: 39.99,
    targets: [
      amazon('B0DN6YTNYZ'),
      {
        storeId: 'target',
        url: 'https://www.target.com/p/beyblade-x-drop-attack-battle-set/-/A-93565570',
        productPage: true,
      },
    ],
  },
  {
    productId: 'beyblade-x-sword-dran-starter',
    rrp: 9.99,
    targets: [
      amazon('B0CS8L1HGM'),
      {
        storeId: 'gamestop',
        url: 'https://www.gamestop.com/toys-games/fidget-toys/products/hasbro-beyblade-x-dran-3-60f-starter-pack/20010503.html',
        productPage: true,
      },
    ],
  },
];

import type { StoreId } from '../lib/catalog/types.ts';

// What to fetch for each product. `rrp` is the verified manufacturer list
// price (a sanity bound and the fallback when a fetch misses or is skipped).
//
// Only direct product pages (productPage: true) are fetched and parsed.
// Search/listing URLs (productPage: false) list many products and cannot
// yield one product's price reliably — they keep the RRP fallback. LEGO.com
// and Amazon /dp/ pages parse cleanly; other product pages are best-effort.

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

const lego = (url: string): FetchTarget => ({
  storeId: 'lego',
  url,
  productPage: true,
});

export const FETCH_PLAN: ProductPlan[] = [
  {
    productId: 'lego-21274-warden-encounter',
    rrp: 19.99,
    targets: [
      lego('https://www.lego.com/en-us/product/the-warden-encounter-21274'),
      { storeId: 'amazon', url: 'https://www.amazon.com/dp/B0DRW63X1Z', productPage: true },
      { storeId: 'target', url: 'https://www.target.com/p/-/A-94152734', productPage: true },
    ],
  },
  {
    productId: 'lego-21265-crafting-table',
    rrp: 89.99,
    targets: [
      lego('https://www.lego.com/en-us/product/the-crafting-table-21265'),
      { storeId: 'amazon', url: 'https://www.amazon.com/dp/B0CRX64YFN', productPage: true },
      {
        storeId: 'bestbuy',
        url: 'https://www.bestbuy.com/product/lego-minecraft-the-crafting-table-build-and-display-set-for-adults-21265/JXPLL2Q4W5',
        productPage: true,
      },
    ],
  },
  {
    productId: 'lego-21592-chicken-rider',
    rrp: 9.99,
    targets: [
      lego('https://www.lego.com/en-us/product/chicken-rider-desert-attack-21592'),
      { storeId: 'walmart', url: 'https://www.walmart.com/search?q=lego+minecraft+21592', productPage: false },
      { storeId: 'target', url: 'https://www.target.com/s?searchTerm=lego+minecraft+21592', productPage: false },
    ],
  },
  {
    productId: 'lego-21593-surviving-first-night',
    rrp: 14.99,
    targets: [
      lego('https://www.lego.com/en-us/product/surviving-the-first-night-21593'),
      { storeId: 'amazon', url: 'https://www.amazon.com/s?k=lego+minecraft+21593', productPage: false },
    ],
  },
  {
    productId: 'lego-21595-ender-dragon',
    rrp: 59.99,
    targets: [
      lego('https://www.lego.com/en-us/product/the-ender-dragon-21595'),
      { storeId: 'amazon', url: 'https://www.amazon.com/s?k=lego+minecraft+21595', productPage: false },
      { storeId: 'target', url: 'https://www.target.com/s?searchTerm=lego+minecraft+21595', productPage: false },
    ],
  },
  {
    productId: 'lego-21597-ghast-station',
    rrp: 29.99,
    targets: [
      lego('https://www.lego.com/en-us/product/ghast-station-21597'),
      { storeId: 'walmart', url: 'https://www.walmart.com/search?q=lego+minecraft+21597', productPage: false },
    ],
  },
  {
    productId: 'lego-75408-mandalorian-grogu-speeder',
    rrp: 9.99,
    targets: [
      lego('https://www.lego.com/en-us/product/din-djarin-and-grogu-s-speeder-bike-75408'),
      { storeId: 'target', url: 'https://www.target.com/s?searchTerm=lego+star+wars+75408', productPage: false },
    ],
  },
  {
    productId: 'lego-75409-cobb-vanth-cad-bane',
    rrp: 34.99,
    targets: [
      lego('https://www.lego.com/en-us/product/75409'),
      { storeId: 'amazon', url: 'https://www.amazon.com/s?k=lego+star+wars+75409', productPage: false },
    ],
  },
  {
    productId: 'lego-60440-city-coast-guard',
    rrp: 14.99,
    targets: [
      lego('https://www.lego.com/en-us/product/60440'),
      { storeId: 'walmart', url: 'https://www.walmart.com/search?q=lego+city+60440', productPage: false },
    ],
  },
  {
    productId: 'lego-42231-fast-furious-charger',
    rrp: 159.99,
    targets: [
      lego('https://www.lego.com/en-us/product/42231'),
      { storeId: 'amazon', url: 'https://www.amazon.com/s?k=lego+technic+42231', productPage: false },
    ],
  },
  // --- best-effort: Minecraft non-Lego ---
  {
    productId: 'minecraft-creeper-plush-8in',
    rrp: 24.95,
    targets: [
      { storeId: 'amazon', url: 'https://www.amazon.com/dp/B08HR84LWQ', productPage: true },
      { storeId: 'target', url: 'https://www.target.com/p/-/A-81510710', productPage: true },
      { storeId: 'walmart', url: 'https://www.walmart.com/search?q=minecraft+creeper+plush', productPage: false },
    ],
  },
  {
    productId: 'minecraft-enderman-plush-7in',
    rrp: 19.99,
    targets: [
      { storeId: 'amazon', url: 'https://www.amazon.com/dp/B00F65I83A', productPage: true },
      { storeId: 'walmart', url: 'https://www.walmart.com/search?q=minecraft+enderman+plush', productPage: false },
    ],
  },
  {
    productId: 'minecraft-game-switch',
    rrp: 29.99,
    targets: [
      { storeId: 'amazon', url: 'https://www.amazon.com/dp/B07D13QGXM', productPage: true },
      {
        storeId: 'gamestop',
        url: 'https://www.gamestop.com/video-games/nintendo-switch/products/minecraft---nintendo-switch/171236.html',
        productPage: true,
      },
      { storeId: 'target', url: 'https://www.target.com/s?searchTerm=minecraft+nintendo+switch', productPage: false },
    ],
  },
  {
    productId: 'minecraft-game-xbox',
    rrp: 19.99,
    targets: [
      { storeId: 'gamestop', url: 'https://www.gamestop.com/search/?q=minecraft+xbox', productPage: false },
      { storeId: 'bestbuy', url: 'https://www.bestbuy.com/site/searchpage.jsp?st=minecraft+xbox', productPage: false },
    ],
  },
  // --- best-effort: Beyblade X ---
  {
    productId: 'beyblade-x-xtreme-battle-set',
    rrp: 54.99,
    targets: [
      { storeId: 'amazon', url: 'https://www.amazon.com/dp/B0CS8CM4YB', productPage: true },
      { storeId: 'target', url: 'https://www.target.com/s?searchTerm=beyblade+x+xtreme+battle+set', productPage: false },
      { storeId: 'walmart', url: 'https://www.walmart.com/search?q=beyblade+x+xtreme+battle+set', productPage: false },
    ],
  },
  {
    productId: 'beyblade-x-rage-ragna-starter',
    rrp: 14.99,
    targets: [
      { storeId: 'amazon', url: 'https://www.amazon.com/s?k=beyblade+x+rage+ragna', productPage: false },
      { storeId: 'target', url: 'https://www.target.com/s?searchTerm=beyblade+x+rage+ragna', productPage: false },
    ],
  },
  {
    productId: 'beyblade-x-clip-rip-launcher',
    rrp: 29.99,
    targets: [
      { storeId: 'amazon', url: 'https://www.amazon.com/s?k=beyblade+x+clip+rip+launcher', productPage: false },
      { storeId: 'walmart', url: 'https://www.walmart.com/search?q=beyblade+x+clip+rip+launcher', productPage: false },
    ],
  },
];

import type { Offer } from './types';

// Hand-authored seed offers. The price-refresh script (scripts/refresh-prices.ts)
// reads this for stable per-(product,store) facts — shipping window, free-
// shipping threshold, in-stock — and regenerates offers.ts with live prices.
//
// Prices here are verified manufacturer RRP as of the audit (May 2026).
// Every product has a verified Amazon offer; LEGO sets also have LEGO Shop.

const CAPTURED = '2026-05-17';

const FREE_SHIP_AMAZON = 35;
const FREE_SHIP_LEGO = 35;
const FREE_SHIP_TARGET = 35;
const FREE_SHIP_WALMART = 35;
const FREE_SHIP_GAMESTOP = 59;

export const SEED_OFFERS: Offer[] = [
  // --- LEGO Minecraft The Wolf Stronghold 21261 (RRP $34.99) ---
  {
    productId: 'lego-21261-wolf-stronghold',
    storeId: 'amazon',
    price: 34.99,
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B0CV2KC5RL',
    inStock: true,
    shippingDays: { min: 1, max: 2 },
    freeShippingThreshold: FREE_SHIP_AMAZON,
    unitPrice: { value: 0.11, unit: 'piece' },
    capturedAt: CAPTURED,
    source: 'manual',
  },
  {
    productId: 'lego-21261-wolf-stronghold',
    storeId: 'lego',
    price: 34.99,
    currency: 'USD',
    url: 'https://www.lego.com/en-us/product/the-wolf-stronghold-21261',
    inStock: true,
    shippingDays: { min: 3, max: 5 },
    freeShippingThreshold: FREE_SHIP_LEGO,
    unitPrice: { value: 0.11, unit: 'piece' },
    capturedAt: CAPTURED,
    source: 'manual',
  },

  // --- LEGO Minecraft The Cherry Blossom Garden 21260 (RRP $27.99) ---
  {
    productId: 'lego-21260-cherry-blossom-garden',
    storeId: 'amazon',
    price: 27.99,
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B0CV297ML5',
    inStock: true,
    shippingDays: { min: 1, max: 2 },
    freeShippingThreshold: FREE_SHIP_AMAZON,
    unitPrice: { value: 0.09, unit: 'piece' },
    capturedAt: CAPTURED,
    source: 'manual',
  },
  {
    productId: 'lego-21260-cherry-blossom-garden',
    storeId: 'lego',
    price: 27.99,
    currency: 'USD',
    url: 'https://www.lego.com/en-us/product/the-cherry-blossom-garden-21260',
    inStock: true,
    shippingDays: { min: 3, max: 5 },
    freeShippingThreshold: FREE_SHIP_LEGO,
    unitPrice: { value: 0.09, unit: 'piece' },
    capturedAt: CAPTURED,
    source: 'manual',
  },

  // --- LEGO Star Wars Boarding the Tantive IV 75387 (RRP $54.99) ---
  {
    productId: 'lego-75387-boarding-tantive-iv',
    storeId: 'amazon',
    price: 54.99,
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B0CGY4QJTC',
    inStock: true,
    shippingDays: { min: 1, max: 2 },
    freeShippingThreshold: FREE_SHIP_AMAZON,
    unitPrice: { value: 0.11, unit: 'piece' },
    capturedAt: CAPTURED,
    source: 'manual',
  },
  {
    productId: 'lego-75387-boarding-tantive-iv',
    storeId: 'lego',
    price: 54.99,
    currency: 'USD',
    url: 'https://www.lego.com/en-us/product/boarding-the-tantive-iv-75387',
    inStock: true,
    shippingDays: { min: 3, max: 5 },
    freeShippingThreshold: FREE_SHIP_LEGO,
    unitPrice: { value: 0.11, unit: 'piece' },
    capturedAt: CAPTURED,
    source: 'manual',
  },

  // --- Minecraft Creeper Plush 8" (RRP $14.99) ---
  {
    productId: 'minecraft-creeper-plush-8in',
    storeId: 'amazon',
    price: 14.99,
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B08HR84LWQ',
    inStock: true,
    shippingDays: { min: 1, max: 2 },
    freeShippingThreshold: FREE_SHIP_AMAZON,
    capturedAt: CAPTURED,
    source: 'manual',
  },

  {
    productId: 'minecraft-creeper-plush-8in',
    storeId: 'walmart',
    price: 14.99,
    currency: 'USD',
    url: 'https://www.walmart.com/ip/Minecraft-Basic-Plush-Creeper-Stuffed-Animal-8-inch-Soft-Doll-Inspired-by-Video-Game-Character/277349703',
    inStock: true,
    shippingDays: { min: 2, max: 4 },
    freeShippingThreshold: FREE_SHIP_WALMART,
    capturedAt: CAPTURED,
    source: 'manual',
  },

  // --- Minecraft Creeper Jumbo Plush 16" (RRP $24.99) ---
  {
    productId: 'minecraft-creeper-plush-16in',
    storeId: 'amazon',
    price: 24.99,
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B0CNJGRZVH',
    inStock: true,
    shippingDays: { min: 1, max: 2 },
    freeShippingThreshold: FREE_SHIP_AMAZON,
    capturedAt: CAPTURED,
    source: 'manual',
  },
  {
    productId: 'minecraft-creeper-plush-16in',
    storeId: 'walmart',
    price: 24.99,
    currency: 'USD',
    url: 'https://www.walmart.com/ip/Minecraft-Creeper-16-in-Scale-Jumbo-Plush-Figure-with-Pixelated-Design-Game/12909910834',
    inStock: true,
    shippingDays: { min: 2, max: 4 },
    freeShippingThreshold: FREE_SHIP_WALMART,
    capturedAt: CAPTURED,
    source: 'manual',
  },

  // --- Minecraft Cuutopia Creeper Plush 10" (RRP $19.99) ---
  {
    productId: 'minecraft-cuutopia-creeper-plush',
    storeId: 'amazon',
    price: 19.99,
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B09QLGYM6T',
    inStock: true,
    shippingDays: { min: 1, max: 2 },
    freeShippingThreshold: FREE_SHIP_AMAZON,
    capturedAt: CAPTURED,
    source: 'manual',
  },
  {
    productId: 'minecraft-cuutopia-creeper-plush',
    storeId: 'target',
    price: 19.99,
    currency: 'USD',
    url: 'https://www.target.com/p/mattel-minecraft-cuutopia-creeper-plush-10-inch-soft-rounded-pillow-doll/-/A-1001588773',
    inStock: true,
    shippingDays: { min: 2, max: 4 },
    freeShippingThreshold: FREE_SHIP_TARGET,
    capturedAt: CAPTURED,
    source: 'manual',
  },

  // --- Minecraft — Nintendo Switch (RRP $29.99) ---
  {
    productId: 'minecraft-game-switch',
    storeId: 'amazon',
    price: 29.99,
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B07D13QGXM',
    inStock: true,
    shippingDays: { min: 1, max: 2 },
    freeShippingThreshold: FREE_SHIP_AMAZON,
    capturedAt: CAPTURED,
    source: 'manual',
  },
  {
    productId: 'minecraft-game-switch',
    storeId: 'target',
    price: 29.99,
    currency: 'USD',
    url: 'https://www.target.com/p/minecraft-nintendo-switch/-/A-53662394',
    inStock: true,
    shippingDays: { min: 2, max: 4 },
    freeShippingThreshold: FREE_SHIP_TARGET,
    capturedAt: CAPTURED,
    source: 'manual',
  },

  // --- Beyblade X Xtreme Battle Set (RRP $39.99) ---
  {
    productId: 'beyblade-x-xtreme-battle-set',
    storeId: 'amazon',
    price: 39.99,
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B0CQ3HMP9M',
    inStock: true,
    shippingDays: { min: 1, max: 2 },
    freeShippingThreshold: FREE_SHIP_AMAZON,
    capturedAt: CAPTURED,
    source: 'manual',
  },
  {
    productId: 'beyblade-x-xtreme-battle-set',
    storeId: 'walmart',
    price: 39.99,
    currency: 'USD',
    url: 'https://www.walmart.com/ip/Beyblade-X-Xtreme-Battle-Set-with-Beystadium-2-Right-Spinning-Battling-Tops-and-2-Launchers/5455100107',
    inStock: true,
    shippingDays: { min: 2, max: 4 },
    freeShippingThreshold: FREE_SHIP_WALMART,
    capturedAt: CAPTURED,
    source: 'manual',
  },

  // --- Beyblade X Drop Attack Battle Set (RRP $39.99) ---
  {
    productId: 'beyblade-x-drop-attack-battle-set',
    storeId: 'amazon',
    price: 39.99,
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B0DN6YTNYZ',
    inStock: true,
    shippingDays: { min: 1, max: 2 },
    freeShippingThreshold: FREE_SHIP_AMAZON,
    capturedAt: CAPTURED,
    source: 'manual',
  },
  {
    productId: 'beyblade-x-drop-attack-battle-set',
    storeId: 'target',
    price: 39.99,
    currency: 'USD',
    url: 'https://www.target.com/p/beyblade-x-drop-attack-battle-set/-/A-93565570',
    inStock: true,
    shippingDays: { min: 2, max: 4 },
    freeShippingThreshold: FREE_SHIP_TARGET,
    capturedAt: CAPTURED,
    source: 'manual',
  },

  // --- Beyblade X Sword Dran 3-60F Starter Pack (RRP $9.99) ---
  {
    productId: 'beyblade-x-sword-dran-starter',
    storeId: 'amazon',
    price: 9.99,
    currency: 'USD',
    url: 'https://www.amazon.com/dp/B0CS8L1HGM',
    inStock: true,
    shippingDays: { min: 1, max: 2 },
    freeShippingThreshold: FREE_SHIP_AMAZON,
    capturedAt: CAPTURED,
    source: 'manual',
  },
  {
    productId: 'beyblade-x-sword-dran-starter',
    storeId: 'gamestop',
    price: 9.99,
    currency: 'USD',
    url: 'https://www.gamestop.com/toys-games/fidget-toys/products/hasbro-beyblade-x-dran-3-60f-starter-pack/20010503.html',
    inStock: true,
    shippingDays: { min: 3, max: 6 },
    freeShippingThreshold: FREE_SHIP_GAMESTOP,
    capturedAt: CAPTURED,
    source: 'manual',
  },
];

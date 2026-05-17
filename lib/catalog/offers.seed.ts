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
];

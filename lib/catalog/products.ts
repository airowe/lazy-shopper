import type { Product } from './types';

// V1 seed catalog. Every product is audit-verified (May 2026): real name,
// real LEGO set number / ASIN, released and buyable today.
//
// This file is the single source of truth. scripts/crawl_prices.py derives
// retailer URLs from each product's `identifiers` and regenerates offers.ts
// — no separate fetch plan. `rrp` is the approximate list price used for
// scrape noise-rejection.
export const PRODUCTS: Product[] = [
  // --- LEGO Minecraft ---
  {
    id: 'lego-21261-wolf-stronghold',
    name: 'LEGO Minecraft The Wolf Stronghold 21261',
    category: 'minecraft',
    subcategory: 'Lego Set',
    brand: 'LEGO',
    imageUrl: 'https://www.lego.com/cdn/cs/set/assets/21261.png',
    ageRange: { min: 8 },
    pieceCount: 312,
    releaseYear: 2024,
    rrp: 34.99,
    identifiers: { legoSetNumber: '21261', asin: 'B0CV2KC5RL' },
  },
  {
    id: 'lego-21260-cherry-blossom-garden',
    name: 'LEGO Minecraft The Cherry Blossom Garden 21260',
    category: 'minecraft',
    subcategory: 'Lego Set',
    brand: 'LEGO',
    imageUrl: 'https://www.lego.com/cdn/cs/set/assets/21260.png',
    ageRange: { min: 8 },
    pieceCount: 304,
    releaseYear: 2024,
    rrp: 27.99,
    identifiers: { legoSetNumber: '21260', asin: 'B0CV297ML5' },
  },

  // --- LEGO Star Wars ---
  {
    id: 'lego-75387-boarding-tantive-iv',
    name: 'LEGO Star Wars Boarding the Tantive IV 75387',
    category: 'lego',
    subcategory: 'Lego Set',
    brand: 'LEGO',
    imageUrl: 'https://www.lego.com/cdn/cs/set/assets/75387.png',
    ageRange: { min: 8 },
    pieceCount: 502,
    releaseYear: 2024,
    rrp: 54.99,
    identifiers: { legoSetNumber: '75387', asin: 'B0CGY4QJTC' },
  },

  // --- Minecraft (non-Lego) ---
  {
    id: 'minecraft-creeper-plush-8in',
    name: 'Minecraft Creeper Plush 8" (Mattel)',
    category: 'minecraft',
    subcategory: 'Plush',
    brand: 'Mattel',
    imageUrl:
      'https://m.media-amazon.com/images/I/minecraft-creeper-8.jpg',
    ageRange: { min: 3 },
    releaseYear: 2021,
    rrp: 14.99,
    identifiers: { asin: 'B08HR84LWQ' },
    retailerUrls: { walmart: 'https://www.walmart.com/ip/Minecraft-Basic-Plush-Creeper-Stuffed-Animal-8-inch-Soft-Doll-Inspired-by-Video-Game-Character/277349703' },
  },
  {
    id: 'minecraft-creeper-plush-16in',
    name: 'Minecraft Creeper Jumbo Plush 16" (Mattel)',
    category: 'minecraft',
    subcategory: 'Plush',
    brand: 'Mattel',
    imageUrl:
      'https://m.media-amazon.com/images/I/minecraft-creeper-16.jpg',
    ageRange: { min: 3 },
    releaseYear: 2023,
    rrp: 24.99,
    identifiers: { asin: 'B0CNJGRZVH' },
    retailerUrls: { walmart: 'https://www.walmart.com/ip/Minecraft-Creeper-16-in-Scale-Jumbo-Plush-Figure-with-Pixelated-Design-Game/12909910834' },
  },
  {
    id: 'minecraft-cuutopia-creeper-plush',
    name: 'Minecraft Cuutopia Creeper Plush 10" (Mattel)',
    category: 'minecraft',
    subcategory: 'Plush',
    brand: 'Mattel',
    imageUrl:
      'https://m.media-amazon.com/images/I/minecraft-cuutopia.jpg',
    ageRange: { min: 3 },
    releaseYear: 2022,
    rrp: 19.99,
    identifiers: { asin: 'B09QLGYM6T' },
    retailerUrls: { target: 'https://www.target.com/p/mattel-minecraft-cuutopia-creeper-plush-10-inch-soft-rounded-pillow-doll/-/A-1001588773' },
  },
  {
    id: 'minecraft-game-switch',
    name: 'Minecraft — Nintendo Switch',
    category: 'minecraft',
    subcategory: 'Game',
    brand: 'Mojang',
    imageUrl:
      'https://assets.nintendo.com/image/upload/minecraft-switch-boxart.png',
    ageRange: { min: 10 },
    releaseYear: 2018,
    rrp: 29.99,
    identifiers: { asin: 'B07D13QGXM' },
    retailerUrls: { target: 'https://www.target.com/p/minecraft-nintendo-switch/-/A-53662394' },
  },

  // --- Beyblade X ---
  {
    id: 'beyblade-x-xtreme-battle-set',
    name: 'Beyblade X Xtreme Battle Set (Stadium + 2 Tops + 2 Launchers)',
    category: 'beyblade',
    subcategory: 'Battle Set',
    brand: 'Hasbro',
    imageUrl: 'https://m.media-amazon.com/images/I/beyblade-x-xtreme.jpg',
    ageRange: { min: 8 },
    releaseYear: 2024,
    rrp: 39.99,
    identifiers: { asin: 'B0CQ3HMP9M' },
    retailerUrls: { walmart: 'https://www.walmart.com/ip/Beyblade-X-Xtreme-Battle-Set-with-Beystadium-2-Right-Spinning-Battling-Tops-and-2-Launchers/5455100107' },
  },
  {
    id: 'beyblade-x-drop-attack-battle-set',
    name: 'Beyblade X Drop Attack Battle Set (Stadium + 2 Tops + 2 Launchers)',
    category: 'beyblade',
    subcategory: 'Battle Set',
    brand: 'Hasbro',
    imageUrl: 'https://m.media-amazon.com/images/I/beyblade-x-drop.jpg',
    ageRange: { min: 8 },
    releaseYear: 2024,
    rrp: 39.99,
    identifiers: { asin: 'B0DN6YTNYZ' },
    retailerUrls: { target: 'https://www.target.com/p/beyblade-x-drop-attack-battle-set/-/A-93565570' },
  },
  {
    id: 'beyblade-x-sword-dran-starter',
    name: 'Beyblade X Sword Dran 3-60F Starter Pack',
    category: 'beyblade',
    subcategory: 'Top',
    brand: 'Hasbro',
    imageUrl: 'https://m.media-amazon.com/images/I/beyblade-sword-dran.jpg',
    ageRange: { min: 8 },
    releaseYear: 2024,
    rrp: 9.99,
    identifiers: { asin: 'B0CS8L1HGM' },
  },
];

export const getProduct = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);
